
import { getDictionary } from "@/lib/get-dictionary";
import { PricingClient } from "./client-page";
import type { Locale } from "@/i18n-config";

export default async function PricingPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return <PricingClient dictionary={dictionary} lang={lang} />;
}

    