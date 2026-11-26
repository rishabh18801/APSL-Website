import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const COOKIE_NAME = 'apsl_admin';
const TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface AdminClaims {
  sub: number;
  email: string;
}

export function issueSession(res: Response, admin: { id: number; email: string }) {
  const token = jwt.sign({ email: admin.email }, config.jwtSecret, {
    subject: String(admin.id),
    expiresIn: TTL_SECONDS,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: config.cookieSecure,
    maxAge: TTL_SECONDS * 1000,
    path: '/',
  });
}

export function clearSession(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function readSession(req: Request): AdminClaims | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
    return { sub: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const admin = readSession(req);
  if (!admin) return res.status(401).json({ error: 'Not signed in' });
  (req as Request & { admin: AdminClaims }).admin = admin;
  next();
}
