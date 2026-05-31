import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();
const db = initDb();

// --- CATEGORIES ---

// Get all categories (Public)
router.get('/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching categories' });
    res.json(rows || []);
  });
});

// Create category (Admin)
router.post('/categories', verifyToken, verifyAdmin, (req, res) => {
  const { name, name_en } = req.body;
  db.run('INSERT INTO categories (name, name_en) VALUES (?, ?)', [name, name_en], function(this: any, err: any) {
    if (err) return res.status(500).json({ message: 'Error creating category' });
    res.json({ id: this.lastID, name, name_en });
  });
});

// Update category (Admin)
router.put('/categories/:id', verifyToken, verifyAdmin, (req, res) => {
  const { name, name_en } = req.body;
  db.run('UPDATE categories SET name = ?, name_en = ? WHERE id = ?', [name, name_en, req.params.id], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating category' });
    res.json({ message: 'Category updated successfully' });
  });
});

// Delete category (Admin)
router.delete('/categories/:id', verifyToken, verifyAdmin, (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting category' });
    res.json({ message: 'Category deleted successfully' });
  });
});

// --- TRANSLATIONS ---

// Get all translations (Public)
router.get('/translations', (req, res) => {
  db.all('SELECT * FROM translations', [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching translations' });
    res.json(rows || []);
  });
});

// Create or update translation (Admin)
router.post('/translations', verifyToken, verifyAdmin, (req, res) => {
  const { key, es, en } = req.body;
  db.run('INSERT OR REPLACE INTO translations (key, es, en) VALUES (?, ?, ?)', [key, es, en], function(this: any, err: any) {
    if (err) return res.status(500).json({ message: 'Error saving translation' });
    res.json({ message: 'Translation saved successfully' });
  });
});

// Delete translation (Admin)
router.delete('/translations/:key', verifyToken, verifyAdmin, (req, res) => {
  db.run('DELETE FROM translations WHERE key = ?', [req.params.key], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting translation' });
    res.json({ message: 'Translation deleted successfully' });
  });
});

// --- GENERAL SETTINGS ---

// Get all settings (Admin)
router.get('/', verifyToken, verifyAdmin, (req, res) => {
  db.all('SELECT * FROM settings', [], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching settings' });
    const settingsMap = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    res.json(settingsMap);
  });
});

// Update setting (Admin)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) return res.status(400).json({ message: 'Key and value are required' });
  
  db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error saving setting' });
    res.json({ message: 'Setting saved successfully' });
  });
});

// --- COOKIE SETTINGS ---

// Get cookie settings (Public)
router.get('/cookies', (req, res) => {
  db.get('SELECT * FROM cookie_settings ORDER BY id DESC LIMIT 1', [], (err: any, row: any) => {
    if (err) return res.status(500).json({ message: 'Error fetching cookie settings' });
    res.json(row || {});
  });
});

// Update cookie settings (Admin)
router.post('/cookies', verifyToken, verifyAdmin, (req, res) => {
  const { 
    title, description, accept_all_text, reject_all_text, save_preferences_text,
    essential_title, essential_desc, analytics_title, analytics_desc,
    marketing_title, marketing_desc, policy_link_text, policy_link_url 
  } = req.body;

  db.run(`UPDATE cookie_settings SET 
    title = ?, description = ?, accept_all_text = ?, reject_all_text = ?, save_preferences_text = ?,
    essential_title = ?, essential_desc = ?, analytics_title = ?, analytics_desc = ?,
    marketing_title = ?, marketing_desc = ?, policy_link_text = ?, policy_link_url = ?
    WHERE id = (SELECT id FROM cookie_settings ORDER BY id DESC LIMIT 1)`,
    [
      title, description, accept_all_text, reject_all_text, save_preferences_text,
      essential_title, essential_desc, analytics_title, analytics_desc,
      marketing_title, marketing_desc, policy_link_text, policy_link_url
    ], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error updating cookie settings' });
      res.json({ message: 'Cookie settings updated successfully' });
    });
});

export default router;
