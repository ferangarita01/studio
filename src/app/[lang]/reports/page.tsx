
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { ReportsClient } from "./client-page";
import { getWeeklyReportData, getMonthlyReportData } from "@/services/waste-data-service";
import { useEffect, useState } from "react";
import type { ReportData } from "@/lib/types";

export default function FinancialReportsPage() {
  const dictionary = useDictionaries()?.reportsPage;
  const [weeklyDataAll, setWeeklyDataAll] = useState<Record<string, ReportData>>({});
  const [monthlyDataAll, setMonthlyDataAll] = useState<Record<string, ReportData>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [weeklyData, monthlyData] = await Promise.all([
        getWeeklyReportData(),
        getMonthlyReportData(),
      ]);
      setWeeklyDataAll(weeklyData);
      setMonthlyDataAll(monthlyData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading || !dictionary) return <div>Loading...</div>;

  return (
    <ReportsClient
      dictionary={dictionary}
      weeklyDataAll={weeklyDataAll}
      monthlyDataAll={monthlyDataAll}
    />
  );
}

    