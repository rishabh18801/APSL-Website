import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAdmin } from '../auth.js';
import { upload, publicUrl, removeUpload } from '../uploads.js';
import { slugify } from './products.js';

/** Multipart forms send a JSON blob in field `data` plus an optional file. */
function parseBody<T extends z.ZodTypeAny>(schema: T, raw: unknown): z.infer<T> | null {
  let input = raw;
  if (typeof raw === 'object' && raw !== null && 'data' in (raw as Record<string, unknown>)) {
    try {
      input = JSON.parse(String((raw as Record<string, unknown>).data));
    } catch {
      return null;
    }
  }
  const parsed = schema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

// ---------------------------------------------------------------- blog posts
export const postsRouter = Router();

const POST_COLUMNS = 'id, slug, title, excerpt, body, cover_image, author, published, created_at, updated_at';

async function uniquePostSlug(base: string, excludeId?: number) {
  let slug = base;
  for (let i = 2; ; i++) {
    const { rows } = await query('SELECT id FROM posts WHERE slug = $1 AND id <> $2', [slug, excludeId ?? 0]);
    if (!rows.length) return slug;
    slug = `${base}-${i}`;
  }
}

// Public: published posts only.
postsRouter.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT ${POST_COLUMNS} FROM posts WHERE published = true ORDER BY created_at DESC LIMIT 200`,
  );
  res.json(rows);
});

// Admin: everything, including drafts. Declared before /:slug so it is not
// swallowed by the slug route.
postsRouter.get('/admin/all', requireAdmin, async (_req, res) => {
  const { rows } = await query(`SELECT ${POST_COLUMNS} FROM posts ORDER BY created_at DESC`);
  res.json(rows);
});

postsRouter.get('/admin/:id', requireAdmin, async (req, res) => {
  const { rows } = await query(`SELECT ${POST_COLUMNS} FROM posts WHERE id = $1`, [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
  res.json(rows[0]);
});

postsRouter.get('/:slug', async (req, res) => {
  const { rows } = await query(`SELECT ${POST_COLUMNS} FROM posts WHERE slug = $1 AND published = true`, [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
  const related = await query(
    `SELECT ${POST_COLUMNS} FROM posts WHERE published = true AND id <> $1 ORDER BY created_at DESC LIMIT 3`,
    [rows[0].id],
  );
  res.json({ ...rows[0], related: related.rows });
});

const PostBody = z.object({
  title: z.string().trim().min(3).max(200),
  excerpt: z.string().trim().max(400).default(''),
  body: z.string().trim().max(50000).default(''),
  author: z.string().trim().max(80).default(''),
  published: z.coerce.boolean().default(true),
  /** Keep the current cover image when no new file is uploaded. */
  keep_cover: z.string().max(1000).default(''),
});

postsRouter.post('/', requireAdmin, upload.single('cover'), async (req, res) => {
  const b = parseBody(PostBody, req.body);
  if (!b) return res.status(400).json({ error: 'A title of at least 3 characters is required' });
  const cover = req.file ? publicUrl(req.file.filename) : b.keep_cover;
  const slug = await uniquePostSlug(slugify(b.title));
  const { rows } = await query(
    `INSERT INTO posts (slug, title, excerpt, body, cover_image, author, published)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, slug`,
    [slug, b.title, b.excerpt, b.body, cover, b.author, b.published],
  );
  res.status(201).json(rows[0]);
});

postsRouter.put('/:id', requireAdmin, upload.single('cover'), async (req, res) => {
  const id = Number(req.params.id);
  const b = parseBody(PostBody, req.body);
  if (!b) return res.status(400).json({ error: 'A title of at least 3 characters is required' });
  const existing = await query('SELECT cover_image, title, slug FROM posts WHERE id = $1', [id]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'Post not found' });

  const old: string = existing.rows[0].cover_image;
  // Only the current cover may be kept; anything else is ignored.
  const cover = req.file ? publicUrl(req.file.filename) : b.keep_cover === old ? old : '';
  if (old && cover !== old) removeUpload(old);

  const slug =
    b.title === existing.rows[0].title ? existing.rows[0].slug : await uniquePostSlug(slugify(b.title), id);
  await query(
    `UPDATE posts SET slug=$1, title=$2, excerpt=$3, body=$4, cover_image=$5, author=$6, published=$7, updated_at=now()
     WHERE id=$8`,
    [slug, b.title, b.excerpt, b.body, cover, b.author, b.published, id],
  );
  res.json({ id, slug });
});

postsRouter.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await query('DELETE FROM posts WHERE id = $1 RETURNING cover_image', [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
  if (rows[0].cover_image) removeUpload(rows[0].cover_image);
  res.json({ ok: true });
});

// --------------------------------------------------------------- hero slides
export const heroRouter = Router();

const HERO_COLUMNS = 'id, image, lead, accent, label, alt, sort_order, active';

heroRouter.get('/', async (_req, res) => {
  const { rows } = await query(
    `SELECT ${HERO_COLUMNS} FROM hero_slides WHERE active = true ORDER BY sort_order, id`,
  );
  res.json(rows);
});

heroRouter.get('/admin/all', requireAdmin, async (_req, res) => {
  const { rows } = await query(`SELECT ${HERO_COLUMNS} FROM hero_slides ORDER BY sort_order, id`);
  res.json(rows);
});

const SlideBody = z.object({
  lead: z.string().trim().max(80).default(''),
  accent: z.string().trim().max(80).default(''),
  label: z.string().trim().max(60).default(''),
  alt: z.string().trim().max(200).default(''),
  sort_order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.coerce.boolean().default(true),
  keep_image: z.string().max(1000).default(''),
});

heroRouter.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  const b = parseBody(SlideBody, req.body);
  if (!b) return res.status(400).json({ error: 'Invalid slide' });
  const image = req.file ? publicUrl(req.file.filename) : b.keep_image;
  if (!image) return res.status(400).json({ error: 'A background image is required' });
  const { rows } = await query(
    `INSERT INTO hero_slides (image, lead, accent, label, alt, sort_order, active)
     VALUES ($1,$2,$3,$4,$5,
             COALESCE(NULLIF($6, 0), (SELECT coalesce(max(sort_order), 0) + 1 FROM hero_slides)), $7)
     RETURNING id`,
    [image, b.lead, b.accent, b.label, b.alt, b.sort_order, b.active],
  );
  res.status(201).json(rows[0]);
});

heroRouter.put('/:id', requireAdmin, upload.single('image'), async (req, res) => {
  const id = Number(req.params.id);
  const b = parseBody(SlideBody, req.body);
  if (!b) return res.status(400).json({ error: 'Invalid slide' });
  const existing = await query('SELECT image FROM hero_slides WHERE id = $1', [id]);
  if (!existing.rows[0]) return res.status(404).json({ error: 'Slide not found' });

  const old: string = existing.rows[0].image;
  const image = req.file ? publicUrl(req.file.filename) : old;
  if (req.file && old) removeUpload(old);

  await query(
    `UPDATE hero_slides SET image=$1, lead=$2, accent=$3, label=$4, alt=$5, sort_order=$6, active=$7 WHERE id=$8`,
    [image, b.lead, b.accent, b.label, b.alt, b.sort_order, b.active, id],
  );
  res.json({ id });
});

heroRouter.delete('/:id', requireAdmin, async (req, res) => {
  const { rows } = await query('DELETE FROM hero_slides WHERE id = $1 RETURNING image', [Number(req.params.id)]);
  if (!rows[0]) return res.status(404).json({ error: 'Slide not found' });
  removeUpload(rows[0].image);
  res.json({ ok: true });
});
