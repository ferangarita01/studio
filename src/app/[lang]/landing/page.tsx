
import { getDictionary } from "@/lib/get-dictionary";
import { LandingClient } from "./client-page";
import type { PageProps } from "@/lib/types";

export default async function LandingPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);

  return <LandingClient dictionary={dictionary} lang={lang} />;
}
