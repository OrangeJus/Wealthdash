import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/connection.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import walletsRouter from './routes/wallets.js';
import categoriesRouter from './routes/categories.js';
import transactionsRouter from './routes/transactions.js';
import analyticsRouter from './routes/analytics.js';
import budgetsRouter from './routes/budgets.js';
import savingsRouter from './routes/savings.js';
import investmentsRouter from './routes/investments.js';
import settingsRouter from './routes/settings.js';
import exportRouter from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173'] }));
app.use(express.json({ limit: '10mb' }));

// ──────────────────────────────────────────
// Initialize Database
// ──────────────────────────────────────────
initializeDatabase();

// ──────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────
app.use('/api/wallets', walletsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/savings', savingsRouter);
app.use('/api/investments', investmentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/export', exportRouter);

// ──────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ──────────────────────────────────────────
// Error Handling
// ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ──────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔════════════════════════════════════════╗');
  console.log('  ║   🏦 WealthDash API Server Running     ║');
  console.log(`  ║   📡 http://localhost:${PORT}             ║`);
  console.log('  ║   📊 Database: SQLite (WAL mode)       ║');
  console.log('  ╚════════════════════════════════════════╝');
  console.log('');
});

export default app;
