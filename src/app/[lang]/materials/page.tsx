
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { MaterialsClient } from "./client-page";
import { getMaterials } from "@/services/waste-data-service";
import type { Material } from "@/lib/types";

export const revalidate = 3600; // Revalidate the data every hour

export default async function MaterialsPage({
  params: p,
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const dictionary = await getDictionary(params.lang);
  const materials: Material[] = await getMaterials();
  
  return <MaterialsClient dictionary={dictionary.materialsPage} initialMaterials={materials} />;
}
