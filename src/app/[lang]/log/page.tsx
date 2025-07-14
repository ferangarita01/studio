
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { LogClient } from "./client-page";
import { getWasteLog } from "@/services/waste-data-service";
import type { WasteEntry } from "@/lib/types";
import { useEffect, useState } from "react";

export default function LogPage() {
  const dictionary = useDictionaries()?.logPage;
  const [allWasteLog, setAllWasteLog] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const logData = await getWasteLog();
      setAllWasteLog(logData);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  if (loading || !dictionary) return <div>Loading...</div>;
  
  return <LogClient dictionary={dictionary} initialWasteLog={allWasteLog} />;
}
