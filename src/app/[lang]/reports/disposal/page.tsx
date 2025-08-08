
import * as React from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { FinalDisposalClient } from './client-page';
import { Loader2 } from 'lucide-react';

// This page is now a Server Component to fetch initial dictionary data.
export default async function FinalDisposalPage({ params }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(params.lang);

  const pageDictionary = dictionary?.reportsPage?.finalDisposal;
  const navDictionary = dictionary?.navigation?.links;

  if (!pageDictionary || !navDictionary) {
      return (
         <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )
  }

  // Data is fetched on the client side to ensure authentication.
  return (
    <FinalDisposalClient
      dictionary={pageDictionary}
      navDictionary={navDictionary}
      lang={params.lang}
    />
  );
}
