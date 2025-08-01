
// This layout is specifically for embeddable modules.
// It should not contain any of the main app's navigation or structure.
// It ensures a clean, isolated environment for the embedded content.

import '../../globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import type { Locale } from '@/i18n-config';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export default function EmbedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: Locale };
}) {
  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased h-full w-full bg-transparent", inter.variable)}>
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
