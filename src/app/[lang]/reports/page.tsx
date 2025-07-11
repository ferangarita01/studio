
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { ReportsClient } from "./client-page";
import { weeklyReportData, monthlyReportData } from "@/lib/data";

export default function ReportsPage() {
  const dictionary = useDictionaries()?.reportsPage;
  
  if (!dictionary) return <div>Loading...</div>;

  return (
    <ReportsClient
      dictionary={dictionary}
      weeklyDataAll={weeklyReportData}
      monthlyDataAll={monthlyReportData}
    />
  );
}
