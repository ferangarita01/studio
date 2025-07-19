
// This layout is specifically for embeddable modules.
// It should not contain any of the main app's navigation or structure.
// It ensures a clean, isolated environment for the embedded content.

import '../../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import type { Locale } from '@/i18n-config';

export default function EmbedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased h-full w-full bg-transparent">
        <ThemeProvider
            attribute="class"
            defaultTheme="light" // Embeds usually look better on a light theme by default
            enableSystem={false}
        >
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
