import type { Metadata } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { AuthProvider } from '@/context/auth-context';
import { DictionariesProvider } from '@/context/dictionary-context';
import { ThemeProvider } from '@/components/theme-provider';
import { ClientLayoutContent } from '@/components/layout/client-layout-content';

export const metadata: Metadata = {
  title: 'WasteWise',
  description: "A business waste management platform to track and manage waste generation and disposal for companies.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const dictionary = await getDictionary(params.lang);
  const { lang } = params;

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <DictionariesProvider dictionary={dictionary}>
            <AuthProvider>
              <ClientLayoutContent lang={lang}>
                {children}
              </ClientLayoutContent>
            </AuthProvider>
          </DictionariesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
