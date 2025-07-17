
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { MaterialsClient } from "./client-page";

export default async function MaterialsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  // Data will be fetched on the client side to prevent hydration errors.
  return <MaterialsClient dictionary={dictionary.materialsPage} />;
}
