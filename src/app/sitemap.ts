import { MetadataRoute } from 'next';
import { i18n } from '@/i18n-config';

// This function generates the sitemap.
// It includes the static landing pages for each supported locale.
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wastewise-hdbhk.web.app';

  const landingPages = i18n.locales.map((locale) => ({
    url: `${baseUrl}/${locale}/landing`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 1,
  }));

  const loginPages = i18n.locales.map((locale) => ({
    url: `${baseUrl}/${locale}/login`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));


  return [...landingPages, ...loginPages];
}
