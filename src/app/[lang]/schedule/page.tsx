
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { getDisposalEvents } from "@/services/waste-data-service";
import { ScheduleClient } from "./client-page";
import { useEffect, useState } from "react";
import type { DisposalEvent } from "@/lib/types";

export default function SchedulePage() {
  const dictionary = useDictionaries()?.schedulePage;
  const [events, setEvents] = useState<DisposalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const eventData = await getDisposalEvents();
      setEvents(eventData);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  if (loading || !dictionary) return <div>Loading...</div>;
  
  return <ScheduleClient dictionary={dictionary} allEvents={events} />;
}
