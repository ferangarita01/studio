
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ReportsClient } from "./client-page";

export default async function FinancialReportsPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);

  // Data is now fetched on the client side to avoid hydration mismatches
  return (
    <ReportsClient
      dictionary={dictionary.reportsPage}
    />
  );
}
