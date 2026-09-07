import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger rutas administrativas /admin/*
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = sessionToken ? verifySessionToken(sessionToken) : null;
  const hasAdminRole =
    session?.role === "ADMIN" || session?.role === "SUPERADMIN";

  if (isAdminPath && !hasAdminRole) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);

    if (sessionToken && !session) {
      response.cookies.delete(AUTH_COOKIE_NAME);
    }

    return response;
  }

  // Si el administrador ya está autenticado, no necesita volver al login.
  if (isLoginPage && hasAdminRole) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  const response = NextResponse.next();
  if (isLoginPage && sessionToken && !session) {
    response.cookies.delete(AUTH_COOKIE_NAME);
  }
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
};
