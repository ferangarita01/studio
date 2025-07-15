
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ReportsClient } from "./client-page";
import { getWeeklyReportData, getMonthlyReportData } from "@/services/waste-data-service";

export default async function FinancialReportsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  const [weeklyData, monthlyData] = await Promise.all([
    getWeeklyReportData(),
    getMonthlyReportData(),
  ]);

  return (
    <ReportsClient
      dictionary={dictionary.reportsPage}
      weeklyDataAll={weeklyData}
      monthlyDataAll={monthlyData}
    />
  );
}
