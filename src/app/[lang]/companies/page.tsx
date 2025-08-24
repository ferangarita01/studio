
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { CompaniesClient } from "./client-page";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function CompaniesPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  // Data is now fetched on the client side to prevent hydration errors.
  return <CompaniesClient dictionary={dictionary.companiesPage} />;
}
