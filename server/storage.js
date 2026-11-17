/**
 * server/storage.js
 * S3-compatible object storage (Cloudflare R2 / AWS S3)
 * Drop-in replacement for local multer disk storage.
 *
 * Install: npm install @aws-sdk/client-s3 @aws-sdk/lib-storage multer-s3
 */
import {
  S3Client,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// ── S3 Client ─────────────────────────────────────────────────────────────────
export const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,   // e.g. Cloudflare R2 endpoint
  region: process.env.STORAGE_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // required for R2
});

const BUCKET = process.env.STORAGE_BUCKET || 'studenthub-uploads';
const CDN = process.env.CDN_BASE_URL || process.env.STORAGE_PUBLIC_URL || '';

// ── Multer → S3 upload ────────────────────────────────────────────────────────
export const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    cacheControl: 'max-age=31536000, public',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname, uploadedBy: req.user?.id || 'anonymous' });
    },
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `uploads/${Date.now()}-${uuidv4()}${ext}`;
      cb(null, name);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} not allowed. Use: ${allowed.join(', ')}`));
    }
  },
});

// ── CDN URL helper ────────────────────────────────────────────────────────────
export function cdnUrl(key) {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  return `${CDN}/${key}`;
}

// ── Delete a file from storage ────────────────────────────────────────────────
export async function deleteFile(keyOrUrl) {
  if (!keyOrUrl) return;
  // Extract key from full URL if needed
  const key = keyOrUrl.startsWith('http')
    ? new URL(keyOrUrl).pathname.replace(/^\//, '')
    : keyOrUrl;

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// ── Stream upload helper (for buffers) ───────────────────────────────────────
export async function uploadBuffer(buffer, key, contentType = 'application/octet-stream') {
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000, public',
    },
  });
  await upload.done();
  return cdnUrl(key);
}

// ── Check file exists ─────────────────────────────────────────────────────────
export async function fileExists(key) {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

