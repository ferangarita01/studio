
'use client';

import { useDictionaries } from "@/context/dictionary-context";
import { ComplianceClient } from "./client-page";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function CompliancePage() {
  const dictionary = useDictionaries()?.compliancePage;
  const { userProfile, role, lang, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      const isPremiumFeature = true; // This page is always premium
      const isAuthorized = role === 'admin' || userProfile?.plan === 'Premium';
      
      if (isPremiumFeature && !isAuthorized) {
        router.push(`/${lang}`);
      }
    }
  }, [isLoading, role, userProfile, router, lang]);
  
  if (isLoading || !dictionary) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <ComplianceClient dictionary={dictionary} />;
}
