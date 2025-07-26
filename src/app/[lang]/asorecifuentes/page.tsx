
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { AsorecifuentesClient } from "./client-page";

export default async function AsorecifuentesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  return <AsorecifuentesClient dictionary={dictionary.asorecifuentesPage} lang={lang} />;
}
