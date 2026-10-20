import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// El locale se resuelve en el servidor (src/i18n/request.ts)
// sin prefijos en la URL — /shop funciona igual para todos los locales
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/superadmin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdminRoute) {
    const hasAdminSession =
      request.cookies.has('admin_access_token') ||
      request.cookies.has('taptrade_admin_session');

    // Si intenta acceder a panel administrativo sin sesión, redirigir inmediatamente a login
    if (!hasAdminSession && !isLoginPage) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Si ya está autenticado e intenta ir a login, redirigir al panel
    if (hasAdminSession && isLoginPage) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
