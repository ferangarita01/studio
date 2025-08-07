
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ScheduleClient } from "./client-page";

export default async function SchedulePage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);
  
  // Data is fetched on the client side to avoid hydration issues.
  return <ScheduleClient dictionary={dictionary.schedulePage} lang={params.lang} />;
}
