import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { DashboardClient } from "@/components/dashboard-client";
import { wasteData, upcomingDisposals, wasteLog } from "@/lib/data";

export default async function DashboardPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(params.lang)).dashboard;

  return (
    <DashboardClient
      dictionary={dictionary}
      wasteData={wasteData}
      upcomingDisposals={upcomingDisposals}
      wasteLog={wasteLog}
    />
  );
}