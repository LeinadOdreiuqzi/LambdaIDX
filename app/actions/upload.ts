"use server";

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads a file to the local public/uploads directory.
 * In a production environment, this should be replaced with a cloud storage provider (S3, Vercel Blob, etc.)
 */
export async function uploadFile(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    throw new Error('No file provided');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Define local storage path
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (e) {
    // Already exists
  }

  // Generate unique filename
  const extension = file.name.split('.').pop();
  const filename = `${uuidv4()}.${extension}`;
  const path = join(uploadDir, filename);

  // Write file to disk
  await writeFile(path, buffer);
  
  // Return the public URL
  return {
    url: `/uploads/${filename}`,
    filename: file.name
  };
}
