
"use client";

import { getDictionary } from "@/lib/get-dictionary";
import { PricingClient } from "./client-page";
import type { Locale } from "@/i18n-config";
import { useAuth } from "@/context/auth-context";
import { useDictionaries } from "@/context/dictionary-context";

export default function PricingPage() {
  const dictionary = useDictionaries();
  const { lang } = useAuth();
  
  if (!dictionary || !lang) return <div>Loading...</div>;

  return <PricingClient dictionary={dictionary} lang={lang} />;
}

    