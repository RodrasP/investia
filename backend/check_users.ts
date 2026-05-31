import { initDb } from './src/db.js';
const db = initDb();
db.all("SELECT id, email, role FROM users", (err, rows) => {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
});
