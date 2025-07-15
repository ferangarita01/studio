
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { LogClient } from "./client-page";
import { getWasteLog } from "@/services/waste-data-service";
import type { WasteEntry } from "@/lib/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function LogPage() {
  const dictionary = useDictionaries()?.logPage;
  const [allWasteLog, setAllWasteLog] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { role, companyId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!role) return;
      setLoading(true);
      const companyIdToFetch = role === 'client' ? companyId : undefined;
      const logData = await getWasteLog(companyIdToFetch || undefined);
      setAllWasteLog(logData);
      setLoading(false);
    };
    fetchData();
  }, [role, companyId]);
  
  if (loading || !dictionary) return <div>Loading...</div>;
  
  return <LogClient dictionary={dictionary} initialWasteLog={allWasteLog} />;
}
