-- Blog posts shown at /blog, and the hero slideshow on the home page.
-- Both are managed from the admin panel.

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  excerpt     TEXT NOT NULL DEFAULT '',
  body        TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  author      TEXT NOT NULL DEFAULT '',
  published   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_published_idx ON posts(published, created_at DESC);

CREATE TABLE IF NOT EXISTS hero_slides (
  id         SERIAL PRIMARY KEY,
  image      TEXT NOT NULL,
  -- The two-line quote: plain first line, gradient second line.
  lead       TEXT NOT NULL DEFAULT '',
  accent     TEXT NOT NULL DEFAULT '',
  label      TEXT NOT NULL DEFAULT '',
  alt        TEXT NOT NULL DEFAULT '',
  sort_order INT  NOT NULL DEFAULT 0,
  active     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hero_slides_order_idx ON hero_slides(active, sort_order);
