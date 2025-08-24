
import { getDictionary } from "@/lib/get-dictionary";
import { AIAnalyzerClient } from "./client-page";
import type { PageProps } from "@/lib/types";


export default async function AIAnalyzerPage({
  params: { lang },
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  if (!dictionary) return <div>Loading...</div>;

  return <AIAnalyzerClient dictionary={dictionary.analyzerPage} lang={lang} />;
}
