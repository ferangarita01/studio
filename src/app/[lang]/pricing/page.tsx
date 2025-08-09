
import { getDictionary } from "@/lib/get-dictionary";
import { PricingClient } from "./client-page";
import type { Locale } from "@/i18n-config";

export default async function PricingPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);
  
  if (!dictionary) return <div>Loading...</div>;

  return <PricingClient dictionary={dictionary} lang={params.lang} />;
}
