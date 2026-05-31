import { initDb } from './db.js';
import bcrypt from 'bcryptjs';

const db = initDb();

db.serialize(() => {
  // Clear existing data
  db.run('DELETE FROM answers');
  db.run('DELETE FROM questions');
  db.run('DELETE FROM lessons');
  db.run('DELETE FROM courses');
  db.run('DELETE FROM users');

  // Create admin user
  const adminPassword = bcrypt.hashSync('admin123', 8);
  db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', ['admin@investia.com', adminPassword, 'Admin', 'admin']);

  // Create normal user
  const userPassword = bcrypt.hashSync('user123', 8);
  db.run('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', ['user@example.com', userPassword, 'John Doe', 'user']);

  // Create a course
  db.run('INSERT INTO courses (title, title_en, description, description_en, category, category_en, points_reward, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [
      'Introducción a la Inversión', 
      'Introduction to Investment',
      'Aprende los conceptos básicos del mundo financiero.', 
      'Learn the basic concepts of the financial world.',
      'Fundamentos',
      'Basics',
      500,
      'beginner'
    ], function(this: any, err: any) {
      if (err) return console.error(err);
      const courseId = this.lastID;

      // Lesson 1
      db.run('INSERT INTO lessons (course_id, title, description, content, sort_order) VALUES (?, ?, ?, ?, ?)',
        [courseId, '¿Qué es invertir?', 'Breve introducción al concepto de inversión.', 'Invertir es poner tu dinero a trabajar para generar más dinero en el futuro...', 1], function(this: any, err: any) {
          if (err) return console.error(err);
          const lessonId = this.lastID;
          
          // Question 1
          db.run('INSERT INTO questions (lesson_id, text) VALUES (?, ?)', [lessonId, '¿Cuál es el objetivo principal de invertir?'], function(this: any, err: any) {
            if (err) return console.error(err);
            const qId = this.lastID;
            db.run('INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, 'Perder dinero', false]);
            db.run('INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, 'Generar rentabilidad a futuro', true]);
            db.run('INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, 'Guardar el dinero bajo el colchón', false]);
          });
      });

      // Lesson 2
      db.run('INSERT INTO lessons (course_id, title, description, content, sort_order) VALUES (?, ?, ?, ?, ?)',
        [courseId, 'Interés Compuesto', 'La octava maravilla del mundo.', 'El interés compuesto es el interés de un capital al que se van acumulando los intereses para que produzcan otros nuevos...', 2], function(this: any, err: any) {
          if (err) return console.error(err);
          const lessonId = this.lastID;
          
          // Question 1
          db.run('INSERT INTO questions (lesson_id, text) VALUES (?, ?)', [lessonId, '¿Qué hace que el interés compuesto sea tan potente?'], function(this: any, err: any) {
            if (err) return console.error(err);
            const qId = this.lastID;
            db.run('INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, 'El tiempo y la reinversión', true]);
            db.run('INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)', [qId, 'Gastar los beneficios pronto', false]);
          });
      });
  });

  console.log('Database seeded successfully.');
});
