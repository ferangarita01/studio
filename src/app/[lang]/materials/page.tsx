import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { materials } from "@/lib/data";
import { MaterialsClient } from "./client-page";

export default async function MaterialsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(lang)).materialsPage;
  // In a real app, you'd fetch this data
  const allMaterials = materials;
  
  return <MaterialsClient dictionary={dictionary} initialMaterials={allMaterials} />;
}
