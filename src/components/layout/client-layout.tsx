
"use client";

import React, { useState, useEffect } from 'react';
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && isClient) {
      const isLoginPage = pathname.endsWith('/login');
      if (!isAuthenticated && !isLoginPage) {
        router.push(`/${lang}/login`);
      } else if (isAuthenticated && isLoginPage) {
        router.push(`/${lang}`);
      }
    }
  }, [isLoading, isAuthenticated, router, lang, pathname, isClient]);

  if (isLoading || !isClient) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  const isLoginPage = pathname.endsWith('/login');

  if (!isAuthenticated && !isLoginPage) {
     return null;
  }

  return <>{children}</>;
}


const ClientLayoutProviders = ({ children, dictionary, lang }: { children: React.ReactNode, dictionary: Dictionary, lang: Locale }) => {
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
                    <AuthGuard lang={lang}>
                       {isLoginPage ? children : <AppShell>{children}</AppShell>}
                    </AuthGuard>
                </DictionariesProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
    )
}

export function ClientLayout({ children, dictionary, lang }: { children: React.ReactNode, dictionary: Dictionary, lang: Locale }) {
    return (
      <html lang={lang} suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        </head>
        <body className="font-body antialiased">
          <ClientLayoutProviders dictionary={dictionary} lang={lang}>
              {children}
          </ClientLayoutProviders>
        </body>
      </html>
    )
}
