import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../database.sqlite');

let dbInstance: sqlite3.Database | null = null;

export const initDb = () => {
  if (dbInstance) return dbInstance;

  // Handle both ESM and CJS import styles
  const sqlite = (sqlite3 as any).default || sqlite3;
  const db = new sqlite.Database(DB_PATH);
  dbInstance = db;

  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      bio TEXT,
      location TEXT,
      telegram_user TEXT,
      avatar_url TEXT,
      points INTEGER DEFAULT 0,
      role TEXT DEFAULT 'user',
      subscription_status TEXT DEFAULT 'free',
      subscription_expiry DATETIME,
      auto_renew BOOLEAN DEFAULT 1,
      stripe_customer_id TEXT,
      lives INTEGER DEFAULT 5,
      last_life_regen DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      vestias REAL DEFAULT 1000.0
    )`);

    // Migrations for existing users table
    db.all("PRAGMA table_info(users)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('subscription_status')) {
        db.run("ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'free'");
      }
      if (!columnNames.includes('stripe_customer_id')) {
        db.run("ALTER TABLE users ADD COLUMN stripe_customer_id TEXT");
      }
      if (!columnNames.includes('lives')) {
        db.run("ALTER TABLE users ADD COLUMN lives INTEGER DEFAULT 5");
      }
      if (!columnNames.includes('last_life_regen')) {
        db.run("ALTER TABLE users ADD COLUMN last_life_regen DATETIME DEFAULT '2026-05-18T00:00:00Z'");
      }
      if (!columnNames.includes('vestias')) {
        db.run("ALTER TABLE users ADD COLUMN vestias REAL DEFAULT 1000.0");
      }
      if (!columnNames.includes('phone')) {
        db.run("ALTER TABLE users ADD COLUMN phone TEXT");
      }
      if (!columnNames.includes('bio')) {
        db.run("ALTER TABLE users ADD COLUMN bio TEXT");
      }
      if (!columnNames.includes('location')) {
        db.run("ALTER TABLE users ADD COLUMN location TEXT");
      }
      if (!columnNames.includes('telegram_user')) {
        db.run("ALTER TABLE users ADD COLUMN telegram_user TEXT");
      }
      if (!columnNames.includes('avatar_url')) {
        db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT");
      }
      if (!columnNames.includes('subscription_expiry')) {
        db.run("ALTER TABLE users ADD COLUMN subscription_expiry DATETIME");
      }
      if (!columnNames.includes('auto_renew')) {
        db.run("ALTER TABLE users ADD COLUMN auto_renew BOOLEAN DEFAULT 1");
      }
      if (!columnNames.includes('xp')) {
        db.run("ALTER TABLE users ADD COLUMN xp INTEGER DEFAULT 0");
      }
      if (!columnNames.includes('level')) {
        db.run("ALTER TABLE users ADD COLUMN level INTEGER DEFAULT 1");
      }
      if (!columnNames.includes('seen_tutorials')) {
        db.run("ALTER TABLE users ADD COLUMN seen_tutorials TEXT DEFAULT ''");
      }
      if (!columnNames.includes('card_last4')) {
        db.run("ALTER TABLE users ADD COLUMN card_last4 TEXT");
        db.run("ALTER TABLE users ADD COLUMN card_exp_month TEXT");
        db.run("ALTER TABLE users ADD COLUMN card_exp_year TEXT");
        db.run("ALTER TABLE users ADD COLUMN card_brand TEXT");
      }
    });

    // Invoices table
    db.run(`CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      invoice_number TEXT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status TEXT DEFAULT 'paid',
      date DATETIME DEFAULT CURRENT_TIMESTAMP,
      pdf_url TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Courses table
    db.run(`CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT,
      description_en TEXT,
      category TEXT DEFAULT 'General',
      category_en TEXT DEFAULT 'General',
      category_id INTEGER,
      points_reward INTEGER DEFAULT 100,
      points_price INTEGER DEFAULT 0,
      visibility TEXT DEFAULT 'public',
      access_level TEXT DEFAULT 'free',
      difficulty TEXT DEFAULT 'beginner',
      icon TEXT,
      image_url TEXT,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )`);

    // Migration for existing courses table
    db.all("PRAGMA table_info(courses)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('visibility')) {
        db.run("ALTER TABLE courses ADD COLUMN visibility TEXT DEFAULT 'public'");
      }
      if (!columnNames.includes('access_level')) {
        db.run("ALTER TABLE courses ADD COLUMN access_level TEXT DEFAULT 'free'");
      }
      if (!columnNames.includes('difficulty')) {
        db.run("ALTER TABLE courses ADD COLUMN difficulty TEXT DEFAULT 'beginner'");
      }
      if (!columnNames.includes('title_en')) {
        db.run("ALTER TABLE courses ADD COLUMN title_en TEXT");
      }
      if (!columnNames.includes('description_en')) {
        db.run("ALTER TABLE courses ADD COLUMN description_en TEXT");
      }
      if (!columnNames.includes('points_price')) {
        db.run("ALTER TABLE courses ADD COLUMN points_price INTEGER DEFAULT 0");
      }
      if (!columnNames.includes('category')) {
        db.run("ALTER TABLE courses ADD COLUMN category TEXT DEFAULT 'General'");
      }
      if (!columnNames.includes('category_en')) {
        db.run("ALTER TABLE courses ADD COLUMN category_en TEXT DEFAULT 'General'");
      }
      if (!columnNames.includes('category_id')) {
        db.run("ALTER TABLE courses ADD COLUMN category_id INTEGER REFERENCES categories(id)");
      }
      if (!columnNames.includes('icon')) {
        db.run("ALTER TABLE courses ADD COLUMN icon TEXT");
      }
      if (!columnNames.includes('image_url')) {
        db.run("ALTER TABLE courses ADD COLUMN image_url TEXT");
      }
    });

    // Mystery Box settings
    db.run(`CREATE TABLE IF NOT EXISTS mystery_box_settings (
      id TEXT PRIMARY KEY,
      cost INTEGER DEFAULT 20,
      jackpot_amount INTEGER DEFAULT 40,
      jackpot_prob REAL DEFAULT 0.05,
      normal_amount INTEGER DEFAULT 10,
      normal_prob REAL DEFAULT 0.45,
      life_prob REAL DEFAULT 0.40,
      nothing_prob REAL DEFAULT 0.10
    )`);

    db.get('SELECT COUNT(*) as count FROM mystery_box_settings', [], (err, row: any) => {
      if (row && row.count === 0) {
        db.run('INSERT INTO mystery_box_settings (id) VALUES (?)', ['default']);
      }
    });

    // Categories table
    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL
    )`);

    // Translations table
    db.run(`CREATE TABLE IF NOT EXISTS translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      es TEXT NOT NULL,
      en TEXT NOT NULL
    )`);

    // Topics table
    db.run(`CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT,
      description_en TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses (id)
    )`);
    
    // Settings table for global configuration
    db.run(`CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`);

    // Migration for existing topics table
    db.all("PRAGMA table_info(topics)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('title_en')) {
        db.run("ALTER TABLE topics ADD COLUMN title_en TEXT");
      }
      if (!columnNames.includes('description_en')) {
        db.run("ALTER TABLE topics ADD COLUMN description_en TEXT");
      }
    });

    // Lessons table
    db.run(`CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      topic_id INTEGER,
      title TEXT NOT NULL,
      title_en TEXT,
      description TEXT,
      description_en TEXT,
      video_url TEXT,
      audio_url TEXT,
      content TEXT,
      content_en TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (course_id) REFERENCES courses (id),
      FOREIGN KEY (topic_id) REFERENCES topics (id)
    )`);

    // Migration for existing lessons table
    db.all("PRAGMA table_info(lessons)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('topic_id')) {
        db.run("ALTER TABLE lessons ADD COLUMN topic_id INTEGER REFERENCES topics(id)");
      }
      if (!columnNames.includes('title_en')) {
        db.run("ALTER TABLE lessons ADD COLUMN title_en TEXT");
      }
      if (!columnNames.includes('description_en')) {
        db.run("ALTER TABLE lessons ADD COLUMN description_en TEXT");
      }
      if (!columnNames.includes('content_en')) {
        db.run("ALTER TABLE lessons ADD COLUMN content_en TEXT");
      }
    });

    // Questions table
    db.run(`CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      text_en TEXT,
      type TEXT DEFAULT 'multiple_choice',
      points INTEGER DEFAULT 10,
      difficulty TEXT DEFAULT 'easy',
      FOREIGN KEY (lesson_id) REFERENCES lessons (id)
    )`);

    // Migration for existing questions table
    db.all("PRAGMA table_info(questions)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('points')) {
        db.run("ALTER TABLE questions ADD COLUMN points INTEGER DEFAULT 10");
      }
      if (!columnNames.includes('difficulty')) {
        db.run("ALTER TABLE questions ADD COLUMN difficulty TEXT DEFAULT 'easy'");
      }
      if (!columnNames.includes('text_en')) {
        db.run("ALTER TABLE questions ADD COLUMN text_en TEXT");
      }
      if (!columnNames.includes('type')) {
        db.run("ALTER TABLE questions ADD COLUMN type TEXT DEFAULT 'multiple_choice'");
      }
    });

    // Answers table
    db.run(`CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      text_en TEXT,
      image_url TEXT,
      is_correct BOOLEAN NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions (id)
    )`);

    // Migration for existing answers table
    db.all("PRAGMA table_info(answers)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('text_en')) {
        db.run("ALTER TABLE answers ADD COLUMN text_en TEXT");
      }
      if (!columnNames.includes('image_url')) {
        db.run("ALTER TABLE answers ADD COLUMN image_url TEXT");
      }
    });

    // User Answers table (to track correctly answered questions)
    db.run(`CREATE TABLE IF NOT EXISTS user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      answer_id INTEGER,
      is_correct BOOLEAN NOT NULL,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (question_id) REFERENCES questions (id),
      UNIQUE(user_id, question_id)
    )`);

    // User Completed Courses table
    db.run(`CREATE TABLE IF NOT EXISTS user_completed_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id),
      UNIQUE(user_id, course_id)
    )`);

    // Migration for existing user_answers table
    db.all("PRAGMA table_info(user_answers)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('answer_id')) {
        db.run("ALTER TABLE user_answers ADD COLUMN answer_id INTEGER");
      }
    });

    // Migration for existing user_completed_courses table
    db.all("PRAGMA table_info(user_completed_courses)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('stars')) {
        db.run("ALTER TABLE user_completed_courses ADD COLUMN stars INTEGER DEFAULT 0");
      }
      if (!columnNames.includes('last_completed_at')) {
        db.run("ALTER TABLE user_completed_courses ADD COLUMN last_completed_at DATETIME");
      }
    });

    // Migration for existing user_progress table
    db.all("PRAGMA table_info(user_progress)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('level')) {
        db.run("ALTER TABLE user_progress ADD COLUMN level INTEGER DEFAULT 0");
      }
    });

    // User Progress table
    db.run(`CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (lesson_id) REFERENCES lessons (id),
      UNIQUE(user_id, lesson_id)
    )`);

    // User Subscriptions (Enrollments) table
    db.run(`CREATE TABLE IF NOT EXISTS user_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (course_id) REFERENCES courses (id),
      UNIQUE(user_id, course_id)
    )`);

    // Shop items table
    db.run(`CREATE TABLE IF NOT EXISTS shop_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'points' or 'lives'
      amount INTEGER NOT NULL,
      price REAL NOT NULL,
      price_premium REAL NOT NULL,
      label TEXT NOT NULL,
      label_en TEXT NOT NULL
    )`);

    // Exchange Rates history table
    db.run(`CREATE TABLE IF NOT EXISTS exchange_rates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      price REAL NOT NULL, -- TRS per VST
      timestamp DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )`);

    // Price Orders (Admin scheduled movements)
    db.run(`CREATE TABLE IF NOT EXISTS price_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_percentage REAL NOT NULL, -- e.g. 5 for +5%, -10 for -10%
      duration_minutes INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed'
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      started_at DATETIME,
      end_at DATETIME
    )`);

    // Exchange Transactions history
    db.run(`CREATE TABLE IF NOT EXISTS exchange_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'buy' (VST -> TRS) or 'sell' (TRS -> VST)
      amount_trs REAL NOT NULL,
      amount_vst REAL NOT NULL,
      price REAL NOT NULL, -- rate at time of transaction
      timestamp DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Community Categories table
    db.run(`CREATE TABLE IF NOT EXISTS community_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description TEXT,
      description_en TEXT,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    )`);

    // Community Threads table
    db.run(`CREATE TABLE IF NOT EXISTS threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      is_pinned BOOLEAN DEFAULT 0,
      is_locked BOOLEAN DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (category_id) REFERENCES community_categories (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Community Replies table
    db.run(`CREATE TABLE IF NOT EXISTS replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (thread_id) REFERENCES threads (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Personal Channels (WhatsApp style)
    db.run(`CREATE TABLE IF NOT EXISTS user_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      banner_url TEXT,
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'none'
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Migration for existing user_channels
    db.all("PRAGMA table_info(user_channels)", (err: any, columns: any[]) => {
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('status')) {
        db.run("ALTER TABLE user_channels ADD COLUMN status TEXT DEFAULT 'pending'");
      }
    });

    // Channel Applications (Tickets)
    db.run(`CREATE TABLE IF NOT EXISTS channel_applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
      admin_notes TEXT,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Application Conversation Log
    db.run(`CREATE TABLE IF NOT EXISTS application_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      application_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (application_id) REFERENCES channel_applications (id),
      FOREIGN KEY (sender_id) REFERENCES users (id)
    )`);

    // Notifications System
    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL, -- 'channel_update', 'mention', 'admin_message', 'application_approved', etc.
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      link TEXT,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Channel Updates (Blog posts/Broadcasts)
    db.run(`CREATE TABLE IF NOT EXISTS channel_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      FOREIGN KEY (channel_id) REFERENCES user_channels (id)
    )`);

    // Channel Followers
    db.run(`CREATE TABLE IF NOT EXISTS channel_followers (
      user_id INTEGER NOT NULL,
      channel_id INTEGER NOT NULL,
      followed_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
      PRIMARY KEY (user_id, channel_id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (channel_id) REFERENCES user_channels (id)
    )`);

    // Seed Community Categories if empty
    db.get('SELECT COUNT(*) as count FROM community_categories', [], (err, row: any) => {
      if (row && row.count === 0) {
        const categories = [
          ['General', 'General', 'Discusiones generales sobre finanzas e Investia.', 'General discussions about finance and Investia.', 'MessageCircle'],
          ['Inversión', 'Investing', 'Comparte tus estrategias y dudas sobre inversión.', 'Share your strategies and investing questions.', 'TrendingUp'],
          ['Criptomonedas', 'Cryptocurrencies', 'Todo sobre el mundo crypto y blockchain.', 'Everything about crypto and blockchain.', 'Zap'],
          ['Ayuda', 'Help', '¿Tienes problemas con la plataforma? Pregunta aquí.', 'Platform issues? Ask here.', 'HelpCircle'],
          ['Éxitos', 'Success Stories', '¡Comparte tus logros financieros!', 'Share your financial achievements!', 'Award']
        ];
        categories.forEach((cat, idx) => {
          db.run('INSERT INTO community_categories (name, name_en, description, description_en, icon, sort_order) VALUES (?, ?, ?, ?, ?, ?)', [...cat, idx]);
        });
        
        // Seed initial threads
        db.get('SELECT id FROM users WHERE role = "admin" LIMIT 1', [], (err, admin: any) => {
          if (admin) {
            db.run(`
              INSERT INTO threads (category_id, user_id, title, content) 
              VALUES (1, ?, '¡Bienvenidos a la Comunidad!', 'Estamos muy emocionados de lanzar este espacio. ¡Preséntate y comparte tus metas financieras!')
            `, [admin.id]);
          }
        });
      }
    });

    // CMS Pages table
    db.run(`CREATE TABLE IF NOT EXISTS pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      content TEXT, -- JSON stringified array of blocks
      is_published BOOLEAN DEFAULT 1,
      updated_at DATETIME DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    )`);

    // Cookie Settings table
    db.run(`CREATE TABLE IF NOT EXISTS cookie_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      accept_all_text TEXT NOT NULL,
      reject_all_text TEXT NOT NULL,
      save_preferences_text TEXT NOT NULL,
      essential_title TEXT NOT NULL,
      essential_desc TEXT NOT NULL,
      analytics_title TEXT NOT NULL,
      analytics_desc TEXT NOT NULL,
      marketing_title TEXT NOT NULL,
      marketing_desc TEXT NOT NULL,
      policy_link_text TEXT NOT NULL,
      policy_link_url TEXT NOT NULL
    )`);

    // Seed initial cookie settings if empty
    db.get('SELECT COUNT(*) as count FROM cookie_settings', [], (err, row: any) => {
      if (row && row.count === 0) {
        db.run(`INSERT INTO cookie_settings (
          title, description, accept_all_text, reject_all_text, save_preferences_text,
          essential_title, essential_desc, analytics_title, analytics_desc,
          marketing_title, marketing_desc, policy_link_text, policy_link_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
          'Preferencias de Cookies',
          'Utilizamos cookies propias y de terceros para mejorar tu experiencia y nuestros servicios.',
          'Aceptar Todo',
          'Rechazar Todo',
          'Guardar Preferencias',
          'Cookies Esenciales',
          'Necesarias para el funcionamiento básico del sitio.',
          'Cookies Analíticas',
          'Nos ayudan a entender cómo usas la web.',
          'Cookies de Marketing',
          'Utilizadas para mostrar anuncios relevantes.',
          'Leer política de cookies',
          '/privacy'
        ]);
      }
    });

    // Seed initial pages if empty
    db.get('SELECT COUNT(*) as count FROM pages', [], (err, row: any) => {
      if (row && row.count === 0) {
        const initialPages = [
          ['home', 'Página de Inicio', JSON.stringify([
            { type: 'hero', title: 'Domina el Mundo de las Finanzas', subtitle: 'Aprende a invertir, gestionar tus ahorros y entender el mercado de forma divertida.', buttonText: 'EMPEZAR AHORA', buttonLink: '/register', imageUrl: '/assets/hero.png' },
            { type: 'features', items: [
              { icon: 'Zap', title: 'Rápido y Fácil', desc: 'Lecciones de 5 minutos diseñadas para el mundo real.' },
              { icon: 'ShieldCheck', title: 'Seguro', desc: 'Metodología probada por expertos del sector financiero.' },
              { icon: 'TrendingUp', title: 'Rentable', desc: 'Aplica lo aprendido y mira cómo crecen tus ahorros.' }
            ]}
          ])],
          ['privacy', 'Política de Privacidad', JSON.stringify([
            { type: 'text', content: '<h1>Política de Privacidad</h1><p>En Investia, nos tomamos muy en serio tu privacidad...</p>' }
          ])],
          ['terms', 'Términos y Condiciones', JSON.stringify([
            { type: 'text', content: '<h1>Términos y Condiciones</h1><p>Bienvenido a Investia. Al usar nuestra plataforma, aceptas...</p>' }
          ])],
          ['contact', 'Contacto', JSON.stringify([
            { type: 'hero', title: '¿Tienes dudas?', subtitle: 'Nuestro equipo está aquí para ayudarte en tu camino financiero.', buttonText: 'Escríbenos', buttonLink: 'mailto:soporte@investia.com' },
            { type: 'text', content: '<p>También puedes encontrarnos en nuestras redes sociales o por Telegram.</p>' }
          ])]
        ];

        initialPages.forEach(p => {
          db.run('INSERT INTO pages (slug, title, content) VALUES (?, ?, ?)', p);
        });
      }
    });

    // Initialize first exchange rate if empty
    db.get('SELECT COUNT(*) as count FROM exchange_rates', [], (err, row: any) => {
      if (row && row.count === 0) {
        db.run('INSERT INTO exchange_rates (price) VALUES (?)', [1.0]); // Initial: 1 TRS = 1 VST
      }
    });
  });

  return db;
};

