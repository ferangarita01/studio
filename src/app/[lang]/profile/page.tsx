
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { ProfileClient } from './client-page';
import { useDictionaries } from '@/context/dictionary-context';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: isAuthLoading, lang } = useAuth();
  const router = useRouter();
  const dictionary = useDictionaries();

  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push(`/${lang}/login`);
    }
  }, [user, isAuthLoading, router, lang]);

  if (isAuthLoading || !user || !dictionary) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return <ProfileClient dictionary={dictionary.profilePage} />;
}

    