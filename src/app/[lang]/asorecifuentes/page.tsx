
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { AsorecifuentesClient } from "./client-page";

export default async function AsorecifuentesPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);

  return <AsorecifuentesClient dictionary={dictionary} lang={params.lang} />;
}
