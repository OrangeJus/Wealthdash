import { Router } from 'express';
import db from '../db/connection.js';
import { generateId, successResponse, errorResponse } from '../utils/helpers.js';

const router = Router();

// Auto-migrate: add missing columns to categories table
try { db.prepare(`ALTER TABLE categories ADD COLUMN logo_path TEXT`).run(); } catch (_) {}
try { db.prepare(`ALTER TABLE categories ADD COLUMN budget INTEGER`).run(); } catch (_) {}

// GET /api/categories — List all categories grouped by type
router.get('/', (_req, res) => {
  const categories = db.prepare(`
    SELECT c.*, 
      (SELECT COUNT(*) FROM transactions t WHERE t.category_id = c.id) as transaction_count,
      (SELECT COALESCE(SUM(t.amount), 0) FROM transactions t WHERE t.category_id = c.id AND t.type = 'expense' AND t.date LIKE substr(datetime('now','localtime'),1,7) || '%') as spent_this_month
    FROM categories c
    ORDER BY c.type, c.sort_order, c.name
  `).all();

  const income = categories.filter((c: any) => c.type === 'income');
  const expense = categories.filter((c: any) => c.type === 'expense');

  res.json(successResponse({ income, expense, all: categories }));
});

// GET /api/categories/:id — Get single category
router.get('/:id', (req, res) => {
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!category) {
    res.status(404).json(errorResponse('Category not found'));
    return;
  }
  res.json(successResponse(category));
});

// POST /api/categories — Create category
router.post('/', (req, res) => {
  const { name, type, icon, sort_order, logo_path, budget } = req.body;

  if (!name || !type) {
    res.status(400).json(errorResponse('Name and type are required'));
    return;
  }

  if (!['income', 'expense'].includes(type)) {
    res.status(400).json(errorResponse('Type must be income or expense'));
    return;
  }

  const id = generateId();
  db.prepare(`
    INSERT INTO categories (id, name, type, icon, sort_order, logo_path, budget)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, type, icon || 'category', sort_order || 0, logo_path || null, budget || null);

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  res.status(201).json(successResponse(category, 'Category created'));
});

// PUT /api/categories/:id — Update category
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id) as any;
  if (!existing) {
    res.status(404).json(errorResponse('Category not found'));
    return;
  }

  const { name, icon, sort_order, logo_path, budget } = req.body;

  db.prepare(`
    UPDATE categories 
    SET name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        sort_order = COALESCE(?, sort_order),
        logo_path = ?,
        budget = ?
    WHERE id = ?
  `).run(
    name || null, 
    icon || null, 
    sort_order ?? null, 
    logo_path !== undefined ? logo_path : existing.logo_path,
    budget !== undefined ? (budget || null) : existing.budget,
    req.params.id
  );

  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  res.json(successResponse(category, 'Category updated'));
});

// DELETE /api/categories/:id — Delete category (nullifies linked transactions)
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!existing) {
    res.status(404).json(errorResponse('Category not found'));
    return;
  }

  // Set linked transactions category to NULL (don't block delete)
  db.prepare('UPDATE transactions SET category_id = NULL WHERE category_id = ?').run(req.params.id);
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json(successResponse(null, 'Category deleted'));
});

export default router;
