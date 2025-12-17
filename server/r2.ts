import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.warn("R2 credentials not fully configured. Video storage will not work.");
}

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export interface R2Video {
  key: string;
  name: string;
  size: number;
  lastModified: Date | undefined;
}

export async function listVideos(): Promise<R2Video[]> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const command = new ListObjectsV2Command({
    Bucket: R2_BUCKET_NAME,
  });

  const response = await r2Client.send(command);
  
  const videos: R2Video[] = (response.Contents || [])
    .filter((obj) => {
      const key = obj.Key || "";
      return key.endsWith(".mp4") || key.endsWith(".webm") || key.endsWith(".mov");
    })
    .map((obj) => ({
      key: obj.Key || "",
      name: extractVideoName(obj.Key || ""),
      size: obj.Size || 0,
      lastModified: obj.LastModified,
    }));

  return videos;
}

export async function getVideoSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

function extractVideoName(key: string): string {
  const filename = key.split("/").pop() || key;
  const nameWithoutExt = filename.replace(/\.(mp4|webm|mov)$/i, "");
  return nameWithoutExt
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function getImageUploadUrl(filename: string): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const key = `story-thumbnails/${Date.now()}-${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: getContentType(filename),
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
  
  return { uploadUrl, publicUrl, key };
}

export async function uploadImageToR2(file: Buffer, filename: string, contentType: string): Promise<{ key: string }> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const key = `story-thumbnails/${Date.now()}-${sanitizedFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);
  
  return { key };
}

export async function getImageSignedUrl(key: string, expiresIn: number = 86400): Promise<string> {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME not configured");
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
}

function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return types[ext || ''] || 'application/octet-stream';
}

export { r2Client, R2_BUCKET_NAME };
