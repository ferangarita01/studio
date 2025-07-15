
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { ComplianceClient } from "./client-page";

export default function CompliancePage() {
  const dictionary = useDictionaries()?.compliancePage;
  
  if (!dictionary) return <div>Loading...</div>;

  return <ComplianceClient dictionary={dictionary} />;
}
