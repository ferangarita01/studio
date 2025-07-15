
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { ReportsClient } from "./client-page";
import { getWeeklyReportData, getMonthlyReportData } from "@/services/waste-data-service";
import { useEffect, useState } from "react";
import type { ReportData } from "@/lib/types";
import { useAuth } from "@/context/auth-context";

export default function FinancialReportsPage() {
  const dictionary = useDictionaries()?.reportsPage;
  const [weeklyDataAll, setWeeklyDataAll] = useState<Record<string, ReportData>>({});
  const [monthlyDataAll, setMonthlyDataAll] = useState<Record<string, ReportData>>({});
  const [loading, setLoading] = useState(true);
  const { role, companyId } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!role) return;
      setLoading(true);
      const companyIdToFetch = role === 'client' ? companyId : undefined;
      const [weeklyData, monthlyData] = await Promise.all([
        getWeeklyReportData(companyIdToFetch || undefined),
        getMonthlyReportData(companyIdToFetch || undefined),
      ]);
      setWeeklyDataAll(weeklyData);
      setMonthlyDataAll(monthlyData);
      setLoading(false);
    };
    fetchData();
  }, [role, companyId]);

  if (loading || !dictionary) return <div>Loading...</div>;

  return (
    <ReportsClient
      dictionary={dictionary}
      weeklyDataAll={weeklyDataAll}
      monthlyDataAll={monthlyDataAll}
    />
  );
}
