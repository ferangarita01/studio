import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { DashboardClient } from "@/components/dashboard-client";
import { wasteData, wasteLog } from "@/lib/data";

export default async function DashboardPage({
  params,
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(params.lang);

  return (
      <DashboardClient
        dictionary={dictionary.dashboard}
        wasteDataAll={wasteData}
        wasteLogAll={wasteLog}
      />
  );
}
