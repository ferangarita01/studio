
import { getDictionary } from "@/lib/get-dictionary";
import { DashboardClient } from "@/components/dashboard-client";
import type { Locale } from "@/i18n-config";

export default async function DashboardPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  // Data fetching is handled client-side in DashboardClient to prevent hydration errors.
  
  return (
    <DashboardClient
      dictionary={dictionary.dashboard}
    />
  );
}
