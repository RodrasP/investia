import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();
const db = initDb();

// Get mystery box settings
router.get('/mystery-box/settings', (req, res) => {
  db.get('SELECT * FROM mystery_box_settings WHERE id = ?', ['default'], (err, row) => {
    if (err) return res.status(500).json({ message: 'Error fetching settings' });
    res.json(row);
  });
});

// Update mystery box settings (Admin only)
router.put('/mystery-box/settings', verifyToken, verifyAdmin, (req, res) => {
  const { cost, jackpot_amount, jackpot_prob, normal_amount, normal_prob, life_prob, nothing_prob } = req.body;
  db.run(`
    UPDATE mystery_box_settings 
    SET cost = ?, jackpot_amount = ?, jackpot_prob = ?, normal_amount = ?, normal_prob = ?, life_prob = ?, nothing_prob = ?
    WHERE id = ?
  `, [cost, jackpot_amount, jackpot_prob, normal_amount, normal_prob, life_prob, nothing_prob, 'default'], (err) => {
    if (err) return res.status(500).json({ message: 'Error updating settings' });
    res.json({ message: 'Settings updated successfully' });
  });
});

// Get shop items (Public)
router.get('/items', (req, res) => {
  db.all('SELECT * FROM shop_items', [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching shop items' });
    
    // If no items exist, seed defaults
    if (!rows || rows.length === 0) {
      const defaults = [
        ['points', 1000, 9.99, 7.99, 'Pack de Puntos Básico', 'Basic Points Pack'],
        ['points', 5000, 39.99, 31.99, 'Pack de Puntos Pro', 'Pro Points Pack'],
        ['lives', 5, 4.99, 3.99, 'Pack de Vidas', 'Lives Pack']
      ];
      
      let completed = 0;
      defaults.forEach(d => {
        db.run(
          'INSERT INTO shop_items (type, amount, price, price_premium, label, label_en) VALUES (?, ?, ?, ?, ?, ?)',
          d,
          () => {
            completed++;
            if (completed === defaults.length) {
              db.all('SELECT * FROM shop_items', [], (err2, finalRows) => {
                res.json(finalRows);
              });
            }
          }
        );
      });
      return;
    }
    
    res.json(rows);
  });
});

// Create shop item (Admin)
router.post('/items', verifyToken, verifyAdmin, (req, res) => {
  const { type, amount, price, price_premium, label, label_en } = req.body;
  db.run(
    'INSERT INTO shop_items (type, amount, price, price_premium, label, label_en) VALUES (?, ?, ?, ?, ?, ?)',
    [type, amount, price, price_premium, label, label_en],
    function(this: any, err: any) {
      if (err) return res.status(500).json({ message: 'Error creating shop item' });
      res.json({ id: this.lastID, type, amount, price, price_premium, label, label_en });
    }
  );
});

// Update shop item (Admin)
router.put('/items/:id', verifyToken, verifyAdmin, (req, res) => {
  const { type, amount, price, price_premium, label, label_en } = req.body;
  db.run(
    'UPDATE shop_items SET type = ?, amount = ?, price = ?, price_premium = ?, label = ?, label_en = ? WHERE id = ?',
    [type, amount, price, price_premium, label, label_en, req.params.id],
    (err: any) => {
      if (err) return res.status(500).json({ message: 'Error updating shop item' });
      res.json({ message: 'Shop item updated successfully' });
    }
  );
});

// Delete shop item (Admin)
router.delete('/items/:id', verifyToken, verifyAdmin, (req, res) => {
  db.run('DELETE FROM shop_items WHERE id = ?', [req.params.id], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting shop item' });
    res.json({ message: 'Shop item deleted successfully' });
  });
});

// Purchase item
router.post('/purchase', verifyToken, (req: any, res) => {
  const { itemId } = req.body;
  const userId = req.userId;

  db.get('SELECT * FROM shop_items WHERE id = ?', [itemId], (err: any, item: any) => {
    if (err) return res.status(500).json({ message: 'Error fetching shop item' });
    
    // Handle fallback for prototype if DB is empty but UI shows defaults
    if (!item) {
        // Simple logic for prototype defaults
        let amount = 0;
        let type = '';
        if (itemId == 1) { amount = 1000; type = 'points'; }
        else if (itemId == 2) { amount = 5000; type = 'points'; }
        else if (itemId == 3) { amount = 5; type = 'lives'; }
        else return res.status(404).json({ message: 'Item not found' });
        
        item = { type, amount };
    }

    db.get('SELECT subscription_status, points, lives FROM users WHERE id = ?', [userId], (err: any, user: any) => {
      if (err || !user) return res.status(404).json({ message: 'User not found' });
      
      if (item.type === 'points') {
        db.run('UPDATE users SET points = points + ? WHERE id = ?', [item.amount, userId], (err: any) => {
          if (err) return res.status(500).json({ message: 'Error processing purchase' });
          res.json({ message: 'Purchase successful', points: user.points + item.amount, type: 'points' });
        });
      } else if (item.type === 'lives') {
        db.run('UPDATE users SET lives = lives + ? WHERE id = ?', [item.amount, userId], (err: any) => {
          if (err) return res.status(500).json({ message: 'Error processing purchase' });
          res.json({ message: 'Purchase successful', lives: user.lives + item.amount, type: 'lives' });
        });
      }
    });
  });
});

export default router;
