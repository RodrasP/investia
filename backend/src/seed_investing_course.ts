import { initDb } from './db.js';

const db = initDb();

const courseData = {
  title: 'El Arte de Invertir: Tu Futuro Empieza Hoy',
  title_en: 'The Art of Investing: Your Future Starts Today',
  description: 'Un curso práctico para entender cómo hacer que tu dinero trabaje para ti y construir libertad financiera.',
  description_en: 'A practical course to understand how to make your money work for you and build financial freedom.',
  category: 'Finanzas Personales',
  category_en: 'Personal Finance',
  points_reward: 1000,
  difficulty: 'beginner',
  lessons: [
    {
      title: '¿Qué es invertir realmente?',
      title_en: 'What is investing really?',
      content: `Invertir es poner tu dinero a trabajar para que crezca con el tiempo. En lugar de dejarlo parado, lo utilizas para comprar activos como acciones, fondos, inmuebles o negocios que pueden aumentar de valor o generarte ingresos. 

La principal diferencia entre ahorrar e invertir es que ahorrar guarda el dinero, mientras que invertir busca multiplicarlo. Y esto es importante porque con el paso de los años la inflación hace que el dinero pierda valor. Es decir, lo que hoy puedes comprar con 100 euros, dentro de unos años probablemente costará más.`,
      content_en: `Investing is putting your money to work so that it grows over time. Instead of leaving it idle, you use it to buy assets such as stocks, funds, real estate or businesses that can increase in value or generate income for you.

The main difference between saving and investing is that saving keeps money, while investing seeks to multiply it. And this is important because over the years inflation causes money to lose value. That is, what you can buy today for 100 euros will probably cost more in a few years.`,
      questions: [
        {
          text: '¿Cuál es la principal diferencia entre ahorrar e invertir?',
          type: 'multiple_choice',
          difficulty: 'easy',
          answers: [
            { text: 'Ahorrar es más arriesgado que invertir', is_correct: false },
            { text: 'Ahorrar guarda el dinero, mientras que invertir busca multiplicarlo', is_correct: true },
            { text: 'No hay ninguna diferencia real', is_correct: false },
            { text: 'Invertir es solo para gente rica', is_correct: false }
          ]
        },
        {
          text: 'Si la inflación es del 3% anual y tu dinero no crece, ¿qué sucede con tu poder adquisitivo?',
          type: 'multiple_choice',
          difficulty: 'medium',
          answers: [
            { text: 'Aumenta, porque el dinero vale más', is_correct: false },
            { text: 'Se mantiene igual', is_correct: false },
            { text: 'Disminuye, porque los precios suben y tu dinero compra menos', is_correct: true },
            { text: 'No afecta en nada', is_correct: false }
          ]
        },
        {
          text: '¿Cuál de estos NO se considera un activo de inversión en el texto?',
          type: 'multiple_choice',
          difficulty: 'hard',
          answers: [
            { text: 'Acciones de una empresa', is_correct: false },
            { text: 'Un coche para uso personal', is_correct: true },
            { text: 'Un inmueble para alquilar', is_correct: false },
            { text: 'Un fondo indexado', is_correct: false }
          ]
        }
      ]
    },
    {
      title: 'Objetivos y Libertad Financiera',
      title_en: 'Goals and Financial Freedom',
      content: `La gente invierte para conseguir objetivos importantes: tener más tranquilidad económica, crear ingresos pasivos, prepararse para la jubilación o alcanzar libertad financiera. 

La libertad financiera significa no depender únicamente de un sueldo para vivir. Cuando tus inversiones empiezan a generar dinero por sí solas, ganas más tiempo, más opciones y más estabilidad.`,
      content_en: `People invest to achieve important goals: to have more financial peace of mind, to create passive income, to prepare for retirement or to achieve financial freedom.

Financial freedom means not depending solely on a salary to live. When your investments start generating money on their own, you gain more time, more options and more stability.`,
      questions: [
        {
          text: '¿Qué significa alcanzar la libertad financiera?',
          type: 'multiple_choice',
          difficulty: 'easy',
          answers: [
            { text: 'Tener un sueldo muy alto en un trabajo que no te gusta', is_correct: false },
            { text: 'No depender únicamente de un sueldo para vivir', is_correct: true },
            { text: 'Tener mucho dinero guardado en el banco sin tocarlo', is_correct: false }
          ]
        },
        {
          text: '¿Qué ventaja principal ofrece generar ingresos pasivos?',
          type: 'multiple_choice',
          difficulty: 'medium',
          answers: [
            { text: 'Poder trabajar más horas', is_correct: false },
            { text: 'Ganar más tiempo y estabilidad sin depender de un sueldo fijo', is_correct: true },
            { text: 'Hacerse rico en una semana', is_correct: false }
          ]
        },
        {
          text: 'Completa la frase: La libertad financiera permite tener más _, más opciones y más estabilidad.',
          type: 'fill_in_blanks',
          difficulty: 'hard',
          answers: [
            { text: 'tiempo', is_correct: true },
            { text: 'estrés', is_correct: false },
            { text: 'trabajo', is_correct: false }
          ]
        }
      ]
    },
    {
      title: 'El Secreto del Tiempo: Interés Compuesto',
      title_en: 'The Secret of Time: Compound Interest',
      content: `Una de las claves más importantes de la inversión es el interés compuesto. Esto significa que no solo ganas dinero sobre lo que inviertes, sino también sobre las ganancias que vas acumulando. 

Por eso el tiempo es tan poderoso. Aunque empieces con poco dinero, si eres constante y mantienes tus inversiones durante años, el crecimiento puede ser enorme.`,
      content_en: `One of the most important keys to investment is compound interest. This means that you not only earn money on what you invest, but also on the profits you accumulate.

That's why time is so powerful. Even if you start with little money, if you are constant and maintain your investments for years, the growth can be huge.`,
      questions: [
        {
          text: '¿En qué consiste el interés compuesto?',
          type: 'multiple_choice',
          difficulty: 'easy',
          answers: [
            { text: 'En ganar intereses solo sobre el capital inicial', is_correct: false },
            { text: 'En ganar dinero sobre lo invertido y sobre las ganancias acumuladas', is_correct: true },
            { text: 'En un tipo de interés que nunca cambia', is_correct: false }
          ]
        },
        {
          text: '¿Por qué es tan importante empezar a invertir lo antes posible?',
          type: 'multiple_choice',
          difficulty: 'medium',
          answers: [
            { text: 'Para gastar el dinero rápido', is_correct: false },
            { text: 'Para que el interés compuesto tenga más tiempo para actuar', is_correct: true },
            { text: 'Porque las inversiones seguras solo existen al principio', is_correct: false }
          ]
        },
        {
          text: 'El tiempo es el factor más poderoso en el crecimiento de una inversión.',
          type: 'true_false',
          difficulty: 'hard',
          answers: [
            { text: 'Verdadero', is_correct: true },
            { text: 'Falso', is_correct: false }
          ]
        }
      ]
    },
    {
      title: 'Riesgo y Gestión de Activos',
      title_en: 'Risk and Asset Management',
      content: `También es importante entender que toda inversión tiene riesgo. Algunas inversiones son más seguras y crecen más lento, y otras pueden subir mucho pero también bajar rápidamente. La clave no es evitar el riesgo, sino aprender a gestionarlo y no invertir en cosas que no entiendes.

Para alguien que empieza, una de las opciones más recomendadas suelen ser los fondos indexados, porque permiten invertir en muchas empresas al mismo tiempo, con menos riesgo y de forma sencilla.`,
      content_en: `It is also important to understand that every investment has risk. Some investments are safer and grow slower, and others can go up a lot but also go down quickly. The key is not to avoid risk, but to learn to manage it and not invest in things you don't understand.

For someone starting out, one of the most recommended options are indexed funds, because they allow investing in many companies at the same time, with less risk and in a simple way.`,
      questions: [
        {
          text: '¿Cuál es la clave para manejar el riesgo según el curso?',
          type: 'multiple_choice',
          difficulty: 'easy',
          answers: [
            { text: 'Evitar cualquier tipo de riesgo a toda costa', is_correct: false },
            { text: 'Aprender a gestionarlo y no invertir en lo que no entiendes', is_correct: true },
            { text: 'Invertir solo cuando el mercado está subiendo mucho', is_correct: false }
          ]
        },
        {
          text: '¿Por qué los fondos indexados son recomendados para principiantes?',
          type: 'multiple_choice',
          difficulty: 'medium',
          answers: [
            { text: 'Porque no tienen ningún riesgo', is_correct: false },
            { text: 'Porque permiten diversificar en muchas empresas de forma sencilla', is_correct: true },
            { text: 'Porque te aseguran hacerte rico en un año', is_correct: false }
          ]
        },
        {
          text: 'Empareja los conceptos con su definición:',
          type: 'match_concepts',
          difficulty: 'hard',
          answers: [
            { text: 'Fondos indexados', text_en: 'Invertir en muchas empresas a la vez', is_correct: true },
            { text: 'Inflación', text_en: 'Pérdida de valor del dinero con el tiempo', is_correct: true },
            { text: 'Riesgo', text_en: 'Posibilidad de que la inversión baje de valor', is_correct: true }
          ]
        }
      ]
    },
    {
      title: 'Mentalidad del Inversor',
      title_en: 'Investor Mindset',
      content: `Muchas personas creen que invertir es hacerse rico rápido, pero en realidad funciona más como una carrera de paciencia y constancia. Los mayores errores suelen ser dejarse llevar por las emociones, querer ganar dinero rápido o no empezar nunca por miedo.

En resumen, invertir sirve para hacer crecer tu dinero, protegerlo con el paso del tiempo y construir un mejor futuro financiero. Lo más importante al comenzar es crear el hábito de invertir poco a poco y pensar a largo plazo.`,
      content_en: `Many people believe that investing is getting rich quick, but in reality it works more like a race of patience and constancy. The biggest mistakes are usually being carried away by emotions, wanting to earn money fast or never starting for fear.

In short, investing serves to make your money grow, protect it over time and build a better financial future. The most important thing when starting out is to create the habit of investing little by little and thinking long-term.`,
      questions: [
        {
          text: '¿Cuál es uno de los mayores errores de un inversor principiante?',
          type: 'multiple_choice',
          difficulty: 'easy',
          answers: [
            { text: 'Tener demasiada paciencia', is_correct: false },
            { text: 'Dejarse llevar por las emociones y buscar dinero rápido', is_correct: true },
            { text: 'Pensar demasiado en el largo plazo', is_correct: false }
          ]
        },
        {
          text: '¿Cuál es el hábito más importante al empezar a invertir?',
          type: 'multiple_choice',
          difficulty: 'medium',
          answers: [
            { text: 'Invertir solo una vez una gran cantidad', is_correct: false },
            { text: 'Invertir poco a poco con constancia y pensar a largo plazo', is_correct: true },
            { text: 'Cambiar de estrategia cada semana', is_correct: false }
          ]
        },
        {
          text: 'Ordena los pasos ideales para un nuevo inversor:',
          type: 'drag_drop',
          difficulty: 'hard',
          answers: [
            { text: '1. Empezar con poco', is_correct: true },
            { text: '2. Aprender constantemente', is_correct: true },
            { text: '3. Mantener la disciplina', is_correct: true }
          ]
        }
      ]
    }
  ]
};

async function seed() {
  db.serialize(() => {
    // Clean up existing course with same title to avoid duplicates
    db.run('DELETE FROM answers WHERE question_id IN (SELECT q.id FROM questions q JOIN lessons l ON q.lesson_id = l.id JOIN courses c ON l.course_id = c.id WHERE c.title = ?)', [courseData.title]);
    db.run('DELETE FROM questions WHERE lesson_id IN (SELECT l.id FROM lessons l JOIN courses c ON l.course_id = c.id WHERE c.title = ?)', [courseData.title]);
    db.run('DELETE FROM lessons WHERE course_id IN (SELECT id FROM courses WHERE title = ?)', [courseData.title]);
    db.run('DELETE FROM courses WHERE title = ?', [courseData.title]);

    db.run('INSERT INTO courses (title, title_en, description, description_en, category, category_en, points_reward, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
      [
        courseData.title,
        courseData.title_en,
        courseData.description,
        courseData.description_en,
        courseData.category,
        courseData.category_en,
        courseData.points_reward,
        courseData.difficulty
      ], function(this: any, err: any) {
        if (err) return console.error(err);
        const courseId = this.lastID;

        courseData.lessons.forEach((lesson, index) => {
          db.run('INSERT INTO lessons (course_id, title, title_en, content, content_en, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
            [courseId, lesson.title, lesson.title_en, lesson.content, lesson.content_en, index + 1], function(this: any, err: any) {
              if (err) return console.error(err);
              const lessonId = this.lastID;

              lesson.questions.forEach((q) => {
                db.run('INSERT INTO questions (lesson_id, text, type, difficulty) VALUES (?, ?, ?, ?)', [lessonId, q.text, q.type, q.difficulty], function(this: any, err: any) {
                  if (err) return console.error(err);
                  const qId = this.lastID;

                  q.answers.forEach((a) => {
                    db.run('INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)', 
                      [qId, a.text, a.text_en || null, a.is_correct]);
                  });
                });
              });
            });
        });
        console.log('Curso "El Arte de Invertir" creado con éxito con 3 niveles de dificultad.');
      });
  });
}

seed();
