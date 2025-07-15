
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { getDisposalEvents } from "@/services/waste-data-service";
import { ScheduleClient } from "./client-page";

export default async function SchedulePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  const events = await getDisposalEvents();
  
  return <ScheduleClient dictionary={dictionary.schedulePage} allEvents={events} />;
}
