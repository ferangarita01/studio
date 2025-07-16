
import { getWasteChartData, getWasteLog, getDisposalEvents } from "@/services/waste-data-service";
import { getCompanies } from "@/services/waste-data-service";
import { DashboardClient } from "@/components/dashboard-client";
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  // Fetch all data on the server
  const [wasteDataAll, wasteLogAll, companies, disposalEvents] = await Promise.all([
    getWasteChartData(),
    getWasteLog(),
    getCompanies(),
    getDisposalEvents(),
  ]);

  return (
    <DashboardClient
      dictionary={dictionary.dashboard}
      wasteDataAll={wasteDataAll}
      wasteLogAll={wasteLogAll}
      companies={companies}
      initialDisposalEvents={disposalEvents}
    />
  );
}
