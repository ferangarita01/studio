
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { WelcomeClient } from './client-page';
import { useDictionaries } from '@/context/dictionary-context';
import { Loader2 } from 'lucide-react';

export default function WelcomePage() {
  const { user, userProfile, isLoading: isAuthLoading, lang } = useAuth();
  const router = useRouter();
  const dictionary = useDictionaries();

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        // If not authenticated, redirect to login
        router.push(`/${lang}/login`);
      } else if (userProfile?.accountType) {
        // If user has already completed onboarding, redirect to dashboard
        router.push(`/${lang}`);
      }
    }
  }, [user, userProfile, isAuthLoading, router, lang]);

  if (isAuthLoading || !user || !dictionary || userProfile?.accountType) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <WelcomeClient dictionary={dictionary.welcomePage} />;
}

    