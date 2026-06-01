import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin, getJwtSecret } from './auth.js';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';

const router = express.Router();
const db = initDb();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let type = 'others';
    if (file.fieldname === 'video') type = 'videos';
    else if (file.fieldname === 'audio') type = 'audios';
    else if (file.fieldname === 'image') {
      if (req.path.includes('/answers')) type = 'answer_images';
      else type = 'course_images';
    }
    cb(null, `uploads/${type}/`);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Helper for XP and Leveling
const calculateLevel = (xp: number) => {
  // Simple formula: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, Level 4 = 600 XP...
  // Level = floor(sqrt(xp / 50)) + 1 roughly or a fixed multiplier
  // Let's use: level = floor(xp / 500) + 1 for simplicity, or 100 * level
  let level = 1;
  let xpRequired = 100;
  let totalXpRequired = 0;
  
  while (xp >= totalXpRequired + xpRequired) {
    totalXpRequired += xpRequired;
    level++;
    xpRequired += 100; // Each level requires 100 more XP than the previous
  }
  
  return { level, nextLevelXp: totalXpRequired + xpRequired, currentLevelXp: totalXpRequired };
};

export const regenerateLives = (user: any, callback: (user: any) => void) => {
  const now = new Date();
  const lastRegenStr = user.last_life_regen;
  
  if (user.lives >= 5) {
    return callback({ ...user, nextRegenAt: null });
  }
  
  if (!lastRegenStr) {
    const fallbackRegen = new Date().toISOString();
    db.run('UPDATE users SET last_life_regen = ? WHERE id = ?', [fallbackRegen, user.id]);
    return callback({ ...user, nextRegenAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  }
  
  const lastRegen = new Date(lastRegenStr);
  
  // Handle invalid dates
  if (isNaN(lastRegen.getTime())) {
    const fallbackRegen = new Date().toISOString();
    db.run('UPDATE users SET last_life_regen = ? WHERE id = ?', [fallbackRegen, user.id]);
    return callback({ ...user, nextRegenAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() });
  }

  const diffMs = now.getTime() - lastRegen.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const livesToAdd = Math.floor(diffMins / 10);

  const currentLives = Math.min(5, user.lives + (livesToAdd > 0 ? livesToAdd : 0));
  
  if (livesToAdd > 0) {
    const newRegenTime = new Date(lastRegen.getTime() + (livesToAdd * 10 * 60 * 1000)).toISOString();
    const nextRegenAt = currentLives < 5 ? new Date(new Date(newRegenTime).getTime() + (10 * 60 * 1000)).toISOString() : null;

    db.run('UPDATE users SET lives = ?, last_life_regen = ? WHERE id = ?', [currentLives, newRegenTime, user.id], (err: any) => {
      callback({ ...user, lives: currentLives, last_life_regen: newRegenTime, nextRegenAt });
    });
  } else {
    const nextRegenAt = new Date(lastRegen.getTime() + (10 * 60 * 1000)).toISOString();
    callback({ ...user, nextRegenAt });
  }
};

// Get user status (lives, points, xp, level)
router.get('/status', verifyToken, (req: any, res: any) => {
  db.get('SELECT id, lives, last_life_regen, points, vestias, xp, level, seen_tutorials, subscription_status, subscription_expiry, auto_renew, avatar_url FROM users WHERE id = ?', [req.userId], (err: any, user: any) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });
    regenerateLives(user, (updatedUser) => {
      const { level, nextLevelXp, currentLevelXp } = calculateLevel(updatedUser.xp || 0);
      res.json({ ...updatedUser, level, nextLevelXp, currentLevelXp });
    });
  });
});

// Mark tutorial as seen
router.post('/tutorial/seen', verifyToken, (req: any, res: any) => {
  const { pageId } = req.body;
  const userId = req.userId;

  db.get('SELECT seen_tutorials FROM users WHERE id = ?', [userId], (err, row: any) => {
    const current = row?.seen_tutorials || '';
    const seenSet = new Set(current.split(',').filter(Boolean));
    seenSet.add(pageId);
    const updated = Array.from(seenSet).join(',');

    db.run('UPDATE users SET seen_tutorials = ? WHERE id = ?', [updated, userId], (err) => {
      if (err) return res.status(500).json({ message: 'Error updating tutorials' });
      res.json({ success: true, seen_tutorials: updated });
    });
  });
});

// Admin: Reset tutorials for a user
router.post('/admin/reset-tutorials', verifyToken, (req: any, res: any) => {
  const { targetUserId } = req.body;
  const adminId = req.userId;

  db.get('SELECT role FROM users WHERE id = ?', [adminId], (err, user: any) => {
    if (user?.role !== 'admin') return res.status(403).json({ message: 'Only admins can reset tutorials' });

    db.run('UPDATE users SET seen_tutorials = "" WHERE id = ?', [targetUserId], (err) => {
      if (err) return res.status(500).json({ message: 'Error resetting tutorials' });
      res.json({ success: true, message: 'Tutorials reset successfully' });
    });
  });
});

// Simple Chat endpoint
router.post('/chat', verifyToken, (req: any, res: any) => {
  const { message } = req.body;
  const lowerMsg = message.toLowerCase();
  
  const faqs = [
    {
      keywords: ['toro', 'punto', 'trs'],
      response: "Los Toros (TRS) son nuestra moneda de aprendizaje. Los ganas acertando preguntas (+10 o más) y completando niveles (+bonus). Sirven para comprar Cajas Misteriosas en la Tienda o saltar el tiempo de espera de los cursos."
    },
    {
      keywords: ['vestia', 'vst', 'premium'],
      response: "Las Vestias (VST) son la moneda premium. Con ellas puedes comprar el plan Premium (vidas infinitas y cursos exclusivos) o saltar el cooldown de los niveles. Puedes conseguirlas en el Exchange cambiando tus Toros."
    },
    {
      keywords: ['nivel', 'xp', 'experiencia', 'subir'],
      response: "Subes de nivel ganando XP. Recibes 15 XP por cada acierto y un gran bonus de 50 XP al terminar un nivel de un curso. ¡Mira tu progreso pasando el ratón sobre tu avatar!"
    },
    {
      keywords: ['cooldown', 'esperar', 'tiempo', 'bloqueo'],
      response: "El 'cooldown' es un descanso de 5 horas tras ganar una estrella. Sirve para que tu cerebro asiente lo aprendido. Si tienes prisa, puedes saltarlo por 10 Toros o 1 Vestia."
    },
    {
      keywords: ['ranking', 'puesto', 'clasificación', 'competir'],
      response: "El Ranking Global muestra a los mejores inversores basados en su XP total. ¡Completa cursos y acierta preguntas para llegar al Top 1!"
    },
    {
      keywords: ['vida', 'corazon', 'morir', 'perder'],
      response: "Tienes un máximo de 5 vidas. Pierdes una si fallas una pregunta. Se recuperan automáticamente (una cada 10 min) o puedes comprar más en la Tienda. ¡Los usuarios Premium tienen vidas infinitas!"
    },
    {
      keywords: ['exchange', 'cambiar', 'convertir', 'trading'],
      response: "En el Exchange puedes 'tradear' tus Toros por Vestias. El precio fluctúa en tiempo real según el mercado de la plataforma. ¡Compra barato y vende caro!"
    }
  ];

  let response = "¡Hola! Soy tu asistente Investia. No estoy seguro de haber entendido eso, pero puedes preguntarme sobre los Toros, las Vestias, cómo subir de nivel, el Ranking o las Vidas.";

  for (const faq of faqs) {
    if (faq.keywords.some(k => lowerMsg.includes(k))) {
      response = faq.response;
      break;
    }
  }
  
  res.json({ response });
});

// Get leaderboard
router.get('/leaderboard', (req: any, res: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  let userId: any = null;

  const fetchLeaderboard = (currentUserId: any) => {
    db.all(`
      SELECT id, name, avatar_url, xp, level, points 
      FROM users 
      ORDER BY xp DESC 
      LIMIT 100
    `, [], (err: any, rows: any[]) => {
      if (err) return res.status(500).json({ message: 'Error fetching leaderboard' });
      
      if (currentUserId) {
        // Find current user rank
        db.get(`
          SELECT COUNT(*) + 1 as rank 
          FROM users 
          WHERE xp > (SELECT (CASE WHEN xp IS NULL THEN 0 ELSE xp END) FROM users WHERE id = ?)
        `, [currentUserId], (err: any, rankRow: any) => {
          res.json({
            leaderboard: rows || [],
            userRank: rankRow?.rank || 0
          });
        });
      } else {
        res.json({
          leaderboard: rows || [],
          userRank: 0
        });
      }
    });
  };

  if (token && token !== 'null' && token !== 'undefined') {
    jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
      if (err) {
        fetchLeaderboard(null);
      } else {
        fetchLeaderboard(decoded.id);
      }
    });
  } else {
    fetchLeaderboard(null);
  }
});

// Get all courses (Filtered by visibility for non-admins, includes enrollment status)
router.get('/', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const userIdFromQuery = req.query.userId; // Optional userId to check enrollment

  const fetchWithVisibility = (isAdmin: boolean) => {
    let query = "SELECT * FROM courses";
    let params: any[] = [];

    if (!isAdmin) {
      query += " WHERE visibility = 'public'";
    }

    db.all(query, params, (err: any, courses: any[]) => {
      if (err) return res.status(500).json({ message: 'Error fetching courses' });
      
      if (userIdFromQuery) {
        db.all("SELECT course_id FROM user_subscriptions WHERE user_id = ?", [userIdFromQuery], (err: any, subs: any[]) => {
          if (err) return res.status(500).json({ message: 'Error fetching subscriptions' });
          const enrolledIds = (subs || []).map(s => s.course_id);
          
          db.all("SELECT course_id, stars FROM user_completed_courses WHERE user_id = ?", [userIdFromQuery], (err: any, completed: any[]) => {
            if (err) return res.status(500).json({ message: 'Error fetching completion status' });
            const completedCourses = completed || [];
            
            const coursesWithStatus = courses.map(c => {
              const completion = completedCourses.find(cc => cc.course_id === c.id);
              return {
                ...c,
                isEnrolled: enrolledIds.includes(c.id),
                isCompleted: completion && completion.stars === 3,
                stars: completion ? completion.stars : 0
              };
            });
            res.json(coursesWithStatus);
          });
        });
      } else {
        res.json(courses);
      }
    });
  };

  if (token && token !== 'null') {
    jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
      if (err) {
        fetchWithVisibility(false);
      } else {
        db.get('SELECT role FROM users WHERE id = ?', [decoded.id], (err: any, user: any) => {
          fetchWithVisibility(user?.role === 'admin');
        });
      }
    });
  } else {
    fetchWithVisibility(false);
  }
});

// Enroll in a course
router.post('/:id/enroll', verifyToken, (req: any, res: any) => {
  const courseId = req.params.id;
  const userId = req.userId;

  db.serialize(() => {
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err: any, user: any) => {
      if (err || !user) return res.status(404).json({ message: 'User not found' });

      db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err: any, course: any) => {
        if (err || !course) return res.status(404).json({ message: 'Course not found' });

        // Check if already enrolled
        db.get('SELECT id FROM user_subscriptions WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, existingSub: any) => {
          if (existingSub) {
            return res.json({ message: 'Ya estás inscrito en este curso', userPoints: user.points });
          }

          const isPremiumSubscriber = user.subscription_status === 'premium';
          const isPremiumCourse = course.access_level === 'premium';
          const pointsPrice = course.points_price || 0;

          if (isPremiumCourse && !isPremiumSubscriber) {
            if (pointsPrice > 0) {
              if (user.points >= pointsPrice) {
                const newPointsBalance = user.points - pointsPrice;
                
                db.serialize(() => {
                  db.run('BEGIN TRANSACTION');
                  db.run('UPDATE users SET points = ? WHERE id = ?', [newPointsBalance, userId]);
                  db.run('INSERT INTO user_subscriptions (user_id, course_id) VALUES (?, ?)', [userId, courseId], (err: any) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return res.status(500).json({ message: 'Error during points redemption' });
                    }
                    db.run('COMMIT');
                    res.json({ message: 'Course redeemed successfully', userPoints: newPointsBalance });
                  });
                });
              } else {
                return res.status(403).json({ message: `No tienes suficientes puntos (${pointsPrice} necesarios)` });
              }
            } else {
              return res.status(403).json({ message: 'Este curso es exclusivo para miembros Premium' });
            }
          } else {
            // Free course or premium user: just enroll
            db.run('INSERT INTO user_subscriptions (user_id, course_id) VALUES (?, ?)', [userId, courseId], (err: any) => {
              if (err) return res.status(500).json({ message: 'Error creating enrollment' });
              res.json({ message: 'Enrolled successfully', userPoints: user.points });
            });
          }
        });
      });
    });
  });
});

// Update course visibility and access level
router.patch('/:id/visibility', verifyToken, verifyAdmin, (req, res) => {
  const { visibility, access_level } = req.body;
  const courseId = req.params.id;

  const updates: string[] = [];
  const params: any[] = [];

  if (visibility !== undefined) {
    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({ message: 'Invalid visibility' });
    }
    updates.push('visibility = ?');
    params.push(visibility);
  }

  if (access_level !== undefined) {
    if (!['free', 'premium'].includes(access_level)) {
      return res.status(400).json({ message: 'Invalid access level' });
    }
    updates.push('access_level = ?');
    params.push(access_level);
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  params.push(courseId);

  const query = `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating course' });
    res.json({ message: 'Course updated successfully' });
  });
});

// Create course
router.post('/', verifyToken, verifyAdmin, upload.single('image'), (req: any, res) => {
  const { title, title_en, description, description_en, category, category_en, category_id, points_reward, points_price, visibility, access_level, difficulty, icon } = req.body;
  
  let image_url = req.body.image_url || null;
  if (req.file) {
    image_url = `/uploads/course_images/${req.file.filename}`;
  }

  const pid = (category_id === 'null' || !category_id) ? null : parseInt(category_id);
  const reward = parseInt(points_reward) || 100;
  const price = parseInt(points_price) || 0;

  db.run('INSERT INTO courses (title, title_en, description, description_en, category, category_en, category_id, points_reward, points_price, visibility, access_level, difficulty, icon, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [title, title_en, description, description_en, category || 'General', category_en || 'General', pid, reward, price, visibility || 'public', access_level || 'free', difficulty || 'beginner', icon || null, image_url], function(this: any, err: any) {
    if (err) return res.status(500).json({ message: 'Error creating course' });
    res.json({ id: this.lastID, title, title_en, description, description_en, category: category || 'General', category_en: category_en || 'General', category_id: pid, points_reward: reward, points_price: price, visibility: visibility || 'public', access_level: access_level || 'free', difficulty: difficulty || 'beginner', icon: icon || null, image_url });
  });
});

// Update course
router.put('/:id', verifyToken, verifyAdmin, upload.single('image'), (req: any, res) => {
  const { title, title_en, description, description_en, category, category_en, category_id, points_reward, points_price, visibility, access_level, difficulty, icon } = req.body;
  const courseId = req.params.id;
  
  let image_url = req.body.image_url;
  if (req.file) {
    image_url = `/uploads/course_images/${req.file.filename}`;
  }

  const pid = (category_id === 'null' || !category_id) ? null : parseInt(category_id);
  const reward = parseInt(points_reward) || 0;
  const price = parseInt(points_price) || 0;

  db.run(`
    UPDATE courses 
    SET title = ?, title_en = ?, description = ?, description_en = ?, category = ?, category_en = ?, category_id = ?, points_reward = ?, points_price = ?, visibility = ?, access_level = ?, difficulty = ? , icon = ?, image_url = ?
    WHERE id = ?
  `, [title, title_en, description, description_en, category, category_en, pid, reward, price, visibility, access_level, difficulty, icon, image_url, courseId], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating course' });
    res.json({ message: 'Course updated successfully' });
  });
});

// Delete course
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const courseId = req.params.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      // 1. Delete answers related to questions in this course's lessons
      db.run(`
        DELETE FROM answers 
        WHERE question_id IN (
          SELECT q.id FROM questions q 
          JOIN lessons l ON q.lesson_id = l.id 
          WHERE l.course_id = ?
        )
      `, [courseId]);

      // 2. Delete user_answers related to questions in this course's lessons
      db.run(`
        DELETE FROM user_answers 
        WHERE question_id IN (
          SELECT q.id FROM questions q 
          JOIN lessons l ON q.lesson_id = l.id 
          WHERE l.course_id = ?
        )
      `, [courseId]);

      // 3. Delete questions related to lessons in this course
      db.run(`
        DELETE FROM questions 
        WHERE lesson_id IN (
          SELECT id FROM lessons WHERE course_id = ?
        )
      `, [courseId]);

      // 4. Delete user_progress related to lessons in this course
      db.run(`
        DELETE FROM user_progress 
        WHERE lesson_id IN (
          SELECT id FROM lessons WHERE course_id = ?
        )
      `, [courseId]);

      // 5. Delete lessons related to this course
      db.run('DELETE FROM lessons WHERE course_id = ?', [courseId]);

      // 6. Delete topics related to this course
      db.run('DELETE FROM topics WHERE course_id = ?', [courseId]);

      // 7. Delete subscriptions related to this course
      db.run('DELETE FROM user_subscriptions WHERE course_id = ?', [courseId]);

      // 8. Finally, delete the course itself
      db.run('DELETE FROM courses WHERE id = ?', [courseId], (err: any) => {
        if (err) throw err;
        db.run('COMMIT');
        res.json({ message: 'Course and all related data deleted successfully' });
      });
    } catch (e) {
      db.run('ROLLBACK');
      res.status(500).json({ message: 'Error deleting course' });
    }
  });
});

// Create topic
router.post('/:courseId/topics', verifyToken, verifyAdmin, (req, res) => {
  const { title, title_en, description, description_en, sort_order } = req.body;
  const courseId = req.params.courseId;
  db.run('INSERT INTO topics (course_id, title, title_en, description, description_en, sort_order) VALUES (?, ?, ?, ?, ?, ?)', 
    [courseId, title, title_en, description, description_en, sort_order || 0], function(this: any, err: any) {
      if (err) return res.status(500).json({ message: 'Error creating topic' });
      res.json({ id: this.lastID, title, title_en, courseId });
  });
});

// Update topic
router.put('/topics/:id', verifyToken, verifyAdmin, (req, res) => {
  const { title, title_en, description, description_en, sort_order } = req.body;
  const topicId = req.params.id;
  db.run('UPDATE topics SET title = ?, title_en = ?, description = ?, description_en = ?, sort_order = ? WHERE id = ?', 
    [title, title_en, description, description_en, sort_order, topicId], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error updating topic' });
      res.json({ message: 'Topic updated successfully' });
  });
});

// Delete topic
router.delete('/topics/:id', verifyToken, verifyAdmin, (req, res) => {
  const topicId = req.params.id;
  db.get('SELECT course_id FROM topics WHERE id = ?', [topicId], (err: any, topic: any) => {
    if (topic) {
      db.run('DELETE FROM user_completed_courses WHERE course_id = ?', [topic.course_id]);
    }
  });
  db.run('DELETE FROM topics WHERE id = ?', [topicId], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting topic' });
    res.json({ message: 'Topic deleted successfully' });
  });
});

// Create lesson
router.post('/:courseId/lessons', verifyToken, verifyAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req: any, res) => {
  const { title, title_en, description, description_en, content, content_en, sort_order, topic_id } = req.body;
  const courseId = req.params.courseId;
  
  let video_url = req.body.video_url || null;
  let audio_url = req.body.audio_url || null;

  if (req.files) {
    if (req.files['video']) {
      video_url = `/uploads/videos/${req.files['video'][0].filename}`;
    }
    if (req.files['audio']) {
      audio_url = `/uploads/audios/${req.files['audio'][0].filename}`;
    }
  }

  db.run('INSERT INTO lessons (course_id, topic_id, title, title_en, description, description_en, content, content_en, sort_order, video_url, audio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
    [courseId, topic_id, title, title_en, description, description_en, content, content_en, sort_order, video_url, audio_url], function(this: any, err: any) {
      if (err) return res.status(500).json({ message: 'Error creating lesson' });
      res.json({ id: this.lastID, title, courseId, topic_id, video_url, audio_url });
  });
});

// Update lesson
router.put('/lessons/:id', verifyToken, verifyAdmin, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), (req: any, res) => {
  const { title, title_en, description, description_en, content, content_en, sort_order, topic_id } = req.body;
  const lessonId = req.params.id;
  
  let video_url = req.body.video_url;
  let audio_url = req.body.audio_url;

  if (req.files) {
    if (req.files['video']) {
      video_url = `/uploads/videos/${req.files['video'][0].filename}`;
    }
    if (req.files['audio']) {
      audio_url = `/uploads/audios/${req.files['audio'][0].filename}`;
    }
  }

  const query = `
    UPDATE lessons 
    SET title = ?, title_en = ?, description = ?, description_en = ?, content = ?, content_en = ?, sort_order = ?, video_url = ?, audio_url = ?, topic_id = ?
    WHERE id = ?
  `;
  const params = [title, title_en, description, description_en, content, content_en, sort_order, video_url, audio_url, topic_id, lessonId];

  db.run(query, params, (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating lesson' });
    res.json({ message: 'Lesson updated successfully' });
  });
});

// Delete lesson
router.delete('/lessons/:id', verifyToken, verifyAdmin, (req: any, res) => {
  const lessonId = req.params.id;
  
  // Also delete related questions and answers to maintain integrity
  db.serialize(() => {
    // 1. Get courseId to reset completion
    db.get('SELECT course_id FROM lessons WHERE id = ?', [lessonId], (err: any, lesson: any) => {
      if (lesson) {
        db.run('DELETE FROM user_completed_courses WHERE course_id = ?', [lesson.course_id]);
      }
    });

    db.run('DELETE FROM answers WHERE question_id IN (SELECT id FROM questions WHERE lesson_id = ?)', [lessonId]);
    db.run('DELETE FROM questions WHERE lesson_id = ?', [lessonId]);
    db.run('DELETE FROM lessons WHERE id = ?', [lessonId], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error deleting lesson' });
      res.json({ message: 'Lesson deleted successfully' });
    });
  });
});

// Create question
router.post('/lessons/:lessonId/questions', verifyToken, verifyAdmin, (req, res) => {
  const { text, text_en, points, difficulty, type } = req.body;
  const lessonId = req.params.lessonId;
  db.run('INSERT INTO questions (lesson_id, text, text_en, points, difficulty, type) VALUES (?, ?, ?, ?, ?, ?)', 
    [lessonId, text, text_en, points || 10, difficulty || 'easy', type || 'multiple_choice'], function(this: any, err: any) {
    if (err) return res.status(500).json({ message: 'Error creating question' });
    res.json({ id: this.lastID, text, text_en, lessonId, points: points || 10, difficulty: difficulty || 'easy', type: type || 'multiple_choice' });
  });
});

// Update question
router.put('/questions/:id', verifyToken, verifyAdmin, (req, res) => {
  const { text, text_en, points, difficulty, type } = req.body;
  const questionId = req.params.id;
  db.run('UPDATE questions SET text = ?, text_en = ?, points = ?, difficulty = ?, type = ? WHERE id = ?', 
    [text, text_en, points, difficulty, type, questionId], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error updating question' });
      res.json({ message: 'Question updated successfully' });
  });
});

// Delete question
router.delete('/questions/:id', verifyToken, verifyAdmin, (req, res) => {
  const questionId = req.params.id;
  db.serialize(() => {
    // 1. Get courseId to reset completion
    db.get('SELECT l.course_id FROM lessons l JOIN questions q ON l.id = q.lesson_id WHERE q.id = ?', [questionId], (err: any, lesson: any) => {
      if (lesson) {
        db.run('DELETE FROM user_completed_courses WHERE course_id = ?', [lesson.course_id]);
      }
    });

    db.run('DELETE FROM answers WHERE question_id = ?', [questionId]);
    db.run('DELETE FROM user_answers WHERE question_id = ?', [questionId]);
    db.run('DELETE FROM questions WHERE id = ?', [questionId], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error deleting question' });
      res.json({ message: 'Question deleted successfully' });
    });
  });
});

// Create answer
router.post('/questions/:questionId/answers', verifyToken, verifyAdmin, upload.single('image'), (req: any, res) => {
  const { text, text_en, is_correct } = req.body;
  const questionId = req.params.questionId;
  
  let image_url = req.body.image_url || null;
  if (req.file) {
    image_url = `/uploads/answer_images/${req.file.filename}`;
  }

  db.run('INSERT INTO answers (question_id, text, text_en, image_url, is_correct) VALUES (?, ?, ?, ?, ?)', 
    [questionId, text, text_en, image_url, is_correct === 'true' || is_correct === '1' || is_correct === 1], function(this: any, err: any) {
    if (err) return res.status(500).json({ message: 'Error creating answer' });
    res.json({ id: this.lastID, text, text_en, image_url, is_correct });
  });
});

// Update answer
router.put('/answers/:id', verifyToken, verifyAdmin, upload.single('image'), (req: any, res) => {
  const { text, text_en, is_correct } = req.body;
  const answerId = req.params.id;

  let image_url = req.body.image_url;
  if (req.file) {
    image_url = `/uploads/answer_images/${req.file.filename}`;
  }

  db.run('UPDATE answers SET text = ?, text_en = ?, image_url = ?, is_correct = ? WHERE id = ?', 
    [text, text_en, image_url, (is_correct === 'true' || is_correct === '1' || is_correct === 1) ? 1 : 0, answerId], (err: any) => {
      if (err) return res.status(500).json({ message: 'Error updating answer' });
      res.json({ message: 'Answer updated successfully' });
  });
});

// Delete answer
router.delete('/answers/:id', verifyToken, verifyAdmin, (req, res) => {
  const answerId = req.params.id;
  db.run('DELETE FROM answers WHERE id = ?', [answerId], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error deleting answer' });
    res.json({ message: 'Answer deleted successfully' });
  });
});

// Get lesson details
router.get('/lessons/:id', (req, res) => {
  const lessonId = req.params.id;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  let userId: number | null = null;
  let isAdmin = false;

  const handleFetch = (stars: number, cooldownActive: boolean) => {
    db.get(`
      SELECT l.*, c.title as course_title, c.id as course_id
      FROM lessons l
      JOIN courses c ON l.course_id = c.id
      WHERE l.id = ?
    `, [lessonId], (err: any, lesson: any) => {
      if (err || !lesson) return res.status(404).json({ message: 'Lesson not found' });

      let query = 'SELECT * FROM questions WHERE lesson_id = ?';
      let params: any[] = [lessonId];

      if (!isAdmin) {
        // Map stars to difficulty for regular users
        let targetDifficulty = 'easy';
        if (stars === 1) targetDifficulty = 'medium';
        if (stars >= 2) targetDifficulty = 'hard';
        query += ' AND difficulty = ?';
        params.push(targetDifficulty);
      }

      db.all(query, params, (err: any, questions: any[]) => {
        if (err) return res.status(500).json({ message: 'Error fetching questions' });

        if (questions.length === 0) {
          return res.json({ ...lesson, questions: [], isCompleted: false, stars, cooldownActive });
        }

        const questionIds = questions.map(q => q.id);
        db.all(`SELECT * FROM answers WHERE question_id IN (${questionIds.join(',')})`, [], (err: any, answers: any[]) => {
          if (err) return res.status(500).json({ message: 'Error fetching answers' });

          const respondWithQuestions = (isCompleted: boolean) => {
            const correctlyAnsweredIds: number[] = [];

            const finishResponse = () => {
              const questionsWithAnswers = questions.map(q => ({
                ...q,
                answers: (answers || []).filter(a => a.question_id === q.id),
                isAlreadyCorrect: correctlyAnsweredIds.includes(q.id)
              }));
              res.json({ ...lesson, questions: questionsWithAnswers, isCompleted, stars, cooldownActive });
            };

            if (userId) {
              db.all(`SELECT question_id FROM user_answers WHERE user_id = ? AND is_correct = 1 AND question_id IN (${questionIds.join(',')})`, [userId], (err: any, correctAnswers: any[]) => {
                if (!err && correctAnswers) {
                  correctAnswers.forEach(ca => correctlyAnsweredIds.push(ca.question_id));
                }
                finishResponse();
              });
            } else {
              finishResponse();
            }
          };

          if (userId) {
            db.get('SELECT id FROM user_progress WHERE user_id = ? AND lesson_id = ? AND level = ?', [userId, lessonId, stars], (err: any, progress: any) => {
              respondWithQuestions(!!progress);
            });
          } else {
            respondWithQuestions(false);
          }
        });
      });
    });
  };

  if (token && token !== 'null') {
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      userId = (decoded as any).id;
      db.get('SELECT role FROM users WHERE id = ?', [userId], (err: any, user: any) => {
        isAdmin = user?.role === 'admin';

        if (isAdmin) {
          handleFetch(0, false); // Admin gets all (filtered by isAdmin flag in handleFetch)
        } else {
          db.get('SELECT stars, last_completed_at FROM user_completed_courses WHERE user_id = ? AND course_id = (SELECT course_id FROM lessons WHERE id = ?)', [userId, lessonId], (err: any, completedCourse: any) => {
            const stars = completedCourse?.stars || 0;
            let cooldownActive = false;
            if (stars > 0 && stars < 3 && completedCourse?.last_completed_at) {
              const lastCompleted = new Date(completedCourse.last_completed_at);
              const diffHours = (new Date().getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);
              if (diffHours < 5) cooldownActive = true;
            }
            const levelToShow = (cooldownActive && stars > 0) ? stars - 1 : Math.min(stars, 2);
            handleFetch(levelToShow, cooldownActive);
          });
        }
      });
    } catch (e) {
      handleFetch(0, false);
    }
  } else {
    handleFetch(0, false);
  }
});

// Check question and award points
router.post('/questions/:id/check', verifyToken, (req: any, res: any) => {
  const questionId = req.params.id;
  const { answerId, answerText, matchingAnswers } = req.body; // matchingAnswers for drag_drop or matching
  const userId = req.userId;

  db.get('SELECT * FROM users WHERE id = ?', [userId], (err: any, user: any) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });

    regenerateLives(user, (updatedUser) => {
      // Check if already answered correctly FIRST to prevent gaining points or losing lives
      db.get('SELECT id FROM user_answers WHERE user_id = ? AND question_id = ? AND is_correct = 1', [userId, questionId], (err: any, existing: any) => {
        if (existing) {
          return res.status(403).json({ 
            correct: true, 
            alreadyAnswered: true, 
            message: 'Ya has acertado esta pregunta.' 
          });
        }

        if (updatedUser.lives <= 0) {
          return res.status(403).json({ message: 'No tienes vidas suficientes. Espera a que se regeneren.' });
        }

        db.get('SELECT * FROM questions WHERE id = ?', [questionId], (err: any, question: any) => {
          if (err || !question) return res.status(404).json({ message: 'Question not found' });

          const checkResult = (isCorrect: boolean, correctId?: number) => {
            if (isCorrect) {
              const pointsAwarded = question.points || 10;
              const standardXp = 15;

              db.serialize(() => {
                db.run('INSERT OR REPLACE INTO user_answers (user_id, question_id, answer_id, is_correct) VALUES (?, ?, ?, 1)', [userId, questionId, correctId || null]);
                
                // 1. Find courseId for this question
                db.get('SELECT course_id FROM lessons WHERE id = ?', [question.lesson_id], (err: any, lesson: any) => {
                  if (lesson) {
                    const courseId = lesson.course_id;
                    
                    db.get('SELECT stars, last_completed_at FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, completedCourse: any) => {
                      const stars = completedCourse?.stars || 0;
                      let currentDifficulty = 'easy';
                      if (stars === 1) currentDifficulty = 'medium';
                      if (stars >= 2) currentDifficulty = 'hard';

                      db.get(`
                        SELECT 
                          (SELECT COUNT(q.id) FROM questions q JOIN lessons l ON q.lesson_id = l.id WHERE l.course_id = ? AND q.difficulty = ?) as total,
                          (SELECT COUNT(DISTINCT ua.question_id) FROM user_answers ua JOIN questions q ON ua.question_id = q.id JOIN lessons l ON q.lesson_id = l.id WHERE l.course_id = ? AND ua.user_id = ? AND ua.is_correct = 1 AND q.difficulty = ?) as answered
                      `, [courseId, currentDifficulty, courseId, userId, currentDifficulty], (err: any, stats: any) => {
                        
                        const isLevelCompleted = stats && stats.total > 0 && stats.total === stats.answered;
                        const levelBonusXp = isLevelCompleted ? 50 : 0;
                        const totalXpAwarded = standardXp + levelBonusXp;

                        db.get('SELECT points, xp, level FROM users WHERE id = ?', [userId], (err, userData: any) => {
                          const newXp = (userData.xp || 0) + totalXpAwarded;
                          const { level: newLevel } = calculateLevel(newXp);
                          const isLevelUp = newLevel > (userData.level || 1);

                          db.get('SELECT points_reward FROM courses WHERE id = ?', [courseId], (err: any, course: any) => {
                            const courseBonusPoints = isLevelCompleted && stars < 3 ? (course?.points_reward || 0) : 0;
                            const totalPointsAwarded = pointsAwarded + courseBonusPoints;

                            db.run('UPDATE users SET points = points + ?, xp = ?, level = ? WHERE id = ?', [totalPointsAwarded, newXp, newLevel, userId], (err) => {
                              if (isLevelCompleted) {
                                const newStars = stars + 1;
                                const now = new Date().toISOString();
                                if (!completedCourse) {
                                  db.run('INSERT INTO user_completed_courses (user_id, course_id, stars, last_completed_at) VALUES (?, ?, ?, ?)', [userId, courseId, 1, now]);
                                } else if (stars < 3) {
                                  db.run('UPDATE user_completed_courses SET stars = ?, last_completed_at = ? WHERE user_id = ? AND course_id = ?', [newStars, now, userId, courseId]);
                                }

                                res.json({ 
                                  correct: true, 
                                  pointsAwarded: totalPointsAwarded, 
                                  xpAwarded: totalXpAwarded,
                                  isLevelUp,
                                  newLevel,
                                  courseCompleted: true,
                                  courseBonus: courseBonusPoints,
                                  stars: isLevelCompleted ? Math.min(3, stars + 1) : stars,
                                  message: isLevelCompleted ? `¡Correcto! +${totalPointsAwarded} pts. ¡NIVEL COMPLETADO! Has ganado ${Math.min(3, stars + 1)} estrella(s), ${totalXpAwarded} XP y un bonus de ${courseBonusPoints} puntos.` : `¡Correcto! Has ganado ${totalPointsAwarded} puntos y ${totalXpAwarded} XP.`
                                });
                              } else {
                                res.json({ 
                                  correct: true, 
                                  pointsAwarded: totalPointsAwarded, 
                                  xpAwarded: totalXpAwarded,
                                  isLevelUp,
                                  newLevel,
                                  message: `¡Correcto! Has ganado ${totalPointsAwarded} puntos y ${totalXpAwarded} XP.` 
                                });
                              }
                            });
                          });
                        });
                      });
                    });
                  } else {
                    // Fallback if no lesson/course found (shouldn't happen with correct data)
                    db.get('SELECT points, xp, level FROM users WHERE id = ?', [userId], (err, userData: any) => {
                      const newXp = (userData.xp || 0) + standardXp;
                      const { level: newLevel } = calculateLevel(newXp);
                      db.run('UPDATE users SET points = points + ?, xp = ?, level = ? WHERE id = ?', [pointsAwarded, newXp, newLevel, userId]);
                      res.json({ correct: true, pointsAwarded, xpAwarded: standardXp, isLevelUp: newLevel > (userData.level || 1), newLevel, message: `¡Correcto! Has ganado ${pointsAwarded} puntos y ${standardXp} XP.` });
                    });
                  }
                });
              });
            } else {
              const newLives = Math.max(0, updatedUser.lives - 1);
              const updateRegen = updatedUser.lives === 5 ? `, last_life_regen = '${new Date().toISOString()}'` : '';
              db.run(`UPDATE users SET lives = ? ${updateRegen} WHERE id = ?`, [newLives, userId], (err: any) => {
                res.json({ correct: false, message: 'Respuesta incorrecta. Has perdido una vida.', livesRemaining: newLives });
              });
            }
          };

          if (question.type === 'multiple_choice' || question.type === 'true_false') {
            db.get('SELECT * FROM answers WHERE id = ? AND question_id = ?', [answerId, questionId], (err: any, answer: any) => {
              checkResult(!!answer?.is_correct, answerId);
            });
          } else if (question.type === 'fill_in_blanks') {
            db.all('SELECT text FROM answers WHERE question_id = ? AND is_correct = 1', [questionId], (err: any, answers: any[]) => {
              const isCorrect = answers.some(a => a.text.toLowerCase().trim() === answerText?.toLowerCase().trim());
              checkResult(isCorrect);
            });
          } else if (['matching', 'drag_drop', 'matching_columns', 'match_concepts', 'image_text_association', 'connect_arrows'].includes(question.type)) {
            // matchingAnswers is expected to be { [answerId]: "matchingText" } or similar
            db.all('SELECT * FROM answers WHERE question_id = ?', [questionId], (err: any, answers: any[]) => {
              const isCorrect = answers.every(a => matchingAnswers && matchingAnswers[a.id] === a.text);
              checkResult(isCorrect);
            });
          } else {
            res.status(400).json({ message: 'Unsupported question type' });
          }
        });
      });
    });
  });
});

// Complete lesson
router.post('/lessons/:id/complete', verifyToken, (req: any, res: any) => {
  const lessonId = req.params.id;
  const userId = req.userId;
  const { level } = req.body;

  db.get('SELECT course_id FROM lessons WHERE id = ?', [lessonId], (err: any, lesson: any) => {
    if (lesson) {
      const markProgress = (targetLevel: number) => {
        db.run('INSERT OR REPLACE INTO user_progress (user_id, lesson_id, level) VALUES (?, ?, ?)', [userId, lessonId, targetLevel], (err: any) => {
          if (err) return res.status(500).json({ message: 'Error completing lesson' });
          res.json({ message: 'Lesson completed' });
        });
      };

      if (level !== undefined) {
        markProgress(level);
      } else {
        db.get('SELECT stars FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, lesson.course_id], (err: any, completedCourse: any) => {
          const stars = completedCourse?.stars || 0;
          markProgress(stars);
        });
      }
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  });
});
// Skip course cooldown
router.post('/:id/skip-cooldown', verifyToken, (req: any, res: any) => {
  const courseId = req.params.id;
  const userId = req.userId;
  const { method } = req.body; // 'points' or 'vestias'

  db.get('SELECT points, vestias FROM users WHERE id = ?', [userId], (err: any, user: any) => {
    if (err || !user) return res.status(404).json({ message: 'User not found' });

    let cost = 0;
    let field = '';
    
    if (method === 'points') {
      cost = 10;
      field = 'points';
    } else if (method === 'vestias') {
      cost = 1;
      field = 'vestias';
    } else {
      return res.status(400).json({ message: 'Invalid skip method' });
    }

    if (user[field] < cost) {
      return res.status(403).json({ message: `No tienes suficientes ${method === 'points' ? 'Toros' : 'Vestias'}.` });
    }

    db.serialize(() => {
      db.run(`UPDATE users SET ${field} = ${field} - ? WHERE id = ?`, [cost, userId]);
      // Reset cooldown by setting last_completed_at to 6 hours ago
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      db.run('UPDATE user_completed_courses SET last_completed_at = ? WHERE user_id = ? AND course_id = ?', [sixHoursAgo, userId, courseId], (err: any) => {
        if (err) return res.status(500).json({ message: 'Error skipping cooldown' });
        res.json({ message: 'Cooldown saltado con éxito', newBalance: user[field] - cost });
      });
    });
  });
});

// Get course details, topics and lessons
router.get('/:id', (req, res) => {
  const courseId = req.params.id;
  const token = req.headers['authorization']?.split(' ')[1];

  const fetchCourseDetails = (isAdmin: boolean, userId: number | null) => {
    try {
      console.log(`[GET /api/courses/${courseId}] Fetching details. userId=${userId}, isAdmin=${isAdmin}`);

      db.get('SELECT * FROM courses WHERE id = ?', [courseId], (err: any, course: any) => {
        if (err) {
          console.error('[GET /api/courses/:id] Database error fetching course:', err);
          return res.status(500).json({ message: 'Error en la base de datos al obtener el curso' });
        }
        if (!course) {
          console.warn(`[GET /api/courses/:id] Course ${courseId} not found`);
          return res.status(404).json({ message: 'Curso no encontrado' });
        }

        // Admin always has access. Public courses always have access for basic details.
        // Private courses require admin.
        if (course.visibility === 'private' && !isAdmin) {
          console.warn(`[GET /api/courses/:id] Access denied for private course ${courseId}. userId=${userId}`);
          return res.status(403).json({ message: 'Acceso denegado a curso privado' });
        }

        // Check enrollment for premium courses
        const checkAccess = (callback: (hasAccess: boolean) => void) => {
          if (isAdmin || course.access_level === 'free') return callback(true);
          if (!userId) return callback(false);

          db.get('SELECT subscription_status FROM users WHERE id = ?', [userId], (err: any, user: any) => {
            if (err) {
              console.error('[GET /api/courses/:id] Error checking user subscription:', err);
              return callback(false);
            }
            if (user?.subscription_status === 'premium') return callback(true);

            db.get('SELECT id FROM user_subscriptions WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, sub: any) => {
               if (err) {
                 console.error('[GET /api/courses/:id] Error checking course subscription:', err);
                 return callback(false);
               }
               callback(!!sub);
            });
          });
        };

        checkAccess((hasAccess) => {
          if (!hasAccess && course.access_level === 'premium') {
            console.warn(`[GET /api/courses/:id] Premium access required for course ${courseId}. userId=${userId}`);
            return res.status(403).json({ message: 'Se requiere acceso Premium para este curso' });
          }

          // Fetch Topics
          db.all('SELECT * FROM topics WHERE course_id = ? ORDER BY sort_order ASC', [courseId], (err: any, topics: any[]) => {
            if (err) console.error('[GET /api/courses/:id] Error fetching topics:', err);

            // Fetch Lessons
            db.all('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC', [courseId], (err: any, lessons: any[]) => {
              if (err) {
                console.error('[GET /api/courses/:id] Error fetching lessons:', err);
                return res.status(500).json({ message: 'Error al obtener las lecciones' });
              }

              // Fetch Question Counts per lesson
              db.all('SELECT lesson_id, COUNT(*) as count FROM questions GROUP BY lesson_id', [], (err: any, qCounts: any[]) => {
                const countsMap = (qCounts || []).reduce((acc: any, curr: any) => {
                  acc[curr.lesson_id] = curr.count;
                  return acc;
                }, {});

                // Fetch User Progress (if userId provided)
                const fetchUserSpecifics = (callback: (stars: number, levelToShow: number, cooldownActive: boolean, completedIds: number[], lastCompletedAt: string | null) => void) => {
                  if (!userId) return callback(0, 0, false, [], null);

                  db.get('SELECT stars, last_completed_at FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any, compRow: any) => {
                    const stars = compRow?.stars || 0;
                    let cooldownActive = false;
                    let levelToShow = 0;

                    if (compRow?.last_completed_at && stars > 0 && stars < 3) {
                      const lastCompleted = new Date(compRow.last_completed_at);
                      const diffHours = (new Date().getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);
                      if (diffHours < 5) cooldownActive = true;
                    }

                    levelToShow = (cooldownActive && stars > 0) ? stars - 1 : Math.min(stars, 2);

                    db.all('SELECT lesson_id FROM user_progress WHERE user_id = ? AND level = ?', [userId, levelToShow], (err: any, progRows: any[]) => {
                      const completedIds = (progRows || []).map(r => r.lesson_id);
                      callback(stars, levelToShow, cooldownActive, completedIds, compRow?.last_completed_at || null);
                    });
                  });
                };

                fetchUserSpecifics((stars, levelToShow, cooldownActive, completedIds, lastCompletedAt) => {
                  const lessonsWithStatus = (lessons || []).map(l => ({
                    ...l,
                    isCompleted: completedIds.includes(l.id),
                    questionCount: countsMap[l.id] || 0
                  }));

                  const topicsWithLessons = (topics || []).map(t => ({
                    ...t,
                    lessons: lessonsWithStatus.filter(l => l.topic_id === t.id),
                    isCompleted: false // Logic could be added here if needed
                  }));

                  const untrackedLessons = lessonsWithStatus.filter(l => !l.topic_id);

                  res.json({
                    ...course,
                    topics: topicsWithLessons,
                    untrackedLessons,
                    lessons: lessonsWithStatus,
                    stars,
                    currentLevel: levelToShow,
                    cooldownActive,
                    last_completed_at: lastCompletedAt
                  });
                });
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('[GET /api/courses/:id] Fatal error:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  if (token && token !== 'null') {
    jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
      if (err || !decoded?.id) {
        fetchCourseDetails(false, null);
      } else {
        db.get('SELECT role FROM users WHERE id = ?', [decoded.id], (err: any, user: any) => {
          fetchCourseDetails(user?.role === 'admin', decoded.id);
        });
      }
    });
  } else {
    fetchCourseDetails(false, null);
  }
});

export default router;
