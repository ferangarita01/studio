
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { materials } from "@/lib/data";
import { MaterialsClient } from "./client-page";

export default function MaterialsPage() {
  const dictionary = useDictionaries()?.materialsPage;
  
  if (!dictionary) return <div>Loading...</div>;
  
  // In a real app, you'd fetch this data
  const allMaterials = materials;
  
  return <MaterialsClient dictionary={dictionary} initialMaterials={allMaterials} />;
}
