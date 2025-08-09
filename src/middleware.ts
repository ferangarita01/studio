
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore locales are readonly
  const locales: string[] = i18n.locales;
  
  // Filter out the wildcard character before matching
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages().filter(l => l !== '*');
  const defaultLocale = i18n.defaultLocale;

  try {
    return matchLocale(languages, locales, defaultLocale);
  } catch (e) {
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get('host') || '';

  // Canonical redirect for www
  const wwwRegex = /^www\./;
  if (wwwRegex.test(hostname)) {
    const newHost = hostname.replace(wwwRegex, '');
    return NextResponse.redirect(`https://${newHost}${pathname}`, 301);
  }

  // Set auth token from cookie to header for server components
  const requestHeaders = new Headers(request.headers);
  const idToken = request.cookies.get('firebaseIdToken')?.value;
  if (idToken) {
    requestHeaders.set('Authorization', `Bearer ${idToken}`);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Ignore specific paths that should not be localized
  const publicFile = /\.(.*)$/;
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    publicFile.test(pathname)
  ) {
    return response;
  }

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);

    // If the root is accessed, redirect to the default landing page.
    // This is crucial for bots and crawlers.
    if (pathname === '/') {
       return NextResponse.redirect(
        new URL(`/${i18n.defaultLocale}/landing`, request.url)
      );
    }

    // For other paths, prepend the detected locale.
    return NextResponse.redirect(
      new URL(`/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
    );
  }

  return response;
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
