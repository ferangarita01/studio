
import { getDictionary } from "@/lib/get-dictionary";
import { DashboardClient } from "@/components/dashboard-client";
import type { Locale } from "@/i18n-config";

export default async function DashboardPage({
  params: p
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  // Data fetching is now handled client-side in DashboardClient to prevent hydration errors.
  if (!dictionary?.dashboard) {
    // You can return a loading state or a fallback UI here
    return <div>Loading translations...</div>;
  }
  
  return (
    <DashboardClient
      dictionary={dictionary.dashboard}
    />
  );
}
