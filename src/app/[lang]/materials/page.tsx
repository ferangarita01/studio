
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { getMaterials } from "@/services/waste-data-service";
import { MaterialsClient } from "./client-page";
import { useEffect, useState } from "react";
import type { Material } from "@/lib/types";

export default function MaterialsPage() {
  const dictionary = useDictionaries()?.materialsPage;
  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const materialsData = await getMaterials();
      setAllMaterials(materialsData);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  if (loading || !dictionary) return <div>Loading...</div>;
  
  return <MaterialsClient dictionary={dictionary} initialMaterials={allMaterials} />;
}
