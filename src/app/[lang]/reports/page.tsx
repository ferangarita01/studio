import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { ReportsClient } from "./client-page";
import { weeklyReportData, monthlyReportData } from "@/lib/data";

export default async function ReportsPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(lang)).reportsPage;
  return (
    <ReportsClient
      dictionary={dictionary}
      weeklyDataAll={weeklyReportData}
      monthlyDataAll={monthlyReportData}
    />
  );
}
