import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware para proteger rutas de administración
 * 
 * Este middleware verifica si el usuario está autenticado antes de permitir
 * acceso a rutas que empiezan con /admin.
 * 
 * ACTUALMENTE DESACTIVADO - Para activar, eliminar el return inicial
 */

export function middleware(_request: NextRequest) {
  // === MIDDLEWARE DESACTIVADO ===
  // Para activar la protección de rutas, elimina este return
  return NextResponse.next();

  // === LÓGICA DE AUTENTICACIÓN ===

  /*
  const { pathname } = request.nextUrl;

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/api"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Rutas de admin que requieren autenticación
  const isAdminPath = pathname.startsWith("/admin");

  // Si es ruta pública, permitir acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si es ruta de admin, verificar autenticación
  if (isAdminPath) {
    // Verificar si existe una sesión de autenticación
    // Esto se implementará cuando se agregue el sistema de auth real
    const session = request.cookies.get("session");

    if (!session) {
      // No hay sesión, redirigir a login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar validez de la sesión (implementación futura)
    // const isValidSession = await validateSession(session.value);
    // if (!isValidSession) {
    //   const loginUrl = new URL("/login", request.url);
    //   return NextResponse.redirect(loginUrl);
    // }
  }

  // Permitir acceso por defecto
  return NextResponse.next();
  */
}

// Configurar qué rutas debe procesar el middleware
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (archivos de optimización de imágenes)
     * - favicon.ico (favicon)
     * - archivos públicos
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)",
  ],
};
