
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { AIAnalyzerClient } from "./client-page";
import type { Locale } from "@/i18n-config";
import { useParams } from "next/navigation";

export default function AIAnalyzerPage() {
  const dictionary = useDictionaries()?.analyzerPage;
  const params = useParams();
  const lang = params.lang as Locale;
  
  if (!dictionary) return <div>Loading...</div>;

  return <AIAnalyzerClient dictionary={dictionary} lang={lang} />;
}
