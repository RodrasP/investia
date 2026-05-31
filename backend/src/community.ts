import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();
const db = initDb();

// Delete a thread (Admin only)
router.delete('/threads/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM threads WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting thread' });
    // Also delete associated replies
    db.run('DELETE FROM replies WHERE thread_id = ?', [id]);
    res.json({ message: 'Thread deleted successfully' });
  });
});

// Delete a reply (Admin only)
router.delete('/replies/:id', verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM replies WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting reply' });
    res.json({ message: 'Reply deleted successfully' });
  });
});

// Get all categories
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM community_categories ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching categories' });
    res.json(rows);
  });
});

// Get threads by category
router.get('/threads/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  db.all(`
    SELECT t.*, u.name as user_name, u.avatar_url as user_avatar, u.level as user_level,
    (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count
    FROM threads t
    JOIN users u ON t.user_id = u.id
    WHERE t.category_id = ?
    ORDER BY t.is_pinned DESC, t.updated_at DESC
  `, [categoryId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching threads' });
    res.json(rows);
  });
});

// Get recent threads (for community home)
router.get('/threads/recent', (req, res) => {
  db.all(`
    SELECT t.*, u.name as user_name, u.avatar_url as user_avatar, u.level as user_level,
    c.name as category_name, c.name_en as category_name_en,
    (SELECT COUNT(*) FROM replies WHERE thread_id = t.id) as reply_count
    FROM threads t
    JOIN users u ON t.user_id = u.id
    JOIN community_categories c ON t.category_id = c.id
    ORDER BY t.created_at DESC
    LIMIT 10
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching recent threads' });
    res.json(rows);
  });
});

// Get thread details and replies
router.get('/thread/:id', (req, res) => {
  const { id } = req.params;
  
  // Increment view count
  db.run('UPDATE threads SET views = views + 1 WHERE id = ?', [id]);

  db.get(`
    SELECT t.*, u.name as user_name, u.avatar_url as user_avatar, u.level as user_level, u.xp as user_xp
    FROM threads t
    JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
  `, [id], (err, thread: any) => {
    if (err || !thread) return res.status(404).json({ message: 'Thread not found' });

    db.all(`
      SELECT r.*, u.name as user_name, u.avatar_url as user_avatar, u.level as user_level, u.xp as user_xp
      FROM replies r
      JOIN users u ON r.user_id = u.id
      WHERE r.thread_id = ?
      ORDER BY r.created_at ASC
    `, [id], (err2, replies) => {
      if (err2) return res.status(500).json({ message: 'Error fetching replies' });
      res.json({ ...thread, replies });
    });
  });
});

// Create new thread
router.post('/threads', verifyToken, (req: any, res) => {
  const { categoryId, title, content } = req.body;
  const userId = req.userId;

  if (!title || !content || !categoryId) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  db.run(`
    INSERT INTO threads (category_id, user_id, title, content)
    VALUES (?, ?, ?, ?)
  `, [categoryId, userId, title, content], function(this: any, err) {
    if (err) return res.status(500).json({ message: 'Error creating thread' });
    res.json({ id: this.lastID, message: 'Thread created successfully' });
  });
});

// Post reply
router.post('/replies', verifyToken, (req: any, res) => {
  const { threadId, content } = req.body;
  const userId = req.userId;

  if (!content || !threadId) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  db.run(`
    INSERT INTO replies (thread_id, user_id, content)
    VALUES (?, ?, ?)
  `, [threadId, userId, content], function(this: any, err) {
    if (err) return res.status(500).json({ message: 'Error posting reply' });
    
    // Update thread's updated_at timestamp
    db.run('UPDATE threads SET updated_at = (strftime("%Y-%m-%dT%H:%M:%SZ", "now")) WHERE id = ?', [threadId]);
    
    res.json({ id: this.lastID, message: 'Reply posted successfully' });
  });
});

// --- NOTIFICATIONS ---

router.get('/notifications', verifyToken, (req: any, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json(rows);
  });
});

router.put('/notifications/read-all', verifyToken, (req: any, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.userId], (err) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json({ message: 'Done' });
  });
});

// --- PERSONAL CHANNELS & APPLICATIONS ---

// Get my channel status or application
router.get('/my-channel-status', verifyToken, (req: any, res) => {
  const userId = req.userId;
  db.get('SELECT * FROM user_channels WHERE user_id = ?', [userId], (err, channel: any) => {
    if (err) return res.status(500).json({ message: 'Error' });
    
    db.get('SELECT * FROM channel_applications WHERE user_id = ? AND status != "approved" ORDER BY created_at DESC LIMIT 1', [userId], (err2, app: any) => {
      res.json({ channel, application: app });
    });
  });
});

// Create application for a channel
router.post('/apply-channel', verifyToken, (req: any, res) => {
  const userId = req.userId;
  const { reason } = req.body;

  db.get('SELECT id FROM channel_applications WHERE user_id = ? AND status = "pending"', [userId], (err, row) => {
    if (row) return res.status(400).json({ message: 'Ya tienes una solicitud pendiente' });

    db.run('INSERT INTO channel_applications (user_id) VALUES (?)', [userId], function(this: any) {
      const appId = this.lastID;
      db.run('INSERT INTO application_messages (application_id, sender_id, message) VALUES (?, ?, ?)', [appId, userId, reason]);
      
      // Notify admins
      db.all('SELECT id FROM users WHERE role = "admin"', [], (err, admins: any[]) => {
        admins.forEach(admin => {
          db.run('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)', 
            [admin.id, 'admin_alert', 'Nueva Solicitud de Canal', 'Un usuario ha solicitado crear un canal.', `/admin?view=channels&appId=${appId}`]);
        });
      });

      res.json({ message: 'Solicitud enviada' });
    });
  });
});

// Get application messages (ticket)
router.get('/application/:id/messages', verifyToken, (req: any, res) => {
  const { id } = req.params;
  db.all(`
    SELECT m.*, u.name as sender_name, u.role as sender_role 
    FROM application_messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.application_id = ?
    ORDER BY m.created_at ASC
  `, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json(rows);
  });
});

// Post message to application (User or Admin)
router.post('/application/:id/messages', verifyToken, (req: any, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.userId;

  db.run('INSERT INTO application_messages (application_id, sender_id, message) VALUES (?, ?, ?)', [id, userId, message], (err) => {
    if (err) return res.status(500).json({ message: 'Error' });
    
    // Notify the other party
    db.get('SELECT user_id FROM channel_applications WHERE id = ?', [id], (err2, app: any) => {
      if (!app) return;

      if (userId === app.user_id) {
        // User sent a message, notify all admins
        db.all('SELECT id FROM users WHERE role = "admin"', [], (err3, admins: any[]) => {
          admins.forEach(admin => {
            db.run('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)', 
              [admin.id, 'admin_message', 'Nuevo mensaje de solicitud', `El usuario ha enviado un mensaje en la solicitud #${id}.`, `/admin?view=channels&appId=${id}`]);
          });
        });
      } else {
        // Admin sent a message, notify the user
        db.run('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)', 
          [app.user_id, 'admin_message', 'Respuesta del Admin', 'Un administrador ha respondido a tu solicitud de canal.', '/community?tab=my-channel']);
      }
    });

    res.json({ message: 'Mensaje enviado' });
  });
});

// Admin: List all applications
router.get('/admin/applications', verifyToken, verifyAdmin, (req, res) => {
  db.all(`
    SELECT a.*, u.name as user_name, u.email as user_email
    FROM channel_applications a
    JOIN users u ON a.user_id = u.id
    ORDER BY a.created_at DESC
  `, [], (err, rows) => {
    res.json(rows);
  });
});

// Admin: Approve/Reject application
router.post('/admin/applications/:id/status', verifyToken, verifyAdmin, (req: any, res) => {
  const { id } = req.params;
  const { status, name, description, message } = req.body; // status: 'approved' or 'rejected'
  const adminId = req.userId;

  db.get('SELECT user_id FROM channel_applications WHERE id = ?', [id], (err, app: any) => {
    if (!app) return res.status(404).json({ message: 'Not found' });

    db.run('UPDATE channel_applications SET status = ?, updated_at = (strftime("%Y-%m-%dT%H:%M:%SZ", "now")) WHERE id = ?', [status, id], () => {
      if (status === 'approved') {
        db.run('INSERT INTO user_channels (user_id, name, description, status) VALUES (?, ?, ?, "approved")', 
          [app.user_id, name || 'Mi Canal', description || 'Espacio personal', 'approved']);
      }
      
      if (message) {
        db.run('INSERT INTO application_messages (application_id, sender_id, message) VALUES (?, ?, ?)', [id, adminId, message]);
      }
      
      db.run('INSERT INTO notifications (user_id, type, title, content, link) VALUES (?, ?, ?, ?, ?)', 
        [app.user_id, 'application_status', status === 'approved' ? '¡Canal Aprobado!' : 'Solicitud Rechazada', 
         status === 'approved' ? 'Tu canal ha sido aprobado. ¡Ya puedes publicar!' : 'Tu solicitud de canal ha sido denegada. Revisa los mensajes.', 
         '/community?tab=my-channel']);
      
      res.json({ message: 'Status updated' });
    });
  });
});

// Get or create my channel (Updated with status check)
router.get('/my-channel', verifyToken, (req: any, res) => {
  const userId = req.userId;
  db.get('SELECT * FROM user_channels WHERE user_id = ? AND status = "approved"', [userId], (err, channel: any) => {
    if (err) return res.status(500).json({ message: 'Error' });
    if (!channel) return res.status(403).json({ message: 'No tienes un canal aprobado' });
    res.json(channel);
  });
});

// List all discovery channels (Only approved)
router.get('/channels/discover', (req, res) => {
  db.all(`
    SELECT c.*, u.name as user_name, u.avatar_url as user_avatar,
    (SELECT COUNT(*) FROM channel_followers WHERE channel_id = c.id) as follower_count
    FROM user_channels c
    JOIN users u ON c.user_id = u.id
    WHERE c.status = 'approved'
    ORDER BY follower_count DESC
    LIMIT 20
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error' });
    res.json(rows);
  });
});

// Update my channel info (With status check)
router.put('/my-channel', verifyToken, (req: any, res) => {
  const userId = req.userId;
  const { name, description } = req.body;
  db.run('UPDATE user_channels SET name = ?, description = ? WHERE user_id = ? AND status = "approved"', [name, description, userId], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating channel' });
    res.json({ message: 'Channel updated' });
  });
});

// Post an update to my channel (With status check)
router.post('/my-channel/updates', verifyToken, (req: any, res) => {
  const userId = req.userId;
  const { content } = req.body;
  
  db.get('SELECT id FROM user_channels WHERE user_id = ? AND status = "approved"', [userId], (err, channel: any) => {
    if (!channel) return res.status(403).json({ message: 'Channel not approved' });
    
    db.run('INSERT INTO channel_updates (channel_id, content) VALUES (?, ?)', [channel.id, content], function(this: any) {
      res.json({ id: this.lastID, message: 'Update posted' });
    });
  });
});

// Get updates for a specific channel
router.get('/channels/:id/updates', (req, res) => {
  const { id } = req.params;
  // Ensure the channel is approved before showing updates
  db.get('SELECT status FROM user_channels WHERE id = ?', [id], (err, channel: any) => {
    if (channel?.status !== 'approved') return res.status(403).json({ message: 'Channel not approved' });
    
    db.all('SELECT * FROM channel_updates WHERE channel_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error' });
      res.json(rows);
    });
  });
});

export default router;
