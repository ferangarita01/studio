
import { getDictionary } from "@/lib/get-dictionary";
import { AIAnalyzerClient } from "./client-page";
import type { Locale } from "@/i18n-config";

export default async function AIAnalyzerPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  if (!dictionary) return <div>Loading...</div>;

  return <AIAnalyzerClient dictionary={dictionary.analyzerPage} lang={lang} />;
}
