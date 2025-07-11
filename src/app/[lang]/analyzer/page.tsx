import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { AIAnalyzerClient } from "./client-page";

export default async function AIAnalyzerPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(lang)).analyzerPage;
  return <AIAnalyzerClient dictionary={dictionary} />;
}
