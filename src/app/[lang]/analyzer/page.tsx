
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { AIAnalyzerClient } from "./client-page";

export default function AIAnalyzerPage() {
  const dictionary = useDictionaries()?.analyzerPage;
  
  if (!dictionary) return <div>Loading...</div>;

  return <AIAnalyzerClient dictionary={dictionary} />;
}
