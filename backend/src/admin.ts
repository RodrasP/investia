import express from 'express';
import { initDb } from './db.js';
import { verifyToken, verifyAdmin } from './auth.js';
import { regenerateLives } from './courses.js';

const router = express.Router();
const db = initDb();
// Middleware to verify admin role

// Get all users with progress stats
router.get('/users', verifyToken, verifyAdmin, (req, res) => {
  console.log("Admin: Fetching all users");
  const query = `
    SELECT 
      u.id, u.email, u.name, u.points, u.role, u.lives, u.last_life_regen, u.subscription_status, u.subscription_expiry,
      (SELECT COUNT(*) FROM user_progress WHERE user_id = u.id) as lessons_completed
    FROM users u
  `;
  db.all(query, [], (err: any, users: any[]) => {
    if (err) {
      console.error("Admin: Error fetching users:", err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    console.log(`Admin: Found ${users?.length || 0} users`);
    res.json(users || []);
  });
});

// Update user role
router.patch('/users/:id/role', verifyToken, verifyAdmin, (req, res) => {
  const { role } = req.body;
  const userId = req.params.id;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  db.run('UPDATE users SET role = ? WHERE id = ?', [role, userId], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating role' });
    res.json({ message: 'Role updated successfully' });
  });
});

// Update user points, lives, vestias and subscription
router.patch('/users/:id/stats', verifyToken, verifyAdmin, (req, res) => {
  const { points, lives, vestias, subscription_status, premium_months } = req.body;
  const userId = req.params.id;

  if (points === undefined && lives === undefined && vestias === undefined && subscription_status === undefined) {
    return res.status(400).json({ message: 'Nothing to update' });
  }

  const updates: string[] = [];
  const params: any[] = [];

  if (points !== undefined) {
    updates.push('points = ?');
    params.push(points);
  }

  if (lives !== undefined) {
    updates.push('lives = ?');
    params.push(lives);
    if (lives === 5) {
      updates.push('last_life_regen = (strftime(\'%Y-%m-%dT%H:%M:%SZ\', \'now\'))');
    }
  }

  if (vestias !== undefined) {
    updates.push('vestias = ?');
    params.push(vestias);
  }

  if (subscription_status !== undefined) {
    if (!['free', 'premium'].includes(subscription_status)) {
      return res.status(400).json({ message: 'Invalid subscription status' });
    }
    updates.push('subscription_status = ?');
    params.push(subscription_status);

    if (subscription_status === 'premium') {
      const months = parseInt(premium_months, 10) || 1;
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
      updates.push('subscription_expiry = ?');
      params.push(expiryDate.toISOString());
    } else {
      updates.push('subscription_expiry = NULL');
    }
  }

  params.push(userId);
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(query, params, (err: any) => {
    if (err) return res.status(500).json({ message: 'Error updating stats' });
    res.json({ message: 'Stats updated successfully' });
  });
});

// Get course progress for all enrolled users
router.get('/courses/:id/progress', verifyToken, verifyAdmin, (req, res) => {
  const courseId = req.params.id;
  
  const query = `
    SELECT 
      u.id, u.email, u.name,
      (SELECT COUNT(*) FROM lessons WHERE course_id = ?) as total_lessons,
      (SELECT COUNT(*) FROM user_progress up 
       JOIN lessons l ON up.lesson_id = l.id 
       WHERE up.user_id = u.id AND l.course_id = ?) as completed_lessons
    FROM users u
    JOIN user_subscriptions us ON u.id = us.user_id
    WHERE us.course_id = ?
  `;

  db.all(query, [courseId, courseId, courseId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching course progress' });
    res.json(rows || []);
  });
});

// Get all user answers for a course
router.get('/courses/:id/answers', verifyToken, verifyAdmin, (req, res) => {
  const courseId = req.params.id;
  
  const query = `
    SELECT 
      ua.id, ua.is_correct, ua.answered_at,
      u.name as user_name, u.email as user_email, u.id as user_id,
      q.text as question_text,
      a.text as answer_text,
      l.title as lesson_title
    FROM user_answers ua
    JOIN users u ON ua.user_id = u.id
    JOIN questions q ON ua.question_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    LEFT JOIN answers a ON ua.answer_id = a.id
    WHERE l.course_id = ?
    ORDER BY ua.answered_at DESC
  `;

  db.all(query, [courseId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching course answers' });
    res.json(rows || []);
  });
});

// Get detailed user answers for a course
router.get('/users/:userId/courses/:courseId/answers', verifyToken, verifyAdmin, (req, res) => {
  const { userId, courseId } = req.params;
  
  const query = `
    SELECT 
      ua.id, ua.is_correct, ua.answered_at,
      q.text as question_text,
      a.text as answer_text,
      l.title as lesson_title,
      l.id as lesson_id
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    LEFT JOIN answers a ON ua.answer_id = a.id
    WHERE ua.user_id = ? AND l.course_id = ?
    ORDER BY ua.answered_at DESC
  `;

  db.all(query, [userId, courseId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching user answers' });
    res.json(rows || []);
  });
});

// Get all user answers (for user profile view)
router.get('/users/:userId/answers', verifyToken, verifyAdmin, (req, res) => {
  const { userId } = req.params;
  
  const query = `
    SELECT 
      ua.id, ua.is_correct, ua.answered_at,
      q.text as question_text,
      a.text as answer_text,
      l.title as lesson_title,
      c.title as course_title,
      c.id as course_id
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    JOIN lessons l ON q.lesson_id = l.id
    JOIN courses c ON l.course_id = c.id
    LEFT JOIN answers a ON ua.answer_id = a.id
    WHERE ua.user_id = ?
    ORDER BY ua.answered_at DESC
  `;

  db.all(query, [userId], (err: any, rows: any[]) => {
    if (err) return res.status(500).json({ message: 'Error fetching all user answers' });
    res.json(rows || []);
  });
});

// Delete specific answers and reset progress for a course/lesson
router.post('/users/:userId/reset-progress', verifyToken, verifyAdmin, (req, res) => {
  const { userId } = req.params;
  const { courseId, lessonId, answerIds } = req.body;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    try {
      if (answerIds && answerIds.length > 0) {
        const placeholders = answerIds.map(() => '?').join(',');
        
        // Remove completion for the courses affected by these answers
        db.run(`
          DELETE FROM user_completed_courses 
          WHERE user_id = ? 
          AND course_id IN (
            SELECT l.course_id 
            FROM lessons l
            JOIN questions q ON l.id = q.lesson_id
            JOIN user_answers ua ON q.id = ua.question_id
            WHERE ua.id IN (${placeholders}) AND ua.user_id = ?
          )
        `, [userId, ...answerIds, userId]);

        // Reset progress for lessons associated with these specific answers
        db.run(`
          DELETE FROM user_progress 
          WHERE user_id = ? 
          AND lesson_id IN (
            SELECT q.lesson_id 
            FROM questions q 
            JOIN user_answers ua ON q.id = ua.question_id 
            WHERE ua.id IN (${placeholders}) AND ua.user_id = ?
          )
        `, [userId, ...answerIds, userId]);

        db.run(`DELETE FROM user_answers WHERE user_id = ? AND id IN (${placeholders})`, [userId, ...answerIds]);
      } else if (lessonId) {
        db.get('SELECT course_id FROM lessons WHERE id = ?', [lessonId], (err: any, lesson: any) => {
          if (lesson) {
            db.run('DELETE FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, lesson.course_id]);
          }
        });
        db.run(`DELETE FROM user_answers WHERE user_id = ? AND question_id IN (SELECT id FROM questions WHERE lesson_id = ?)`, [userId, lessonId]);
        db.run(`DELETE FROM user_progress WHERE user_id = ? AND lesson_id = ?`, [userId, lessonId]);
      } else if (courseId) {
        db.run('DELETE FROM user_completed_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
        db.run(`DELETE FROM user_answers WHERE user_id = ? AND question_id IN (SELECT q.id FROM questions q JOIN lessons l ON q.lesson_id = l.id WHERE l.course_id = ?)`, [userId, courseId]);
        db.run(`DELETE FROM user_progress WHERE user_id = ? AND lesson_id IN (SELECT id FROM lessons WHERE course_id = ?)`, [userId, courseId]);
      }

      db.run('COMMIT', (err) => {
        if (err) throw err;
        res.json({ message: 'Progress reset successfully' });
      });
    } catch (e) {
      db.run('ROLLBACK');
      res.status(500).json({ message: 'Error resetting progress' });
    }
  });
});

// Expel user from course (delete subscription)
router.delete('/courses/:courseId/enrollments/:userId', verifyToken, verifyAdmin, (req, res) => {
  const { courseId, userId } = req.params;

  db.run('DELETE FROM user_subscriptions WHERE user_id = ? AND course_id = ?', [userId, courseId], (err: any) => {
    if (err) return res.status(500).json({ message: 'Error expelling user' });
    res.json({ message: 'User expelled from course successfully' });
  });
});

// Reset a specific question for a user
router.delete('/users/:userId/answers/question/:questionId', verifyToken, verifyAdmin, (req, res) => {
  const { userId, questionId } = req.params;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    try {
      // 1. Delete the user's answer for this specific question
      db.run('DELETE FROM user_answers WHERE user_id = ? AND question_id = ?', [userId, questionId]);

      // 2. We don't necessarily want to remove user_progress or user_completed_courses 
      // unless we want to force them to re-complete the whole lesson/course.
      // Usually, deleting the answer is enough to let them try again in the UI.

      db.run('COMMIT', (err) => {
        if (err) throw err;
        res.json({ message: 'Question reset successfully' });
      });
    } catch (e) {
      db.run('ROLLBACK');
      res.status(500).json({ message: 'Error resetting question' });
    }
  });
});

export default router;
