
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { DashboardClient } from "@/components/dashboard-client";
import { getWasteChartData, getWasteLog } from "@/services/waste-data-service";
import type { WasteEntry } from "@/lib/types";
import { useEffect, useState } from "react";
import { useCompany } from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const dictionary = useDictionaries();
  const [wasteDataAll, setWasteDataAll] = useState<Record<string, any[]>>({});
  const [wasteLogAll, setWasteLogAll] = useState<WasteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading: isLoadingCompany } = useCompany();
  const { role, companyId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      // Don't set loading to true here, causes flicker. Let the initial state handle it.
      const companyIdToFetch = role === 'client' ? companyId : undefined;
      
      const [chartData, logData] = await Promise.all([
        getWasteChartData(companyIdToFetch || undefined),
        getWasteLog(companyIdToFetch || undefined)
      ]);

      setWasteDataAll(chartData);
      setWasteLogAll(logData);
      setLoading(false);
    };
    
    // Fetch data as soon as role is determined. The dashboard component itself handles the case where a company isn't selected yet.
    if (role) {
      fetchData();
    }
  }, [role, companyId]);

  if ((loading || isLoadingCompany) && role) return <div>Loading...</div>;
  if (!dictionary) return <div>Loading...</div>;

  return (
      <DashboardClient
        dictionary={dictionary.dashboard}
        wasteDataAll={wasteDataAll}
        wasteLogAll={wasteLogAll}
      />
  );
}
