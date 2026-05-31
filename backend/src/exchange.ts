import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();
const db = initDb();

// Get current price and history with timeframe support
router.get('/rate', (req, res) => {
  const timeframe = req.query.timeframe as string || '1h'; // '1h', '1d', '1w', '1m'
  
  let limit = 60; // Default to last 60 points
  let filter = '';
  
  if (timeframe === '1d') limit = 144; // Approx every 10 mins for 24h
  if (timeframe === '1w') limit = 168; // Approx every hour for 7 days
  if (timeframe === '1m') limit = 120; // Approx every 6 hours for 30 days

  // Simplified for prototype: we just take N most recent points. 
  // In a real app we would aggregate by time (avg per hour, etc)
  db.all('SELECT * FROM exchange_rates ORDER BY timestamp DESC LIMIT ?', [limit], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching rate' });
    res.json({
      current: rows[0],
      history: rows.reverse()
    });
  });
});

// Buy Toros (TRS) with Vestias (VST)
router.post('/buy-trs', verifyToken, (req: any, res) => {
  const { amountVST } = req.body; // How many VST user wants to spend
  const userId = req.userId;

  db.get('SELECT price FROM exchange_rates ORDER BY timestamp DESC LIMIT 1', [], (err, rate: any) => {
    if (err || !rate) return res.status(500).json({ message: 'Price unavailable' });

    db.get('SELECT vestias, points FROM users WHERE id = ?', [userId], (err, user: any) => {
      if (err || !user) return res.status(404).json({ message: 'User not found' });
      
      if (user.vestias < amountVST) return res.status(400).json({ message: 'Saldo de Vestias insuficiente' });

      const trsToReceive = Math.floor(amountVST / rate.price);
      if (trsToReceive <= 0) return res.status(400).json({ message: 'El monto es demasiado bajo para recibir al menos 1 TRS' });
      
      const actualVSTCost = trsToReceive * rate.price;

      db.serialize(() => {
        db.run(
          'UPDATE users SET vestias = vestias - ?, points = points + ? WHERE id = ?', 
          [actualVSTCost, trsToReceive, userId],
          (err: any) => {
            if (err) return res.status(500).json({ message: 'Error en la base de datos' });
            
            // Record transaction
            db.run(
              'INSERT INTO exchange_transactions (user_id, type, amount_trs, amount_vst, price) VALUES (?, ?, ?, ?, ?)',
              [userId, 'buy', trsToReceive, actualVSTCost, rate.price]
            );

            res.json({ 
              message: `Has comprado ${trsToReceive} TRS por ${actualVSTCost.toFixed(2)} VST`, 
              trsReceived: trsToReceive, 
              newVST: user.vestias - actualVSTCost,
              type: 'points'
            });
          }
        );
      });
    });
  });
});

// Sell Toros (TRS) for Vestias (VST)
router.post('/sell-trs', verifyToken, (req: any, res) => {
  const { amountTRS } = req.body; // How many TRS user wants to sell
  const userId = req.userId;

  db.get('SELECT price FROM exchange_rates ORDER BY timestamp DESC LIMIT 1', [], (err, rate: any) => {
    if (err || !rate) return res.status(500).json({ message: 'Precio no disponible' });

    db.get('SELECT vestias, points FROM users WHERE id = ?', [userId], (err, user: any) => {
      if (err || !user) return res.status(404).json({ message: 'Usuario no encontrado' });
      
      if (user.points < amountTRS) return res.status(400).json({ message: 'Saldo de Toros insuficiente' });

      const vstToReceive = amountTRS * rate.price;
      
      db.serialize(() => {
        db.run(
          'UPDATE users SET points = points - ?, vestias = vestias + ? WHERE id = ?', 
          [amountTRS, vstToReceive, userId],
          (err: any) => {
            if (err) return res.status(500).json({ message: 'Error en la base de datos' });

            // Record transaction
            db.run(
              'INSERT INTO exchange_transactions (user_id, type, amount_trs, amount_vst, price) VALUES (?, ?, ?, ?, ?)',
              [userId, 'sell', amountTRS, vstToReceive, rate.price]
            );

            res.json({ 
              message: `Has vendido ${amountTRS} TRS por ${vstToReceive.toFixed(2)} VST`, 
              vstReceived: vstToReceive, 
              newTRS: user.points - amountTRS,
              type: 'vestias'
            });
          }
        );
      });
    });
  });
});

// Get user transaction history
router.get('/transactions', verifyToken, (req: any, res) => {
  const userId = req.userId;
  db.all(
    'SELECT * FROM exchange_transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 50',
    [userId],
    (err: any, rows: any[]) => {
      if (err) return res.status(500).json({ message: 'Error fetching transactions' });
      res.json(rows);
    }
  );
});

// --- ADMIN ENDPOINTS ---

// Get all price orders
router.get('/admin/orders', verifyToken, verifyAdmin, (req, res) => {
  db.all('SELECT * FROM price_orders ORDER BY created_at DESC', [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching orders' });
    res.json(rows);
  });
});

// Create price order
router.post('/admin/orders', verifyToken, verifyAdmin, (req, res) => {
  const { target_percentage, duration_minutes } = req.body;
  
  db.run(
    'INSERT INTO price_orders (target_percentage, duration_minutes, status) VALUES (?, ?, ?)',
    [target_percentage, duration_minutes, 'pending'],
    function(this: any, err: any) {
      if (err) return res.status(500).json({ message: 'Error creating order' });
      res.json({ id: this.lastID, message: 'Order created successfully' });
    }
  );
});

// Delete order
router.delete('/admin/orders/:id', verifyToken, verifyAdmin, (req, res) => {
  db.run('DELETE FROM price_orders WHERE id = ? AND status = "pending"', [req.params.id], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting order' });
    res.json({ message: 'Order deleted successfully' });
  });
});

export default router;
