import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../db.js';
import { issueSession, clearSession, readSession } from '../auth.js';

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const LoginBody = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });

// Used to keep response time similar when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

authRouter.post('/login', loginLimiter, async (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Email and password are required' });
  const { email, password } = parsed.data;
  const { rows } = await query('SELECT id, email, password_hash FROM admins WHERE lower(email) = lower($1)', [email]);
  const admin = rows[0];
  const ok = await bcrypt.compare(password, admin?.password_hash ?? DUMMY_HASH);
  if (!admin || !ok) return res.status(401).json({ error: 'Invalid email or password' });
  issueSession(res, admin);
  res.json({ email: admin.email });
});

authRouter.post('/logout', (_req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get('/me', (req, res) => {
  const admin = readSession(req);
  if (!admin) return res.status(401).json({ error: 'Not signed in' });
  res.json({ email: admin.email });
});
