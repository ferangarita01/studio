
import { getDictionary } from "@/lib/get-dictionary";
import { ScheduleClient } from "./client-page";
import type { PageProps } from "@/lib/types";

export default async function SchedulePage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  // Data is fetched on the client side to avoid hydration issues.
  return <ScheduleClient dictionary={dictionary.schedulePage} lang={lang} />;
}
