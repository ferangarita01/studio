
import { getDictionary } from "@/lib/get-dictionary";
import { LogClient } from "./client-page";
import type { PageProps } from "@/lib/types";

export default async function LogPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  // Data will now be fetched on the client side to prevent hydration errors.
  return <LogClient dictionary={dictionary.logPage} lang={lang} />;
}
