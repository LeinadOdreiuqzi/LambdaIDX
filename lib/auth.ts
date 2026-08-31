import crypto from "crypto";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const AUTH_COOKIE_NAME = "lambdaidx_session";
const MIN_SESSION_SECRET_BYTES = 32;

function getSessionSecret(): string | Buffer {
  const configuredSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (configuredSecret) {
    if (Buffer.byteLength(configuredSecret, "utf8") < MIN_SESSION_SECRET_BYTES) {
      throw new Error(
        `AUTH_SECRET debe contener al menos ${MIN_SESSION_SECRET_BYTES} bytes.`
      );
    }

    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET es obligatoria en producción. La aplicación no puede iniciar sin un secreto de sesión seguro."
    );
  }

  console.warn(
    "[AUTH] AUTH_SECRET no está definida. Se usará un secreto aleatorio efímero para desarrollo; las sesiones se invalidarán al reiniciar."
  );
  return crypto.randomBytes(MIN_SESSION_SECRET_BYTES);
}

const SESSION_SECRET = getSessionSecret();

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
  exp: number;
}

/**
 * Cifra una contrasena usando Scrypt con salt aleatorio seguro
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica una contrasena en texto plano contra su hash almacenado
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    console.error("Error al verificar contrasena:", error);
    return false;
  }
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hora (3600 segundos)

/**
 * Genera un token de sesion firmado con HMAC SHA-256
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS;
  const fullPayload: SessionPayload = { ...payload, exp };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Valida y decodifica un token de sesion
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signature, "base64url");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "base64url");

    if (
      signatureBuffer.length !== expectedSignatureBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Sesion expirada
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesion actual desde las cookies en Server Components / Route Handlers
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

/**
 * Requiere una sesion administrativa activa. Lanza AuthError si no es valida.
 */
export async function requireAdminSession(): Promise<SessionPayload> {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthError("Sesion no autorizada o expirada", 401);
  }

  if (session.role !== UserRole.ADMIN && session.role !== UserRole.SUPERADMIN) {
    throw new AuthError("Permisos insuficientes para realizar esta operacion", 403);
  }

  return session;
}

export { AUTH_COOKIE_NAME };
