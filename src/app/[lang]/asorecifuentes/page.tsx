
import { getDictionary } from "@/lib/get-dictionary";
import type { PageProps } from "@/lib/types";
import { AsorecifuentesClient } from "./client-page";

export default async function AsorecifuentesPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  return <AsorecifuentesClient dictionary={dictionary} lang={lang} />;
}
