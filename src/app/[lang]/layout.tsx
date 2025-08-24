
import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { AppShell } from '@/components/layout/app-shell';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import Script from 'next/script';
import type { PageProps } from '../../../.next/types/app/[lang]/page';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const SEO_CONFIG = {
  en: {
    title: "WasteWise: AI-Powered Waste Management & Recycling Platform",
    description: "Transform your waste management with WasteWise. Our AI-driven platform helps you optimize recycling, ensure compliance, and turn waste into revenue. Request a free demo!",
    keywords: ["waste management platform", "AI recycling", "business waste solutions", "WasteWise", "sustainability software", "circular economy"]
  },
  es: {
    title: "WasteWise: Plataforma de Reciclaje y Gestión de Residuos con IA",
    description: "Transforma tu gestión de residuos con WasteWise. Nuestra plataforma con IA te ayuda a optimizar el reciclaje, asegurar el cumplimiento y convertir residuos en ingresos. ¡Solicita una demo gratis!",
    keywords: ["plataforma gestion residuos", "reciclaje con IA", "soluciones residuos empresas", "WasteWise", "software sostenibilidad", "economia circular"]
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const lang = params.lang;
  const seo = SEO_CONFIG[lang];
  
  return {
    applicationName: "WasteWise",
    title: {
      default: seo.title,
      template: `%s | WasteWise`,
    },
    description: seo.description,
    keywords: seo.keywords,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "WasteWise",
    },
    formatDetection: {
      telephone: false,
    },
    openGraph: {
      type: "website",
      siteName: "WasteWise",
      title: {
        default: seo.title,
        template: `%s | WasteWise`,
      },
      description: seo.description,
    },
    twitter: {
      card: "summary",
      title: {
        default: seo.title,
        template: `%s | WasteWise`,
      },
      description: seo.description,
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
  const { lang } = params;
  const dictionary = await getDictionary(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
         <Script src="https://sdk.mercadopago.com/js/v2" strategy="beforeInteractive" />
      </head>
      <body className={cn("font-sans antialiased", inter.variable)} suppressHydrationWarning>
          <AppShell lang={lang} dictionary={dictionary}>
            {children}
          </AppShell>
      </body>
    </html>
  );
}
