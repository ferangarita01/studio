
import { getDictionary } from "@/lib/get-dictionary";
import { LandingClient } from "./client-page";
import type { Locale } from "@/i18n-config";

export default async function LandingPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);

  return <LandingClient dictionary={dictionary} lang={params.lang} />;
}



