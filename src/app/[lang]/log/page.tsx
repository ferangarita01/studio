
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { LogClient } from "./client-page";
import { wasteLog } from "@/lib/data";

export default function LogPage() {
  const dictionary = useDictionaries()?.logPage;
  
  if (!dictionary) return <div>Loading...</div>;

  // In a real app, you would fetch this data
  const allWasteLog = wasteLog;
  
  return <LogClient dictionary={dictionary} allWasteLog={allWasteLog} />;
}
