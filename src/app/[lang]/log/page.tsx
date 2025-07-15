
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LogClient } from "./client-page";
import { getWasteLog } from "@/services/waste-data-service";

export default async function LogPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  const allWasteLog = await getWasteLog();
  
  return <LogClient dictionary={dictionary.logPage} initialWasteLog={allWasteLog} />;
}
