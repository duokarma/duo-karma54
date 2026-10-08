import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client(): { client: S3Client; bucket: string; publicUrl: string } | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID || process.env.VITE_CLOUDFLARE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || process.env.VITE_CLOUDFLARE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || process.env.VITE_CLOUDFLARE_R2_SECRET_ACCESS_KEY;
  const bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || process.env.VITE_CLOUDFLARE_R2_BUCKET_NAME || 'duokarma-files';
  const publicUrl = (
    process.env.CLOUDFLARE_R2_PUBLIC_URL ||
    process.env.VITE_CLOUDFLARE_R2_PUBLIC_URL ||
    `https://${bucket}.${accountId}.r2.cloudflarestorage.com`
  ).replace(/\/+$/, '');

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket, publicUrl };
}

// Allowed MIME types whitelist (Security Check #4: Validate File Upload)
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB limit

export default async function handler(req: any, res: any) {
  // CORS configuration (Security Check #11: Tighten CORS Settings)
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const r2Config = getR2Client();

  // Status check endpoint (GET /api/upload)
  if (req.method === 'GET') {
    return res.status(200).json({
      service: 'Cloudflare R2 Storage Service',
      configured: !!r2Config,
      bucket: r2Config?.bucket || null,
      maxFileSizeBytes: MAX_FILE_SIZE_BYTES,
      allowedTypes: Array.from(ALLOWED_MIME_TYPES),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  if (!r2Config) {
    return res.status(503).json({
      error: 'Cloudflare R2 is not configured.',
      configured: false,
      message: 'Please set CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, and CLOUDFLARE_R2_SECRET_ACCESS_KEY in .env.local',
    });
  }

  try {
    const { action = 'presign', filename, contentType, folder = 'documents', entityId, key, base64Data } = req.body || {};

    // ── Delete action ────────────────────────────────────────────────────────
    if (action === 'delete') {
      if (!key) {
        return res.status(400).json({ error: 'Object key is required for deletion.' });
      }
      await r2Config.client.send(
        new DeleteObjectCommand({
          Bucket: r2Config.bucket,
          Key: key,
        })
      );
      return res.status(200).json({ success: true, message: `Deleted ${key}` });
    }

    // ── Presign / Upload validations ─────────────────────────────────────────
    if (!filename) {
      return res.status(400).json({ error: 'filename is required.' });
    }

    const safeMime = contentType || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(safeMime) && !safeMime.startsWith('image/')) {
      return res.status(400).json({
        error: `File type '${safeMime}' is not permitted. Allowed: PDF, images, Word, Excel, CSV, TXT, ZIP.`,
      });
    }

    // Sanitize filename to prevent directory traversal or script injection
    const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeEntity = entityId ? `${entityId.replace(/[^a-zA-Z0-9_-]/g, '')}/` : '';
    const uniqueKey = `${safeFolder}/${safeEntity}${Date.now()}_${cleanName}`;

    // ── Direct Base64 upload fallback (for small files) ───────────────────────
    if (action === 'upload' && base64Data) {
      const buffer = Buffer.from(base64Data, 'base64');
      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return res.status(400).json({ error: 'File size exceeds maximum allowed 50MB.' });
      }

      await r2Config.client.send(
        new PutObjectCommand({
          Bucket: r2Config.bucket,
          Key: uniqueKey,
          Body: buffer,
          ContentType: safeMime,
        })
      );

      const publicUrl = `${r2Config.publicUrl}/${uniqueKey}`;
      return res.status(200).json({
        success: true,
        key: uniqueKey,
        publicUrl,
        size: buffer.length,
      });
    }

    // ── Generate Presigned PUT URL (Zero-Server-Load direct browser to R2) ───
    const putCommand = new PutObjectCommand({
      Bucket: r2Config.bucket,
      Key: uniqueKey,
      ContentType: safeMime,
    });

    const uploadUrl = await getSignedUrl(r2Config.client, putCommand, {
      expiresIn: 3600, // 1 hour expiration
    });

    const publicUrl = `${r2Config.publicUrl}/${uniqueKey}`;

    return res.status(200).json({
      success: true,
      action: 'presign',
      uploadUrl,
      publicUrl,
      key: uniqueKey,
    });
  } catch (error: any) {
    console.error('R2 Storage Error:', error);
    return res.status(500).json({
      error: 'Failed to process storage request',
      message: error.message,
    });
  }
}
