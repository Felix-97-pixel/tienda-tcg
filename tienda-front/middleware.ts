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

  // Protección en el borde para Mi Cuenta de clientes
  const isUserAccountRoute = pathname.startsWith('/my-account');
  if (isUserAccountRoute) {
    const hasUserSession =
      request.cookies.has('access_token') ||
      request.cookies.has('taptrade_user_session');

    if (!hasUserSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Detección inicial o saneamiento de cookie de idioma existente
  const currentCookie = request.cookies.get('NEXT_LOCALE')?.value;
  if (!currentCookie) {
    const acceptLang = request.headers.get('accept-language')?.toLowerCase() || '';
    let initialLocale: 'es' | 'en' | 'pt' = 'es';
    if (acceptLang.startsWith('en') || acceptLang.includes(',en')) {
      initialLocale = 'en';
    } else if (acceptLang.startsWith('pt') || acceptLang.includes(',pt')) {
      initialLocale = 'pt';
    }
    response.cookies.set('NEXT_LOCALE', initialLocale, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  } else if (currentCookie !== 'es' && currentCookie !== 'en' && currentCookie !== 'pt') {
    let normalized: 'es' | 'en' | 'pt' = 'es';
    if (currentCookie.startsWith('en')) normalized = 'en';
    else if (currentCookie.startsWith('pt')) normalized = 'pt';
    response.cookies.set('NEXT_LOCALE', normalized, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/superadmin/:path*',
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
