
import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { AppShell } from '@/components/layout/app-shell';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const APP_NAME = "WasteWise";
const APP_DESCRIPTION = "WasteWise is a business and event waste management platform by EcoCircle, designed to track and manage waste generation for companies, festivals, and concerts.";

export async function generateMetadata({ params: p }: { params: { lang: Locale } }): Promise<Metadata> {
  const params = await Promise.resolve(p);
  const lang = params.lang;
  const dictionary = await getDictionary(lang);
  
  return {
    applicationName: APP_NAME,
    title: {
      default: APP_NAME,
      template: `%s | ${APP_NAME}`,
    },
    description: APP_DESCRIPTION,
    manifest: `/${lang}/manifest.json`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: APP_NAME,
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      siteName: APP_NAME,
      title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
      },
      description: APP_DESCRIPTION,
    },
    twitter: {
      card: "summary",
      title: {
        default: APP_NAME,
        template: `%s | ${APP_NAME}`,
      },
      description: APP_DESCRIPTION,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};


export default async function RootLayout({
  children,
  params: p,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: Locale };
}>) {
  const params = await Promise.resolve(p);
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head />
      <body className={cn("font-sans antialiased", inter.variable)} suppressHydrationWarning>
          <AppShell lang={lang} dictionary={dictionary}>
            {children}
          </AppShell>
      </body>
    </html>
  );
}

    