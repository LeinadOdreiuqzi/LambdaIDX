import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "lambdaidx_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Proteger rutas administrativas /admin/*
  const isAdminPath = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/login";

  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (isAdminPath) {
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Si el usuario ya está autenticado e intenta ir a /login, enviarlo al dashboard
  if (isLoginPage && sessionToken) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/login",
  ],
};
