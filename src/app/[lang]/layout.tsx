import type { Metadata } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { ClientLayoutProviders } from '@/components/layout/client-layout-providers';

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
  const { lang } = params;
  const dictionary = await getDictionary(lang);

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
  );
}
