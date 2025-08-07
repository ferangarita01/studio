
import { getDictionary } from "@/lib/get-dictionary";
import { DashboardPageContent } from "@/components/dashboard-client";
import type { Locale } from "@/i18n-config";

export default async function DashboardPage({
  params: p
}: {
  params: { lang: Locale };
}) {
  const params = await Promise.resolve(p);
  const { lang } = params;
  const dictionary = await getDictionary(lang);
  
  if (!dictionary?.dashboard) {
    return <div>Loading translations...</div>;
  }
  
  return (
    <DashboardPageContent
      dictionary={dictionary.dashboard}
    />
  );
}
