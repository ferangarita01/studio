
import { getDictionary } from "@/lib/get-dictionary";
import { PricingClient } from "./client-page";
import type { PageProps } from "@/lib/types";

export default async function PricingPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  if (!dictionary) return <div>Loading...</div>;

  return <PricingClient dictionary={dictionary} lang={lang} />;
}
