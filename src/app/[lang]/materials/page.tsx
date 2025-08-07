
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { MaterialsClient } from "./client-page";

export default async function MaterialsPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);
  
  // Data will be fetched on the client side to prevent hydration errors.
  return <MaterialsClient dictionary={dictionary.materialsPage} />;
}
