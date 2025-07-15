
'use client';

import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { DictionariesProvider } from '@/context/dictionary-context';
import type { Dictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { AppShell } from './app-shell';

// This component wraps all the client-side providers
function AppProviders({
  children,
  dictionary,
  lang,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  lang: Locale;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const isLoginPage = pathname.endsWith('/login');

  if (isLoginPage) {
    return children;
  }

  if (!isAuthenticated && !isLoginPage) {
    // This will be handled by the redirect in AuthProvider or middleware,
    // but as a fallback we can show a loading state.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }
  
  return <AppShell>{children}</AppShell>;
}

// This is the main export that sets up all providers
export function ClientLayoutProviders({
  children,
  dictionary,
  lang,
}: {
  children: React.ReactNode;
  dictionary: Dictionary;
  lang: Locale;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DictionariesProvider dictionary={dictionary}>
        <AuthProvider>
            <AppProviders dictionary={dictionary} lang={lang}>
                {children}
            </AppProviders>
            <Toaster />
        </AuthProvider>
      </DictionariesProvider>
    </ThemeProvider>
  );
}
