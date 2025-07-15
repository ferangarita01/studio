
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { getMaterials } from "@/services/waste-data-service";
import { MaterialsClient } from "./client-page";

export default async function MaterialsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  const allMaterials = await getMaterials();
  
  return <MaterialsClient dictionary={dictionary.materialsPage} initialMaterials={allMaterials} />;
}
