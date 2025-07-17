
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ReportsClient } from "./client-page";

export default async function FinancialReportsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  // Data is now fetched on the client side to avoid hydration mismatches
  return (
    <ReportsClient
      dictionary={dictionary.reportsPage}
    />
  );
}
