import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { disposalEvents } from "@/lib/data";
import { ScheduleClient } from "./client-page";

export default async function SchedulePage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(lang)).schedulePage;
  // In a real app, you'd fetch this data
  const events = disposalEvents;
  
  return <ScheduleClient dictionary={dictionary} allEvents={events} />;
}
