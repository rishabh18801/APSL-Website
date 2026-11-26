import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { slugify } from './products.js';

// ---------- Categories ----------
export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT c.id, c.slug, c.name, c.description, c.sort_order, count(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.sort_order, c.name`,
  );
  res.json(rows);
});

const CategoryBody = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(300).default(''),
});

categoriesRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = CategoryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Category name is required' });
  const { rows } = await query(
    `INSERT INTO categories (slug, name, description, sort_order)
     VALUES ($1, $2, $3, (SELECT coalesce(max(sort_order), 0) + 1 FROM categories))
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING *`,
    [slugify(parsed.data.name), parsed.data.name, parsed.data.description],
  );
  res.status(201).json(rows[0]);
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res) => {
  await query('DELETE FROM categories WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});

// ---------- Enquiries (contact form) ----------
export const enquiriesRouter = Router();

const enquiryLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });

const EnquiryBody = z
  .object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().max(30).default(''),
    email: z.string().trim().max(160).default(''),
    message: z.string().trim().min(5).max(3000),
    product_id: z.coerce.number().int().positive().nullable().optional(),
    website: z.string().max(0).optional(), // honeypot: real users leave it empty
  })
  .refine((b) => b.phone || b.email, { message: 'Phone or email is required' });

enquiriesRouter.post('/', enquiryLimiter, async (req, res) => {
  const parsed = EnquiryBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid enquiry' });
  const b = parsed.data;
  await query('INSERT INTO enquiries (name, phone, email, message, product_id) VALUES ($1,$2,$3,$4,$5)', [
    b.name, b.phone, b.email, b.message, b.product_id ?? null,
  ]);
  res.status(201).json({ ok: true });
});

enquiriesRouter.get('/', requireAdmin, async (_req, res) => {
  const { rows } = await query(
    `SELECT e.*, p.name AS product_name, p.slug AS product_slug
     FROM enquiries e LEFT JOIN products p ON p.id = e.product_id ORDER BY e.created_at DESC LIMIT 500`,
  );
  res.json(rows);
});

enquiriesRouter.patch('/:id', requireAdmin, async (req, res) => {
  await query('UPDATE enquiries SET handled = $1 WHERE id = $2', [Boolean(req.body?.handled), Number(req.params.id)]);
  res.json({ ok: true });
});

enquiriesRouter.delete('/:id', requireAdmin, async (req, res) => {
  await query('DELETE FROM enquiries WHERE id = $1', [Number(req.params.id)]);
  res.json({ ok: true });
});
