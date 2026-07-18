"use server";

import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

// Configuration limits
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

/**
 * Uploads a file to Vercel Blob Storage.
 * Requires BLOB_READ_WRITE_TOKEN environment variable to be set.
 */
export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Validate file type
  const fileType = file.type.toLowerCase();
  const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

  if (!isImage && !isVideo) {
    throw new Error('Invalid file type. Only images and videos are allowed');
  }

  // Generate unique filename with proper extension based on MIME type
  const extension = getExtensionFromMimeType(fileType);
  const filename = `${uuidv4()}.${extension}`;

  // Upload to Vercel Blob Storage
  const blob = await put(filename, file, {
    access: 'public',
  });

  return {
    url: blob.url,
    filename: file.name,
    size: file.size,
    type: fileType
  };
}

function getExtensionFromMimeType(mimeType: string): string {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/ogg': 'ogg',
    'video/quicktime': 'mov',
  };
  return extMap[mimeType] || 'bin';
}
