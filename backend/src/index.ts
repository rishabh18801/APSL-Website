import fs from 'node:fs';
import path from 'node:path';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { pool } from './db.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter, enquiriesRouter } from './routes/misc.js';
import { postsRouter, heroRouter } from './routes/content.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

if (config.corsOrigin) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

app.get('/api/health', async (_req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/posts', postsRouter);
app.use('/api/hero-slides', heroRouter);
app.use('/uploads', express.static(config.uploadDir, { maxAge: '30d', immutable: true }));
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// In production, serve the built frontend from frontend/dist with SPA fallback.
if (fs.existsSync(config.webDist)) {
  app.use(express.static(config.webDist, { index: false, maxAge: '1h' }));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(config.webDist, 'index.html')));
}

const onError: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = err?.name === 'MulterError' || /Only JPG/.test(err?.message) ? 400 : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Server error' : err.message });
};
app.use(onError);

app.listen(config.port, () => console.log(`APSL API listening on http://127.0.0.1:${config.port}`));
