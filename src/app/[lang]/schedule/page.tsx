
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ScheduleClient } from "./client-page";
import type { PageProps } from "../../../../.next/types/app/[lang]/page";

export default async function SchedulePage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  // Data is fetched on the client side to avoid hydration issues.
  return <ScheduleClient dictionary={dictionary.schedulePage} lang={lang} />;
}
