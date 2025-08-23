
import { MetadataRoute } from 'next';
import { i18n } from '@/i18n-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://wastewise.space';
  const lastModified = new Date();

  const pages = ['landing', 'login', 'pricing', 'asorecifuentes'];

  const routes = i18n.locales.flatMap((locale) =>
    pages.map((page) => ({
      url: `${baseUrl}/${locale}/${page}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: page === 'landing' ? 1.0 : 0.8,
    }))
  );

  const rootRoute = {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1.0,
  };

  return [rootRoute, ...routes];
}
