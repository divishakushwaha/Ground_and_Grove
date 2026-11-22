// Prints everything stored in the database:  npm run view
const db = require('./db');

for (const table of ['orders', 'order_items', 'reservations', 'feedback']) {
  const rows = db.prepare(`SELECT * FROM ${table}`).all();
  console.log(`\n=== ${table} (${rows.length} rows) ===`);
  if (rows.length) console.table(rows);
}
