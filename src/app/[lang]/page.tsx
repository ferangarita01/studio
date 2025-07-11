
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { DashboardClient } from "@/components/dashboard-client";
import { wasteData, wasteLog } from "@/lib/data";

export default function DashboardPage() {
  const dictionary = useDictionaries();

  if (!dictionary) return <div>Loading...</div>;

  return (
      <DashboardClient
        dictionary={dictionary.dashboard}
        wasteDataAll={wasteData}
        wasteLogAll={wasteLog}
      />
  );
}
