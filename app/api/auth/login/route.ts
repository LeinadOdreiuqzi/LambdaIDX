import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyPassword,
  createSessionToken,
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // 1. Rate limiting: Max 5 intentos por minuto por direccion IP
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`login:${clientIp}`, 5, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Demasiados intentos de inicio de sesión. Por favor espera ${rateLimit.resetSeconds} segundos.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Correo electrónico y contraseña requeridos" },
        { status: 400 }
      );
    }

    // 2. Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 }
      );
    }

    // 3. Verificar contraseña con hash criptográfico
    const isValid = verifyPassword(String(password), user.passwordHash);
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
