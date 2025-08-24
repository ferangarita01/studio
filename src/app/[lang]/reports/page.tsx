
import { getDictionary } from "@/lib/get-dictionary";
import { ReportsClient } from "./client-page";
import type { PageProps } from "@/lib/types";

export default async function FinancialReportsPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  // Data is now fetched on the client side to avoid hydration mismatches
  return (
    <ReportsClient
      dictionary={dictionary.reportsPage}
    />
  );
}
