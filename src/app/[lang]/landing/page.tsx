
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LandingClient } from "./client-page";

export default async function LandingPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  return <LandingClient dictionary={dictionary} lang={lang} />;
}
