
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LogClient } from "./client-page";

export default async function LogPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);
  
  // Data will now be fetched on the client side to prevent hydration errors.
  return <LogClient dictionary={dictionary.logPage} lang={params.lang} />;
}
