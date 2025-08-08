
import * as React from 'react';
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/i18n-config';
import { getDisposalCertificates } from '@/services/waste-data-service';
import { FinalDisposalClient } from './client-page';

// This page is now a Server Component to fetch data efficiently.
export default async function FinalDisposalPage({ params }: { params: { lang: Locale }}) {
  const dictionary = await getDictionary(params.lang);

  // Data is fetched on the server and passed to the client component.
  // We fetch all certificates here since filtering will be based on client-side state (selectedCompany).
  const allCertificates = await getDisposalCertificates();

  const pageDictionary = dictionary?.reportsPage?.finalDisposal;
  const navDictionary = dictionary?.navigation?.links;

  if (!pageDictionary || !navDictionary) {
      return (
         <div className="flex flex-1 items-center justify-center p-8">
            <p>Loading translations...</p>
        </div>
      )
  }

  return (
    <FinalDisposalClient
      dictionary={pageDictionary}
      navDictionary={navDictionary}
      initialCertificates={allCertificates}
      lang={params.lang}
    />
  );
}
