import { initDb } from './src/db.js';
const db = initDb();
db.all("PRAGMA table_info(user_completed_courses)", (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  process.exit();
});
