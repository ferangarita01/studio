
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

const SEO_CONFIG = {
  en: {
    title: "WasteWise: Digital Recycling & Waste Collection Platform | Smart Scrap Metal Solutions Colombia",
    description: "Leading recycling and waste collection company in Colombia. Digital platform that automatically turns scrap into revenue. Smart waste management with AI. Request a free demo!",
    keywords: ["recycling Colombia", "waste collection", "digital scrap yard", "business waste management", "WasteWise", "scrap metal purchase", "sale of recyclable materials"]
  },
  es: {
    title: "WasteWise: Plataforma Digital de Reciclaje y Recolección de Residuos | Chatarrería Inteligente Colombia",
    description: "Empresa líder en reciclaje y recolección de residuos en Colombia. Plataforma digital que convierte chatarra en ingresos automáticamente. Gestión inteligente de residuos con IA. ¡Solicita demo gratis!",
    keywords: ["reciclaje Colombia", "recolección residuos", "chatarrería digital", "gestión residuos empresarial", "WasteWise", "compra chatarra", "venta materiales reciclables"]
  }
}

export async function generateMetadata({ params: p }: { params: { lang: Locale } }): Promise<Metadata> {
  const params = await Promise.resolve(p);
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
