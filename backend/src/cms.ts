import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';

const router = express.Router();
const db = initDb();

// Get all pages (Admin only)
router.get('/', verifyToken, verifyAdmin, (req, res) => {
  db.all('SELECT * FROM pages ORDER BY title ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching pages' });
    res.json(rows);
  });
});

// Get specific page content (Public)
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  db.get('SELECT * FROM pages WHERE slug = ? AND is_published = 1', [slug], (err, row: any) => {
    if (err) return res.status(500).json({ message: 'Error fetching page' });
    if (!row) {
        // Fallbacks for demo and completeness
        if (slug === 'home') {
            return res.json({
                slug: 'home',
                title: 'Bienvenido a Investia',
                content: JSON.stringify([
                    { type: 'hero', title: 'Domina el Mundo de las Finanzas', subtitle: 'Aprende a invertir, gestionar tus ahorros y entender el mercado de forma divertida.', buttonText: 'EMPEZAR AHORA', buttonLink: '/register', imageUrl: '/assets/hero.png' },
                    { type: 'features', items: [
                        { icon: 'Zap', title: 'Rápido y Fácil', desc: 'Lecciones de 5 minutos diseñadas para el mundo real.' },
                        { icon: 'ShieldCheck', title: 'Seguro', desc: 'Metodología probada por expertos del sector financiero.' },
                        { icon: 'TrendingUp', title: 'Rentable', desc: 'Aplica lo aprendido y mira cómo crecen tus ahorros.' }
                    ]}
                ])
            });
        }
        if (slug === 'faq') {
            return res.json({
                slug: 'faq',
                title: 'Preguntas Frecuentes',
                content: JSON.stringify([
                    { type: 'hero', title: 'Preguntas Frecuentes (FAQ)', subtitle: 'Resolvemos tus dudas para que puedas enfocarte en aprender e invertir.', buttonText: 'CONTACTAR SOPORTE', buttonLink: '/contact' },
                    { type: 'features', items: [
                        { icon: 'BookOpen', title: '¿Es realmente gratis?', desc: 'Sí, puedes empezar de forma totalmente gratuita y acceder a los módulos básicos de inversión.' },
                        { icon: 'ShieldCheck', title: '¿Es seguro aprender aquí?', desc: 'Absolutamente. No pedimos que conectes tus cuentas bancarias reales para aprender, todo es simulación.' },
                        { icon: 'Zap', title: '¿Cuánto tiempo necesito?', desc: 'Con solo 5 a 10 minutos al día podrás completar lecciones y mantener tu racha activa.' }
                    ]}
                ])
            });
        }
        if (slug === 'privacy') {
            return res.json({
                slug: 'privacy',
                title: 'Política de Privacidad',
                content: JSON.stringify([
                    { type: 'hero', title: 'Política de Privacidad', subtitle: 'Tu privacidad y la seguridad de tus datos son nuestra máxima prioridad.' },
                    { type: 'text', content: '<h2>1. Recopilación de Datos</h2><p>Recopilamos la información mínima necesaria para ofrecerte una experiencia de aprendizaje personalizada. Esto incluye tu progreso, email y preferencias.</p><h2>2. Uso de la Información</h2><p>Tus datos se utilizan exclusivamente para gamificar tu experiencia (ranking, vidas, toros) y mejorar nuestros cursos.</p><h2>3. Terceros</h2><p>No vendemos tus datos a terceros. Toda tu información está encriptada y protegida según los estándares de la industria.</p>' }
                ])
            });
        }
        if (slug === 'terms') {
            return res.json({
                slug: 'terms',
                title: 'Términos de Uso',
                content: JSON.stringify([
                    { type: 'hero', title: 'Términos de Uso', subtitle: 'Reglas claras para una comunidad segura y de aprendizaje continuo.' },
                    { type: 'text', content: '<h2>Uso Aceptable</h2><p>Investia es una plataforma educativa. No ofrecemos asesoramiento financiero profesional. Las decisiones de inversión que tomes en la vida real son bajo tu propia responsabilidad.</p><h2>Cuentas y Seguridad</h2><p>Eres responsable de mantener tu contraseña segura. No compartas tu cuenta con otros usuarios para mantener la integridad del sistema de Ranking.</p>' }
                ])
            });
        }
        if (slug === 'contact') {
            return res.json({
                slug: 'contact',
                title: 'Contacto',
                content: JSON.stringify([
                    { type: 'hero', title: 'Contacta con Nosotros', subtitle: 'Estamos aquí para ayudarte. Si tienes dudas, sugerencias o problemas técnicos, háznoslo saber.' },
                    { type: 'features', items: [
                        { icon: 'MessageSquare', title: 'Soporte por Email', desc: 'Escríbenos a soporte@investia.app y te responderemos en menos de 24 horas.' },
                        { icon: 'Globe', title: 'Comunidad', desc: 'Únete a nuestro Telegram o foro comunitario para interactuar con otros estudiantes.' },
                        { icon: 'Zap', title: 'Soporte Premium', desc: 'Los usuarios Premium disfrutan de asistencia prioritaria 24/7.' }
                    ]}
                ])
            });
        }
        if (slug === 'help') {
            return res.json({
                slug: 'help',
                title: 'Centro de Ayuda',
                content: JSON.stringify([
                    { type: 'hero', title: 'Centro de Ayuda', subtitle: 'Encuentra guías y tutoriales sobre cómo sacar el máximo provecho de Investia.' },
                    { type: 'text', content: '<h2>Primeros Pasos</h2><p>Aprende a navegar por el Dashboard, ganar Toros (TRS) y completar lecciones.</p><h2>Suscripciones</h2><p>Todo lo que necesitas saber sobre actualizar a Premium o gestionar tu facturación.</p>' }
                ])
            });
        }
        if (slug === 'community') {
            return res.json({
                slug: 'community',
                title: 'Comunidad',
                content: JSON.stringify([
                    { type: 'hero', title: 'Únete a la Comunidad', subtitle: 'Conecta con miles de inversores, comparte estrategias y aprende en grupo.' },
                    { type: 'features', items: [
                        { icon: 'MessageSquare', title: 'Foros', desc: 'Discute sobre el mercado y comparte tus portafolios simulados.' },
                        { icon: 'Award', title: 'Eventos Exclusivos', desc: 'Participa en competiciones de trading y gana recompensas.' }
                    ]}
                ])
            });
        }
        if (slug === 'cookies') {
            return res.json({
                slug: 'cookies',
                title: 'Política de Cookies',
                content: JSON.stringify([
                    { type: 'hero', title: 'Política de Cookies', subtitle: 'Transparencia total sobre cómo utilizamos las cookies en Investia.' },
                    { type: 'text', content: '<h2>¿Qué son las cookies?</h2><p>Son pequeños archivos que guardamos en tu dispositivo para recordar tu sesión y preferencias.</p><h2>Cookies Esenciales</h2><p>Necesarias para que puedas iniciar sesión y guardar tu progreso. No se pueden desactivar.</p><h2>Cookies Analíticas</h2><p>Nos ayudan a entender cómo usas la plataforma para mejorar nuestros cursos.</p>' }
                ])
            });
        }
        if (slug === 'risk') {
            return res.json({
                slug: 'risk',
                title: 'Advertencia de Riesgo',
                content: JSON.stringify([
                    { type: 'hero', title: 'Advertencia de Riesgo', subtitle: 'La inversión conlleva riesgos. Infórmate antes de operar con dinero real.' },
                    { type: 'text', content: '<h2>Simulación vs. Realidad</h2><p>Investia es una plataforma educativa. Los resultados en simuladores no garantizan rendimientos futuros en mercados reales.</p><h2>Riesgo de Capital</h2><p>Nunca inviertas dinero que no te puedas permitir perder. El valor de las inversiones puede subir o bajar.</p>' }
                ])
            });
        }

        return res.status(404).json({ message: 'Page not found' });
    }
    res.json(row);
  });
});

// Create or Update page (Admin only)
router.put('/:slug', verifyToken, verifyAdmin, (req, res) => {
  const { slug } = req.params;
  const { title, content, is_published } = req.body;

  db.get('SELECT id FROM pages WHERE slug = ?', [slug], (err, row: any) => {
    if (err) return res.status(500).json({ message: 'Error checking page' });

    if (row) {
      // Update
      db.run(`
        UPDATE pages 
        SET title = ?, content = ?, is_published = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
        WHERE slug = ?
      `, [title, content, is_published ? 1 : 0, slug], (err2) => {
        if (err2) return res.status(500).json({ message: 'Error updating page' });
        res.json({ message: 'Page updated successfully' });
      });
    } else {
      // Create
      db.run(`
        INSERT INTO pages (slug, title, content, is_published)
        VALUES (?, ?, ?, ?)
      `, [slug, title, content, is_published ? 1 : 0], function(this: any, err2: any) {
        if (err2) return res.status(500).json({ message: 'Error creating page' });
        res.json({ message: 'Page created successfully', id: this.lastID });
      });
    }
  });
});

// Delete page (Admin only)
router.delete('/:slug', verifyToken, verifyAdmin, (req, res) => {
  const { slug } = req.params;
  db.run('DELETE FROM pages WHERE slug = ?', [slug], (err) => {
    if (err) return res.status(500).json({ message: 'Error deleting page' });
    res.json({ message: 'Page deleted successfully' });
  });
});

export default router;
