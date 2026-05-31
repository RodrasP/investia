import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDb } from './db.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const db = initDb();

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  }
});

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'secret') {
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: JWT_SECRET NOT SET IN PRODUCTION');
      process.exit(1);
    }
    return 'dev-secret-unsafe';
  }
  return secret;
};

// Middleware to verify token
export const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
};

// Middleware to verify admin role
export const verifyAdmin = (req: any, res: any, next: any) => {
  const userId = req.userId;
  if (!userId) {
    console.error("verifyAdmin: No userId in request");
    return res.status(401).json({ message: "User ID missing from token" });
  }

  db.get("SELECT id, role FROM users WHERE id = ?", [userId], (err: any, user: any) => {
    if (err) {
      console.error("verifyAdmin database error:", err);
      return res.status(500).json({ message: "Internal server error during admin verification" });
    }
    
    if (!user) {
      console.warn(`verifyAdmin: User with ID ${userId} not found in database`);
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      next();
    } else {
      console.warn(`Access denied for user ID ${userId} (${user.id}): Not an admin (Role: ${user.role})`);
      res.status(403).json({ message: "Require Admin Role" });
    }
  });
};

// Register
router.post('/register', (req: any, res: any) => {
  const { email, password, name } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  db.run(
    'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
    [email, hashedPassword, name],
    function (this: any, err: any) {
      if (err) {
        return res.status(500).json({ message: 'Error registering user' });
      }
      const token = jwt.sign({ id: this.lastID }, getJwtSecret(), { expiresIn: '24h' });
      res.json({ token, user: { id: this.lastID, email, name, points: 0, role: 'user' } });
    }
  );
});

// Get profile (Refresh user data)
router.get('/profile', verifyToken, (req: any, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, user: any) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });
    const { password, ...userData } = user;
    res.json(userData);
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err: any, user: any) => {
    if (err || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ token: null, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id }, getJwtSecret(), { expiresIn: '24h' });
    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        telegram_user: user.telegram_user,
        avatar_url: user.avatar_url,
        points: user.points, 
        vestias: user.vestias,
        level: user.level,
        xp: user.xp,
        lives: user.lives,
        role: user.role,
        subscription_status: user.subscription_status,
        subscription_expiry: user.subscription_expiry,
        auto_renew: user.auto_renew
      }
    });
  });
});

// Update profile
router.patch('/profile', verifyToken, (req: any, res: any) => {
  const { name, phone, bio, location, telegram_user, avatar_url } = req.body;
  const userId = req.userId;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  db.run(
    'UPDATE users SET name = ?, phone = ?, bio = ?, location = ?, telegram_user = ?, avatar_url = ? WHERE id = ?', 
    [name, phone || null, bio || null, location || null, telegram_user || null, avatar_url || null, userId], 
    (err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating profile' });
      }
      res.json({ message: 'Profile updated successfully', name, phone, bio, location, telegram_user, avatar_url });
    }
  );
});

// Upload avatar
router.post('/profile/avatar', verifyToken, upload.single('avatar'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const userId = req.userId;

  db.run('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId], (err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating avatar' });
    }
    res.json({ message: 'Avatar updated successfully', avatar_url: avatarUrl });
  });
});

// Toggle auto-renew
router.patch('/subscription/auto-renew', verifyToken, (req: any, res: any) => {
  const { autoRenew } = req.body;
  const userId = req.userId;

  db.run('UPDATE users SET auto_renew = ? WHERE id = ?', [autoRenew ? 1 : 0, userId], (err: any) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating auto-renewal' });
    }
    res.json({ message: 'Auto-renewal updated', auto_renew: autoRenew });
  });
});

// Update password
router.patch('/password', verifyToken, (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new password are required' });
  }

  db.get('SELECT password FROM users WHERE id = ?', [userId], (err: any, user: any) => {
    if (err || !user) {
      return res.status(500).json({ message: 'Error finding user' });
    }

    const passwordIsValid = bcrypt.compareSync(currentPassword, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 8);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId], (err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Error updating password' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

export default router;
