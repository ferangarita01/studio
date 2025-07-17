
'use client';

import { DashboardClient } from "@/components/dashboard-client";
import { useDictionaries } from "@/context/dictionary-context";

export default function DashboardPage() {
  const dictionary = useDictionaries()?.dashboard;
  
  // Data fetching is now handled client-side in DashboardClient
  // to prevent hydration errors.
  
  if (!dictionary) return <div>Loading...</div>;

  return (
    <DashboardClient
      dictionary={dictionary}
    />
  );
}
