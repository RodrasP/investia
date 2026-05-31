import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import authRouter from './auth.js';
import coursesRouter from './courses.js';
import adminRouter from './admin.js';
import paymentsRouter from './payments.js';
import settingsRouter from './settings.js';
import shopRouter from './shop.js';
import exchangeRouter from './exchange.js';
import cmsRouter from './cms.js';
import communityRouter from './community.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Security: Trust proxy (needed for rate limiting behind DDEV/Nginx)
app.set('trust proxy', 1);

// Security: Helmet for hardening HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, 
}));

// Security: Restrictive CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [
      'http://localhost:5173', 
      'http://localhost:5172', 
      'http://localhost:3000', 
      'https://investia.app'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || process.env.NODE_ENV !== 'production') return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.includes('localhost') || 
                      origin.endsWith('.ddev.site') ||
                      /^https?:\/\/.*\.ddev\.site(:\d+)?$/.test(origin);

    if (isAllowed) {
      return callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(null, true); // Still allow but warn in dev
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Security: Rate Limiting
const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 1000, // Limit each IP to 1000 requests per 15 minutes.
	standardHeaders: 'draft-7', 
	legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 1000, // Increased limit for development
	standardHeaders: 'draft-7',
	legacyHeaders: false,
  message: { message: 'Too many login/register attempts, please try again after 15 minutes' }
});

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/courses', generalLimiter, coursesRouter);
app.use('/api/admin', generalLimiter, adminRouter);
app.use('/api/payments', generalLimiter, paymentsRouter);
app.use('/api/settings', generalLimiter, settingsRouter);
app.use('/api/shop', generalLimiter, shopRouter);
app.use('/api/exchange', generalLimiter, exchangeRouter);
app.use('/api/pages', generalLimiter, cmsRouter);
app.use('/api/community', generalLimiter, communityRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Investia API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// --- PRICE ORACLE LOGIC ---
import { initDb } from './db.js';
const dbOracle = initDb();

const updatePrices = () => {
  dbOracle.serialize(() => {
    // 1. Process active orders
    dbOracle.all('SELECT * FROM price_orders WHERE status = "pending" OR status = "active"', [], (err, orders: any[]) => {
      if (err || !orders) return;

      dbOracle.get('SELECT price FROM exchange_rates ORDER BY timestamp DESC LIMIT 1', [], (err, current: any) => {
        if (err || !current) return;

        let totalDrift = 0;
        const now = new Date();

        orders.forEach(order => {
          if (order.status === 'pending') {
            const endAt = new Date(now.getTime() + order.duration_minutes * 60000);
            dbOracle.run('UPDATE price_orders SET status = "active", started_at = ?, end_at = ? WHERE id = ?', 
              [now.toISOString(), endAt.toISOString(), order.id]);
          } else if (order.status === 'active') {
            const endAt = new Date(order.end_at);
            if (now >= endAt) {
              dbOracle.run('UPDATE price_orders SET status = "completed" WHERE id = ?', [order.id]);
            } else {
              // Drift calculation: We want to reach target_percentage over duration_minutes
              // Every 10 seconds (our interval), we apply a fraction of that growth.
              const intervalsInDuration = order.duration_minutes * 6; // 6 intervals of 10s per minute
              const driftPerInterval = order.target_percentage / intervalsInDuration;
              totalDrift += driftPerInterval;
            }
          }
        });

        // 2. Realistic movement: Drift + Volatility (Brownian Motion-ish)
        // newPrice = currentPrice * (1 + drift + volatility * random)
        
        const driftMultiplier = 1 + (totalDrift / 100);
        
        // Volatility adds the "sawtooth" effect (up and down)
        // 1% volatility per update to keep it "alive"
        const volatility = 0.01; 
        const randomComponent = (Math.random() * 2 - 1) * volatility;
        
        const newPrice = current.price * driftMultiplier * (1 + randomComponent);

        if (newPrice !== current.price) {
          dbOracle.run('INSERT INTO exchange_rates (price) VALUES (?)', [newPrice]);
        }
      });
    });
  });
};

// Run every 10 seconds
setInterval(updatePrices, 10000);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
