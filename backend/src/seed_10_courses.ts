import { initDb } from './db.js';

const db = initDb();

const coursesData = [
  {
    title: 'Bolsa para Principiantes',
    title_en: 'Stocks for Beginners',
    description: 'Aprende a invertir en el mercado de valores desde cero.',
    description_en: 'Learn how to invest in the stock market from scratch.',
    category: 'Acciones',
    category_en: 'Stocks',
    points_reward: 200,
    points_price: 50,
    difficulty: 'beginner',
    visibility: 'public',
    access_level: 'free',
    topics: [
      {
        title: 'Fundamentos de la Bolsa',
        title_en: 'Stock Market Fundamentals',
        description: 'Conceptos básicos del mercado de valores.',
        description_en: 'Basic concepts of the stock market.',
        lessons: [
          {
            title: '¿Qué es una acción?',
            title_en: 'What is a stock?',
            description: 'Definición y tipos de acciones.',
            description_en: 'Definition and types of stocks.',
            content: 'Una acción representa una fracción de la propiedad de una empresa...',
            content_en: 'A stock represents a fraction of ownership in a company...',
            question: {
              text: '¿Qué adquieres al comprar una acción?',
              text_en: 'What do you acquire when buying a stock?',
              answers: [
                { text: 'Una deuda de la empresa', text_en: 'A company debt', is_correct: false },
                { text: 'Una parte de la propiedad de la empresa', text_en: 'A piece of company ownership', is_correct: true },
              ]
            }
          },
          {
            title: '¿Cómo funciona la bolsa?',
            title_en: 'How the stock market works?',
            description: 'El mercado de oferta y demanda.',
            description_en: 'The supply and demand market.',
            content: 'La bolsa funciona como un mercado donde compradores y vendedores...',
            content_en: 'The stock market works like a marketplace where buyers and sellers...',
            question: {
              text: '¿Qué determina el precio de una acción a corto plazo?',
              text_en: 'What determines the price of a stock in the short term?',
              answers: [
                { text: 'La oferta y la demanda', text_en: 'Supply and demand', is_correct: true },
                { text: 'Solo las decisiones del gobierno', text_en: 'Only government decisions', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Criptomonedas 101',
    title_en: 'Crypto 101',
    description: 'Descubre el mundo de Bitcoin, Ethereum y la blockchain.',
    description_en: 'Discover the world of Bitcoin, Ethereum and blockchain.',
    category: 'Cripto',
    category_en: 'Crypto',
    points_reward: 350,
    points_price: 150,
    difficulty: 'intermediate',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Introducción a Blockchain',
        title_en: 'Introduction to Blockchain',
        description: 'La tecnología detrás de las criptomonedas.',
        description_en: 'The technology behind cryptocurrencies.',
        lessons: [
          {
            title: '¿Qué es la Blockchain?',
            title_en: 'What is Blockchain?',
            description: 'El libro mayor descentralizado.',
            description_en: 'The decentralized ledger.',
            content: 'Blockchain es un registro inmutable y distribuido...',
            content_en: 'Blockchain is an immutable and distributed ledger...',
            question: {
              text: '¿Cuál es una característica clave de la blockchain?',
              text_en: 'What is a key feature of blockchain?',
              answers: [
                { text: 'Está controlada por un banco central', text_en: 'It is controlled by a central bank', is_correct: false },
                { text: 'Es descentralizada e inmutable', text_en: 'It is decentralized and immutable', is_correct: true },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Bienes Raíces para Todos',
    title_en: 'Real Estate for Everyone',
    description: 'Genera ingresos pasivos con inmuebles.',
    description_en: 'Generate passive income with real estate.',
    category: 'Inmobiliaria',
    category_en: 'Real Estate',
    points_reward: 500,
    points_price: 200,
    difficulty: 'advanced',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Evaluación de Propiedades',
        title_en: 'Property Evaluation',
        description: 'Cómo saber si una propiedad es buena inversión.',
        description_en: 'How to know if a property is a good investment.',
        lessons: [
          {
            title: 'El Cap Rate',
            title_en: 'The Cap Rate',
            description: 'Calculando la tasa de capitalización.',
            description_en: 'Calculating the capitalization rate.',
            content: 'El Cap Rate se calcula dividiendo el ingreso operativo neto entre el precio...',
            content_en: 'The Cap Rate is calculated by dividing the net operating income by the price...',
            question: {
              text: '¿Para qué sirve el Cap Rate?',
              text_en: 'What is the Cap Rate used for?',
              answers: [
                { text: 'Medir el rendimiento anual esperado', text_en: 'Measure expected annual return', is_correct: true },
                { text: 'Calcular el costo de los impuestos', text_en: 'Calculate tax costs', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Bonos y Renta Fija',
    title_en: 'Bonds and Fixed Income',
    description: 'Inversiones más seguras para tu portafolio.',
    description_en: 'Safer investments for your portfolio.',
    category: 'Renta Fija',
    category_en: 'Fixed Income',
    points_reward: 150,
    points_price: 0,
    difficulty: 'beginner',
    visibility: 'public',
    access_level: 'free',
    topics: [
      {
        title: 'Tipos de Bonos',
        title_en: 'Types of Bonds',
        description: 'Diferencias entre bonos corporativos y gubernamentales.',
        description_en: 'Differences between corporate and government bonds.',
        lessons: [
          {
            title: 'Bonos del Tesoro',
            title_en: 'Treasury Bonds',
            description: 'La inversión más segura.',
            description_en: 'The safest investment.',
            content: 'Los bonos del tesoro están respaldados por el gobierno...',
            content_en: 'Treasury bonds are backed by the government...',
            question: {
              text: '¿Quién emite los bonos del tesoro?',
              text_en: 'Who issues treasury bonds?',
              answers: [
                { text: 'Empresas privadas', text_en: 'Private companies', is_correct: false },
                { text: 'El Gobierno', text_en: 'The Government', is_correct: true },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Análisis Técnico Avanzado',
    title_en: 'Advanced Technical Analysis',
    description: 'Aprende a leer gráficos como un profesional.',
    description_en: 'Learn to read charts like a pro.',
    category: 'Trading',
    category_en: 'Trading',
    points_reward: 600,
    points_price: 300,
    difficulty: 'advanced',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Indicadores Técnicos',
        title_en: 'Technical Indicators',
        description: 'RSI, MACD y Medias Móviles.',
        description_en: 'RSI, MACD and Moving Averages.',
        lessons: [
          {
            title: 'Entendiendo el RSI',
            title_en: 'Understanding RSI',
            description: 'El índice de fuerza relativa.',
            description_en: 'The relative strength index.',
            content: 'El RSI mide la velocidad y el cambio de los movimientos de precios...',
            content_en: 'The RSI measures the speed and change of price movements...',
            question: {
              text: '¿Qué indica un RSI por encima de 70?',
              text_en: 'What does an RSI above 70 indicate?',
              answers: [
                { text: 'Sobrecompra', text_en: 'Overbought', is_correct: true },
                { text: 'Sobrevenda', text_en: 'Oversold', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'ETFs y Fondos Indexados',
    title_en: 'ETFs and Index Funds',
    description: 'La forma más fácil de diversificar.',
    description_en: 'The easiest way to diversify.',
    category: 'Fondos',
    category_en: 'Funds',
    points_reward: 250,
    points_price: 100,
    difficulty: 'beginner',
    visibility: 'public',
    access_level: 'free',
    topics: [
      {
        title: 'Diversificación Automática',
        title_en: 'Automatic Diversification',
        description: 'Cómo los ETFs reducen el riesgo.',
        description_en: 'How ETFs reduce risk.',
        lessons: [
          {
            title: '¿Qué es el S&P 500?',
            title_en: 'What is the S&P 500?',
            description: 'El índice más famoso.',
            description_en: 'The most famous index.',
            content: 'El S&P 500 sigue el rendimiento de las 500 empresas más grandes de EE. UU...',
            content_en: 'The S&P 500 tracks the performance of the 500 largest US companies...',
            question: {
              text: '¿Cuántas empresas incluye aproximadamente el S&P 500?',
              text_en: 'How many companies does the S&P 500 roughly include?',
              answers: [
                { text: '50', text_en: '50', is_correct: false },
                { text: '500', text_en: '500', is_correct: true },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Opciones y Derivados',
    title_en: 'Options and Derivatives',
    description: 'Apalancamiento y cobertura.',
    description_en: 'Leverage and hedging.',
    category: 'Derivados',
    category_en: 'Derivatives',
    points_reward: 800,
    points_price: 400,
    difficulty: 'advanced',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Opciones Call y Put',
        title_en: 'Call and Put Options',
        description: 'Conceptos básicos de opciones.',
        description_en: 'Basic options concepts.',
        lessons: [
          {
            title: '¿Qué es una opción Call?',
            title_en: 'What is a Call option?',
            description: 'El derecho a comprar.',
            description_en: 'The right to buy.',
            content: 'Una opción Call te da el derecho, pero no la obligación, de comprar un activo...',
            content_en: 'A Call option gives you the right, but not the obligation, to buy an asset...',
            question: {
              text: '¿Qué te otorga una opción Call?',
              text_en: 'What does a Call option grant you?',
              answers: [
                { text: 'El derecho a comprar', text_en: 'The right to buy', is_correct: true },
                { text: 'La obligación de vender', text_en: 'The obligation to sell', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Inversión en Startups',
    title_en: 'Startup Investing',
    description: 'Capital de riesgo e inversión ángel.',
    description_en: 'Venture capital and angel investing.',
    category: 'Venture Capital',
    category_en: 'Venture Capital',
    points_reward: 700,
    points_price: 350,
    difficulty: 'advanced',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Evaluación de Startups',
        title_en: 'Evaluating Startups',
        description: 'Cómo elegir a los ganadores.',
        description_en: 'How to pick the winners.',
        lessons: [
          {
            title: 'El Equipo vs La Idea',
            title_en: 'Team vs Idea',
            description: 'Qué es más importante.',
            description_en: 'What is more important.',
            content: 'La mayoría de inversores ángeles prefieren un equipo excepcional con una idea mediocre que...',
            content_en: 'Most angel investors prefer an outstanding team with a mediocre idea than...',
            question: {
              text: '¿Qué suelen valorar más los inversores en etapas tempranas?',
              text_en: 'What do early-stage investors usually value more?',
              answers: [
                { text: 'El equipo fundador', text_en: 'The founding team', is_correct: true },
                { text: 'El mobiliario de la oficina', text_en: 'Office furniture', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Divisas y Forex',
    title_en: 'Forex Trading',
    description: 'El mercado más grande del mundo.',
    description_en: 'The largest market in the world.',
    category: 'Forex',
    category_en: 'Forex',
    points_reward: 400,
    points_price: 200,
    difficulty: 'intermediate',
    visibility: 'public',
    access_level: 'premium',
    topics: [
      {
        title: 'Pares de Divisas',
        title_en: 'Currency Pairs',
        description: 'Cómo se cotizan las monedas.',
        description_en: 'How currencies are quoted.',
        lessons: [
          {
            title: 'Pares Mayores',
            title_en: 'Major Pairs',
            description: 'EUR/USD, GBP/USD, etc.',
            description_en: 'EUR/USD, GBP/USD, etc.',
            content: 'Los pares mayores siempre incluyen el Dólar Estadounidense (USD)...',
            content_en: 'Major pairs always include the US Dollar (USD)...',
            question: {
              text: '¿Qué moneda está siempre presente en un par "mayor"?',
              text_en: 'Which currency is always present in a "major" pair?',
              answers: [
                { text: 'El Euro', text_en: 'The Euro', is_correct: false },
                { text: 'El Dólar Estadounidense', text_en: 'The US Dollar', is_correct: true },
              ]
            }
          }
        ]
      }
    ]
  },
  {
    title: 'Finanzas Personales',
    title_en: 'Personal Finance',
    description: 'Organiza tu dinero antes de invertir.',
    description_en: 'Organize your money before investing.',
    category: 'Finanzas',
    category_en: 'Finance',
    points_reward: 100,
    points_price: 0,
    difficulty: 'beginner',
    visibility: 'public',
    access_level: 'free',
    topics: [
      {
        title: 'Presupuesto y Ahorro',
        title_en: 'Budgeting and Saving',
        description: 'La base de la riqueza.',
        description_en: 'The foundation of wealth.',
        lessons: [
          {
            title: 'Regla 50/30/20',
            title_en: '50/30/20 Rule',
            description: 'Cómo dividir tus ingresos.',
            description_en: 'How to split your income.',
            content: '50% para necesidades, 30% para deseos y 20% para ahorros/inversión...',
            content_en: '50% for needs, 30% for wants, and 20% for savings/investing...',
            question: {
              text: 'Según la regla 50/30/20, ¿cuánto debes destinar al ahorro e inversión?',
              text_en: 'According to the 50/30/20 rule, how much should you allocate to savings and investing?',
              answers: [
                { text: '20%', text_en: '20%', is_correct: true },
                { text: '50%', text_en: '50%', is_correct: false },
              ]
            }
          }
        ]
      }
    ]
  }
];

db.serialize(() => {
  // Opcional: limpiar antes de insertar o simplemente añadir los 10
  // Aquí los añadiremos manteniendo los usuarios existentes
  
  const insertCourseStmt = db.prepare('INSERT INTO courses (title, title_en, description, description_en, category, category_en, points_reward, points_price, difficulty, visibility, access_level) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertTopicStmt = db.prepare('INSERT INTO topics (course_id, title, title_en, description, description_en, sort_order) VALUES (?, ?, ?, ?, ?, ?)');
  const insertLessonStmt = db.prepare('INSERT INTO lessons (course_id, topic_id, title, title_en, description, description_en, content, content_en, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insertQuestionStmt = db.prepare('INSERT INTO questions (lesson_id, text, text_en, points) VALUES (?, ?, ?, ?)');
  const insertAnswerStmt = db.prepare('INSERT INTO answers (question_id, text, text_en, is_correct) VALUES (?, ?, ?, ?)');

  let tOrder = 1;
  let lOrder = 1;

  for (const course of coursesData) {
    insertCourseStmt.run([
      course.title, course.title_en, course.description, course.description_en, course.category, course.category_en, course.points_reward, course.points_price, course.difficulty, course.visibility, course.access_level
    ], function(this: any, err: any) {
      if (err) return console.error(err);
      const courseId = this.lastID;
      
      for (const topic of course.topics) {
        insertTopicStmt.run([
          courseId, topic.title, topic.title_en, topic.description, topic.description_en, tOrder++
        ], function(this: any, err: any) {
          if (err) return console.error(err);
          const topicId = this.lastID;

          for (const lesson of topic.lessons) {
            insertLessonStmt.run([
              courseId, topicId, lesson.title, lesson.title_en, lesson.description, lesson.description_en, lesson.content, lesson.content_en, lOrder++
            ], function(this: any, err: any) {
              if (err) return console.error(err);
              const lessonId = this.lastID;

              if (lesson.question) {
                insertQuestionStmt.run([
                  lessonId, lesson.question.text, lesson.question.text_en, 15
                ], function(this: any, err: any) {
                  if (err) return console.error(err);
                  const qId = this.lastID;

                  for (const ans of lesson.question.answers) {
                    insertAnswerStmt.run([
                      qId, ans.text, ans.text_en, ans.is_correct
                    ]);
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  // insertCourseStmt.finalize();
  // insertTopicStmt.finalize();
  // insertLessonStmt.finalize();
  // insertQuestionStmt.finalize();
  // insertAnswerStmt.finalize();

  console.log('10 courses seeded successfully.');
});
