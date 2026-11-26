import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from './config.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

export const upload = multer({
  storage: multer.diskStorage({
    destination: config.uploadDir,
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[file.mimetype]}`),
  }),
  limits: { fileSize: 6 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (EXT[file.mimetype]) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP or AVIF images are allowed'));
  },
});

export const publicUrl = (filename: string) => `/uploads/${filename}`;

/** Delete a previously uploaded file. External URLs (e.g. seeded images) are ignored. */
export function removeUpload(url: string) {
  if (!url.startsWith('/uploads/')) return;
  const name = path.basename(url);
  fs.promises.unlink(path.join(config.uploadDir, name)).catch(() => {});
}
