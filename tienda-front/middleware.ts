import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// El locale se resuelve en el servidor (src/i18n/request.ts)
// sin prefijos en la URL — /shop funciona igual para todos los locales
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
};
