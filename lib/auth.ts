import crypto from "crypto";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";

const AUTH_COOKIE_NAME = "lambdaidx_session";
const SESSION_SECRET =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "lambdaidx-secure-secret-key-must-be-changed-in-production-32chars";

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName?: string | null;
  exp: number;
}

/**
 * Cifra una contraseña usando Scrypt con salt aleatorio seguro
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifica una contraseña en texto plano contra su hash almacenado
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;

    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    console.error("Error al verificar contraseña:", error);
    return false;
  }
}

/**
 * Genera un token de sesión firmado con HMAC SHA-256
 */
export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 días de validez
  const fullPayload: SessionPayload = { ...payload, exp };

  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Valida y decodifica un token de sesión
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (signature !== expectedSignature) return null;

    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Sesión expirada
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Obtiene la sesión actual desde las cookies en Server Components / Route Handlers
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { AUTH_COOKIE_NAME };
