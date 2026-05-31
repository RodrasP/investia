import { initDb } from './src/db.js';
const db = initDb();
db.all("SELECT last_completed_at FROM user_completed_courses WHERE last_completed_at IS NOT NULL LIMIT 5", (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  process.exit();
});
