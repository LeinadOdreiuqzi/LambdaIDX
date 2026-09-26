import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { loginSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    // 1. Rate limiting por dirección IP: Max 5 intentos por minuto
    const clientIp = getClientIp(request);
    const ipRateLimit = await checkRateLimit(`login:ip:${clientIp}`, 5, 60);

    if (!ipRateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados intentos de inicio de sesión desde esta IP. Por favor espera ${ipRateLimit.resetSeconds} segundos.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(ipRateLimit.resetSeconds),
          },
        }
      );
    }

    // 2. Parseo seguro de JSON y validación estricta de esquema (protección DoS en scrypt y payload bounds)
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Cuerpo de solicitud JSON inválido" },
        { status: 400 }
      );
    }

    const validation = validateBody(loginSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Rate limiting por cuenta objetivo: Max 5 intentos por minuto para prevenir credential stuffing distribuido
    const accountRateLimit = await checkRateLimit(`login:account:${normalizedEmail}`, 5, 60);
    if (!accountRateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados intentos fallidos para esta cuenta. Por favor espera ${accountRateLimit.resetSeconds} segundos.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(accountRateLimit.resetSeconds),
          },
        }
      );
    }

    // 4. Buscar usuario por email (consulta parametrizada)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // 5. Verificar contraseña con hash criptográfico timing-safe
    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // 4. Crear token de sesión seguro firmado
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    // 5. Crear respuesta con Cookie HttpOnly Segura
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS, // 1 hora
    });

    return response;
  } catch (error) {
    console.error("Error en /api/auth/login:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
