/**
 * Seeds categories, the product catalogue and the admin account.
 *
 * Catalogue content (names, categories, short/long descriptions, specification
 * tables and photos) is taken from the client's live site, apslsolutions.co.in,
 * and lives in scripts/catalogue.json. Product photos were downloaded from that
 * site into backend/uploads/ and are referenced by filename.
 *
 * Safe to re-run:
 *   npm run seed              categories + admin are upserted; products are only
 *                             inserted when the table is empty, so edits the
 *                             client has made in the admin panel are preserved.
 *   npm run seed -- --replace deletes every product and re-seeds the catalogue
 *                             from catalogue.json. Use this to pull in a fresh
 *                             copy of the live-site content. Client edits are lost.
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { pool } from '../src/db.js';

type Category = { slug: string; name: string; description: string };
type Product = {
  slug: string; name: string; cat: string; brand: string;
  short: string; desc: string; specs: [string, string][];
  price: number | null; unit: string; featured: boolean; images: string[];
};

const here = dirname(fileURLToPath(import.meta.url));
const catalogue = JSON.parse(readFileSync(join(here, 'catalogue.json'), 'utf8')) as {
  categories: Category[];
  products: Product[];
};
const { categories, products } = catalogue;

const replace = process.argv.includes('--replace');

// ---------------------------------------------------------------- categories
const catIds = new Map<string, number>();
for (const [i, c] of categories.entries()) {
  const { rows } = await pool.query(
    `INSERT INTO categories (slug, name, description, sort_order) VALUES ($1,$2,$3,$4)
     ON CONFLICT (slug) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, sort_order=EXCLUDED.sort_order
     RETURNING id`,
    [c.slug, c.name, c.description, i + 1],
  );
  catIds.set(c.slug, rows[0].id);
}

// ------------------------------------------------------------------ products
const existing = (await pool.query('SELECT count(*)::int AS n FROM products')).rows[0].n as number;

if (existing > 0 && !replace) {
  console.log(
    `products table already has ${existing} row(s), skipping product seed (admin edits are preserved).\n` +
    'Run "npm run seed -- --replace" to overwrite the catalogue with the live-site content.',
  );
} else {
  if (existing > 0) {
    await pool.query('DELETE FROM products');
    console.log(`--replace: removed ${existing} existing product(s)`);
  }

  for (const p of products) {
    await pool.query(
      `INSERT INTO products (slug, name, category_id, brand, short_description, description, specs, price_inr, price_unit, featured, images)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        p.slug, p.name, catIds.get(p.cat) ?? null, p.brand,
        p.short, p.desc,
        JSON.stringify(p.specs.map(([label, value]) => ({ label, value }))),
        p.price, p.unit, p.featured, p.images,
      ],
    );
  }
  console.log(`seeded ${products.length} products across ${categories.length} categories`);

  // Drop categories that are no longer part of the catalogue (e.g. the older
  // IndiaMART-derived ones), as long as nothing still points at them.
  const slugs = categories.map((c) => c.slug);
  const { rowCount } = await pool.query(
    `DELETE FROM categories WHERE slug <> ALL($1::text[])
       AND id NOT IN (SELECT category_id FROM products WHERE category_id IS NOT NULL)`,
    [slugs],
  );
  if (rowCount) console.log(`removed ${rowCount} stale category row(s)`);
}

// --------------------------------------------------------------------- admin
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password === 'change-me-please') {
  console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set in backend/.env, admin account not created');
} else if (password.length < 10) {
  console.warn('ADMIN_PASSWORD must be at least 10 characters, admin account not created');
} else {
  const hash = await bcrypt.hash(password, 12);
  await pool.query(
    `INSERT INTO admins (email, password_hash) VALUES (lower($1), $2)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [email, hash],
  );
  console.log(`admin account ready: ${email.toLowerCase()}`);
}
await pool.end();
