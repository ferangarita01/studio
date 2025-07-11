import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LogClient } from "./client-page";
import { wasteLog } from "@/lib/data";

export default async function LogPage({ params }: { params: { lang: Locale } }) {
  const dictionary = (await getDictionary(params.lang)).logPage;
  
  // In a real app, you would fetch this data
  const allWasteLog = wasteLog;
  
  return <LogClient dictionary={dictionary} allWasteLog={allWasteLog} />;
}
