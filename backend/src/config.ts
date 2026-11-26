import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name} (copy backend/.env.example to backend/.env)`);
  return v;
}

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '',
  uploadDir: path.resolve(here, '..', 'uploads'),
  webDist: path.resolve(here, '..', '..', 'frontend', 'dist'),
};

if (config.jwtSecret.length < 24 || config.jwtSecret.startsWith('change-me')) {
  console.warn('[warn] JWT_SECRET looks weak. Set a long random value in backend/.env.');
}
