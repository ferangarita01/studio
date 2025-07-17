
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { CompaniesClient } from "./client-page";

export default async function CompaniesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  // Data is now fetched on the client side to prevent hydration errors.
  return <CompaniesClient dictionary={dictionary.companiesPage} />;
}
