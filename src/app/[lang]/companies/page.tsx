
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { CompaniesClient } from "./client-page";

export default async function CompaniesPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);

  // Data is now fetched on the client side to prevent hydration errors.
  return <CompaniesClient dictionary={dictionary.companiesPage} />;
}
