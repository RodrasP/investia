import { initDb } from './src/db.js';
const db = initDb();
db.all("SELECT * FROM courses", (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
});
