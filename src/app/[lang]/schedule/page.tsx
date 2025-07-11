
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { disposalEvents } from "@/lib/data";
import { ScheduleClient } from "./client-page";

export default function SchedulePage() {
  const dictionary = useDictionaries()?.schedulePage;
  
  if (!dictionary) return <div>Loading...</div>;

  // In a real app, you'd fetch this data
  const events = disposalEvents;
  
  return <ScheduleClient dictionary={dictionary} allEvents={events} />;
}
