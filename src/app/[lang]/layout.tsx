import type { Metadata } from 'next';
import '../globals.css';
import { AppShell } from '@/components/layout/app-shell';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';

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
  
  return (
    <html lang={params.lang} suppressHydrationWarning>
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
            <AppShell dictionary={dictionary}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child)
                ? React.cloneElement(child, { dictionary } as any)
                : child
            )}
            </AppShell>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
