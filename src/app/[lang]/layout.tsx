import type { Metadata } from 'next';
import '../globals.css';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { ClientLayout } from '@/components/layout/client-layout';

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
    <ClientLayout dictionary={dictionary} lang={lang}>
      {children}
    </ClientLayout>
  );
}
