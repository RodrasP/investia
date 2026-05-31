import { initDb } from './src/db.js';
const db = initDb();
db.all("SELECT id, title, access_level FROM courses", (err, rows) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(rows, null, 2));
  process.exit();
});
