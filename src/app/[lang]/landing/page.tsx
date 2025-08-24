
import { getDictionary } from "@/lib/get-dictionary";
import { LandingClient } from "./client-page";
import type { Locale } from "@/i18n-config";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function LandingPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  return <LandingClient dictionary={dictionary} lang={lang} />;
}
