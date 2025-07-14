
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { DashboardClient } from "@/components/dashboard-client";
import { getWasteChartData, getWasteLog } from "@/services/waste-data-service";
import type { WasteEntry } from "@/lib/types";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const dictionary = useDictionaries();
  const [wasteDataAll, setWasteDataAll] = useState<Record<string, any[]>>({});
  const [wasteLogAll, setWasteLogAll] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [chartData, logData] = await Promise.all([
        getWasteChartData(),
        getWasteLog()
      ]);
      setWasteDataAll(chartData);
      setWasteLogAll(logData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !dictionary) return <div>Loading...</div>;

  return (
      <DashboardClient
        dictionary={dictionary.dashboard}
        wasteDataAll={wasteDataAll}
        wasteLogAll={wasteLogAll}
      />
  );
}
