
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { AsorecifuentesClient } from "./client-page";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function AsorecifuentesPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  return <AsorecifuentesClient dictionary={dictionary} lang={lang} />;
}
