
import { getDictionary } from "@/lib/get-dictionary";
import { PricingClient } from "./client-page";
import type { Locale } from "@/i18n-config";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function PricingPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  if (!dictionary) return <div>Loading...</div>;

  return <PricingClient dictionary={dictionary} lang={lang} />;
}
