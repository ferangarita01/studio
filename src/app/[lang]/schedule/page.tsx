
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { getDisposalEvents } from "@/services/waste-data-service";
import { ScheduleClient } from "./client-page";
import { useEffect, useState } from "react";
import type { DisposalEvent } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export default function SchedulePage() {
  const dictionary = useDictionaries()?.schedulePage;
  const [events, setEvents] = useState<DisposalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, companyId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!role) return;
      setLoading(true);
      const companyIdToFetch = role === 'client' ? companyId : undefined;
      const eventData = await getDisposalEvents(companyIdToFetch || undefined);
      setEvents(eventData);
      setLoading(false);
    };
    fetchData();
  }, [role, companyId]);
  
  if (loading || !dictionary) return <div>Loading...</div>;
  
  return <ScheduleClient dictionary={dictionary} allEvents={events} />;
}
