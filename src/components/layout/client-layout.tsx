
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider, useAuth } from '@/context/auth-context';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { DictionariesProvider } from '@/context/dictionary-context';


function AuthGuard({ children, lang }: { children: React.ReactNode, lang: Locale }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !pathname.endsWith('/login')) {
        router.push(`/${lang}/login`);
      }
    }
  }, [isLoading, isAuthenticated, router, lang, pathname]);

  if (isLoading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  const isLoginPage = pathname.endsWith('/login');

  if (!isAuthenticated) {
    // If not authenticated, only render children if it's the login page
    return isLoginPage ? <>{children}</> : null;
  }
  
  // If authenticated and on login page, let the app shell handle navigation or show dashboard
  if (isLoginPage) {
     return <AppShell>{children}</AppShell>;
  }

  return <AppShell>{children}</AppShell>;
}

export function ClientLayout({ children, dictionary, lang }: { children: React.ReactNode, dictionary: Dictionary, lang: Locale }) {
    const pathname = usePathname();
    const isLoginPage = pathname.endsWith('/login');

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                <DictionariesProvider dictionary={dictionary}>
                    {isLoginPage ? (
                       <>{children}</>
                    ) : (
                       <AuthGuard lang={lang}>
                           {children}
                       </AuthGuard>
                    )}
                </DictionariesProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
    )
}
