import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Point to where backend/src/db.ts points: one level up from src
const DB_PATH = path.join(__dirname, 'database.sqlite');

console.log('Using DB at:', DB_PATH);

const db = new sqlite3.Database(DB_PATH);

const run = (query: string, params: any[] = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

async function seed() {
  console.log('Seeding QA course...');
  
  try {
    // 1. Create Course
    const courseId = await run(
      `INSERT INTO courses (title, description, category, difficulty, access_level, visibility, points_reward) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['QA: Todos los Tipos de Preguntas', 'Un curso diseñado para probar el funcionamiento de cada tipo de ejercicio.', 'Testing', 'beginner', 'free', 'public', 500]
    );

    // 2. Create Topic
    const topicId = await run(
      `INSERT INTO topics (course_id, title, sort_order) VALUES (?, ?, ?)`,
      [courseId, 'Laboratorio de Pruebas', 1]
    );

    // 3. Create Lesson (Include course_id)
    const lessonId = await run(
      `INSERT INTO lessons (course_id, topic_id, title, content, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [courseId, topicId, 'Test de Funcionamiento', 'En esta lección probaremos todos los tipos de preguntas para verificar que la lógica y la visualización son correctas.', 1]
    );

    console.log(`Created Course ${courseId}, Topic ${topicId}, Lesson ${lessonId}`);

    // 4. Questions
    
    // Multiple Choice
    const q1 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, '¿Cuál es la moneda de reserva más utilizada en el mundo?', 'multiple_choice', 10]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q1, 'Dólar Estadounidense', 1]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q1, 'Euro', 0]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q1, 'Yen', 0]);

    // True/False
    const q2 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'El interés compuesto permite ganar intereses sobre los intereses ya generados.', 'true_false', 10]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q2, 'Verdadero', 1]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q2, 'Falso', 0]);

    // Fill in Blanks
    const q3 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'La _ es la subida generalizada de los precios de los bienes y servicios.', 'fill_in_blanks', 10]);
    await run(`INSERT INTO answers (question_id, text, is_correct) VALUES (?, ?, ?)`, [q3, 'inflación', 1]);

    // Connect Arrows
    const q5 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'Une con flechas el país con su banco central.', 'connect_arrows', 20]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q5, 'FED', 'Estados Unidos', 1]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q5, 'BCE', 'Eurozona', 1]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q5, 'BoJ', 'Japón', 1]);

    // Matching Columns
    const q6 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'Relaciona cada término con su definición.', 'matching_columns', 20]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q6, 'Activo que se puede convertir en efectivo rápido', 'Liquidez', 1]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q6, 'Distribución de beneficios a accionistas', 'Dividendo', 1]);

    // Match Concepts
    const q7 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'Empareja los siguientes conceptos financieros.', 'match_concepts', 20]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q7, 'Bajo riesgo', 'Bonos del Tesoro', 1]);
    await run(`INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)`, [q7, 'Alto riesgo', 'Criptomonedas', 1]);

    // Image-Text Association
    const q8 = await run(`INSERT INTO questions (lesson_id, text, type, points) VALUES (?, ?, ?, ?)`, 
      [lessonId, 'Asocia cada logotipo con su nombre correspondiente.', 'image_text_association', 20]);
    await run(`INSERT INTO answers (question_id, text, image_url, is_correct) VALUES (?, ?, ?, ?)`, [q8, 'Bitcoin', 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', 1]);
    await run(`INSERT INTO answers (question_id, text, image_url, is_correct) VALUES (?, ?, ?, ?)`, [q8, 'Ethereum', 'https://cryptologos.cc/logos/ethereum-eth-logo.png', 1]);

    console.log('QA course seeded successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    db.close();
  }
}

seed();
