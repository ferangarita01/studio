
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LogClient } from "./client-page";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function LogPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  // Data will now be fetched on the client side to prevent hydration errors.
  return <LogClient dictionary={dictionary.logPage} lang={lang} />;
}
