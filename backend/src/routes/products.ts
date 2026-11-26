import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { upload, publicUrl, removeUpload } from '../uploads.js';

export const productsRouter = Router();

const SELECT = `
  SELECT p.id, p.slug, p.name, p.brand, p.short_description, p.description, p.specs,
         p.price_inr, p.price_unit, p.featured, p.images, p.created_at, p.updated_at,
         c.id AS category_id, c.slug AS category_slug, c.name AS category_name
  FROM products p LEFT JOIN categories c ON c.id = p.category_id`;

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'product';
}

async function uniqueSlug(base: string, excludeId?: number) {
  let slug = base;
  for (let i = 2; ; i++) {
    const { rows } = await query('SELECT id FROM products WHERE slug = $1 AND id <> $2', [slug, excludeId ?? 0]);
    if (!rows.length) return slug;
    slug = `${base}-${i}`;
  }
}

// ---------- Public ----------

productsRouter.get('/', async (req, res) => {
  const where: string[] = [];
  const params: unknown[] = [];
  if (typeof req.query.category === 'string' && req.query.category) {
    params.push(req.query.category);
    where.push(`c.slug = $${params.length}`);
  }
  if (typeof req.query.q === 'string' && req.query.q.trim()) {
    params.push(`%${req.query.q.trim()}%`);
    where.push(`(p.name ILIKE $${params.length} OR p.brand ILIKE $${params.length} OR p.short_description ILIKE $${params.length})`);
  }
  if (req.query.featured === 'true') where.push('p.featured = true');
  const sql = `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY p.featured DESC, c.sort_order, p.name`;
  const { rows } = await query(sql, params);
  res.json(rows);
});

productsRouter.get('/:slug', async (req, res) => {
  const { rows } = await query(`${SELECT} WHERE p.slug = $1`, [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  const related = await query(
    `${SELECT} WHERE p.category_id IS NOT DISTINCT FROM $1 AND p.id <> $2 ORDER BY p.featured DESC, p.name LIMIT 4`,
    [rows[0].category_id, rows[0].id],
  );
  res.json({ ...rows[0], related: related.rows });
});

// ---------- Admin ----------

const Spec = z.object({ label: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(200) });
const ProductBody = z.object({
  name: z.string().trim().min(2).max(160),
  category_id: z.coerce.number().int().positive().nullable().optional(),
  brand: z.string().trim().max(80).default(''),
  short_description: z.string().trim().max(300).default(''),
  description: z.string().trim().max(10000).default(''),
  specs: z.array(Spec).max(40).default([]),
  price_inr: z.coerce.number().int().nonnegative().nullable().optional(),
  price_unit: z.string().trim().max(30).default('Piece'),
  featured: z.coerce.boolean().default(false),
  /** Existing image URLs to keep, in display order. */
  keep_images: z.array(z.string().max(1000)).max(20).default([]),
});

/** Multipart forms send a JSON blob in field `data` plus files in `images`. */
function parseBody(raw: unknown) {
  let data: unknown = raw;
  if (typeof raw === 'object' && raw && 'data' in raw) {
    try {
      data = JSON.parse(String((raw as any).data));
    } catch {
      data = null;
    }
  }
  return ProductBody.safeParse(data);
}

productsRouter.get('/admin/all', requireAdmin, async (_req, res) => {
  const { rows } = await query(`${SELECT} ORDER BY p.updated_at DESC`);
  res.json(rows);
});

productsRouter.get('/admin/:id', requireAdmin, async (req, res) => {
  const { rows } = await query(`${SELECT} WHERE p.id = $1`, [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json(rows[0]);
});

productsRouter.post('/', requireAdmin, upload.array('images', 10), async (req, res) => {
  const files = (req.files as Express.Multer.File[]) ?? [];
  const parsed = parseBody(req.body);
  if (!parsed.success) {
    files.forEach((f) => removeUpload(publicUrl(f.filename)));
    return res.status(400).json({ error: 'Invalid product', details: parsed.error.flatten() });
  }
  const b = parsed.data;
  const images = [...b.keep_images, ...files.map((f) => publicUrl(f.filename))];
  const slug = await uniqueSlug(slugify(b.name));
  const { rows } = await query(
    `INSERT INTO products (slug, name, category_id, brand, short_description, description, specs, price_inr, price_unit, featured, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, slug`,
    [slug, b.name, b.category_id ?? null, b.brand, b.short_description, b.description, JSON.stringify(b.specs),
     b.price_inr ?? null, b.price_unit, b.featured, images],
  );
  res.status(201).json(rows[0]);
});

productsRouter.put('/:id', requireAdmin, upload.array('images', 10), async (req, res) => {
  const id = Number(req.params.id);
  const files = (req.files as Express.Multer.File[]) ?? [];
  const parsed = parseBody(req.body);
  const existing = await query('SELECT images, name, slug FROM products WHERE id = $1', [id]);
  if (!parsed.success || !existing.rows[0]) {
    files.forEach((f) => removeUpload(publicUrl(f.filename)));
    if (!existing.rows[0]) return res.status(404).json({ error: 'Product not found' });
    return res.status(400).json({ error: 'Invalid product', details: parsed.error!.flatten() });
  }
  const b = parsed.data;
  const old: string[] = existing.rows[0].images;
  const keep = b.keep_images.filter((u) => old.includes(u)); // never trust arbitrary paths
  const images = [...keep, ...files.map((f) => publicUrl(f.filename))];
  const slug = b.name === existing.rows[0].name ? existing.rows[0].slug : await uniqueSlug(slugify(b.name), id);
  await query(
    `UPDATE products SET slug=$1, name=$2, category_id=$3, brand=$4, short_description=$5, description=$6, specs=$7,
       price_inr=$8, price_unit=$9, featured=$10, images=$11, updated_at=now() WHERE id=$12`,
    [slug, b.name, b.category_id ?? null, b.brand, b.short_description, b.description, JSON.stringify(b.specs),
     b.price_inr ?? null, b.price_unit, b.featured, images, id],
  );
  old.filter((u) => !keep.includes(u)).forEach(removeUpload);
  res.json({ id, slug });
});

productsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await query('DELETE FROM products WHERE id = $1 RETURNING images', [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  (rows[0].images as string[]).forEach(removeUpload);
  res.json({ ok: true });
});
