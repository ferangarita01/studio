import type { Metadata } from 'next';
import '../globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { DictionariesProvider } from '@/context/dictionary-context';

export const metadata: Metadata = {
  title: 'WasteWise',
  description: "A business waste management platform to track and manage waste generation and disposal for companies.",
};

// This component uses client-side hooks, so it must be part of the ClientLayout scope.
function AuthGuard({ children, lang }: { children: React.ReactNode, lang: Locale }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    // Ensure this logic only runs after initial loading.
    if (!isLoading) {
      // If user is not authenticated and not on the login page, redirect to login.
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
  
  // The login page does not need the AppShell.
  // It is rendered directly if the user is not authenticated.
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  // Authenticated users get the AppShell.
  return <AppShell>{children}</AppShell>;
}

// All client-side logic is now encapsulated in this component.
function ClientLayout({ children, dictionary, lang }: { children: React.ReactNode, dictionary: any, lang: Locale }) {
    'use client';
    
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
                        {children}
                    </AuthGuard>
                </DictionariesProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
    )
}

// This remains a Server Component to fetch data and render the main HTML structure.
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dictionary = await getDictionary(params.lang);

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
         <ClientLayout dictionary={dictionary} lang={params.lang}>
            {children}
         </ClientLayout>
      </body>
    </html>
  );
}
