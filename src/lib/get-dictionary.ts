import type { Locale } from '@/i18n-config';
import { unstable_cache } from 'next/cache';

const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  es: () => import('@/dictionaries/es.json').then((module) => module.default),
};

export const getDictionary = unstable_cache(
  async (locale: Locale) => dictionaries[locale](),
  ['dictionaries'],
  { revalidate: 3600 }
);

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
