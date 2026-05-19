const db = require('better-sqlite3')('apps/api/data/wealthdash.db'); 
const period = '2026-05';
console.log(db.prepare("SELECT c.name as category, c.icon, c.budget, SUM(t.amount) as total, COUNT(*) as count FROM transactions t JOIN categories c ON t.category_id = c.id WHERE t.type = 'expense' AND t.date LIKE ? || '%' GROUP BY c.id ORDER BY total DESC LIMIT 10").all(period));
