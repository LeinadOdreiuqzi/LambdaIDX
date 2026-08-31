"use server";

import { put } from "@vercel/blob";
import { v4 as uuidv4 } from "uuid";
import { requireAdminSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const UPLOADS_PER_HOUR = 20;

const MEDIA_TYPES = {
  "image/jpeg": { extension: "jpg", kind: "image", maxSize: MAX_IMAGE_SIZE },
  "image/png": { extension: "png", kind: "image", maxSize: MAX_IMAGE_SIZE },
  "image/gif": { extension: "gif", kind: "image", maxSize: MAX_IMAGE_SIZE },
  "image/webp": { extension: "webp", kind: "image", maxSize: MAX_IMAGE_SIZE },
  "video/mp4": { extension: "mp4", kind: "video", maxSize: MAX_VIDEO_SIZE },
  "video/webm": { extension: "webm", kind: "video", maxSize: MAX_VIDEO_SIZE },
  "video/ogg": { extension: "ogg", kind: "video", maxSize: MAX_VIDEO_SIZE },
  "video/quicktime": { extension: "mov", kind: "video", maxSize: MAX_VIDEO_SIZE },
} as const;

type SupportedMediaType = keyof typeof MEDIA_TYPES;

export async function uploadFile(formData: FormData) {
  const session = await requireAdminSession();
  const rateLimit = await checkRateLimit(
    `upload:${session.userId}`,
    UPLOADS_PER_HOUR,
    60 * 60
  );

  if (!rateLimit.success) {
    throw new Error(
      `Límite de subidas excedido. Inténtalo de nuevo en ${rateLimit.resetSeconds} segundos.`
    );
  }

  const entry = formData.get("file");
  if (!(entry instanceof File)) {
    throw new Error("No se proporcionó un archivo válido.");
  }

  const file = entry;
  if (file.size === 0) {
    throw new Error("El archivo está vacío.");
  }

  const declaredType = file.type.toLowerCase();
  if (!isSupportedMediaType(declaredType)) {
    throw new Error("Tipo de archivo no permitido.");
  }

  const mediaConfig = MEDIA_TYPES[declaredType];
  if (file.size > mediaConfig.maxSize) {
    throw new Error(
      `El archivo supera el límite de ${mediaConfig.maxSize / 1024 / 1024} MB para ${mediaConfig.kind === "image" ? "imágenes" : "vídeos"}.`
    );
  }

  const detectedType = await detectMediaType(file);
  if (detectedType !== declaredType) {
    throw new Error("El contenido del archivo no coincide con su tipo declarado.");
  }

  const filename = `${uuidv4()}.${mediaConfig.extension}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: detectedType,
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    filename: file.name,
    size: file.size,
    type: detectedType,
  };
}

function isSupportedMediaType(value: string): value is SupportedMediaType {
  return Object.prototype.hasOwnProperty.call(MEDIA_TYPES, value);
}

async function detectMediaType(file: File): Promise<SupportedMediaType | null> {
  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());

  if (matches(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (matches(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a") {
    return "image/gif";
  }
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP") {
    return "image/webp";
  }
  if (matches(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "video/webm";
  if (ascii(bytes, 0, 4) === "OggS") return "video/ogg";

  if (ascii(bytes, 4, 4) === "ftyp") {
    return ascii(bytes, 8, 4) === "qt  " ? "video/quicktime" : "video/mp4";
  }

  return null;
}

function matches(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((value, index) => bytes[index] === value);
}

function ascii(bytes: Uint8Array, offset: number, length: number): string {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}
