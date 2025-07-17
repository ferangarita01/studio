
import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { AppShell } from '@/components/layout/app-shell';

const APP_NAME = "WasteWise";
const APP_DESCRIPTION = "A business and event waste management platform by EcoCircle to track and manage waste generation for companies, festivals, and concerts.";

export async function generateMetadata({ params: { lang } }: { params: { lang: Locale } }): Promise<Metadata> {
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
      <body className="font-body antialiased" suppressHydrationWarning>
          <AppShell lang={lang} dictionary={dictionary}>
            {children}
          </AppShell>
      </body>
    </html>
  );
}
