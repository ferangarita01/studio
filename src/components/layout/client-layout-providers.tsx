
'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/context/auth-context';
import { AppShell } from './app-shell';

// This component wraps all the client-side providers
export function ClientLayoutContent({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const isLoginPage = pathname.endsWith('/login');

  if (isLoginPage) {
    return <>{children}<Toaster /></>;
  }

  if (!isAuthenticated && !isLoginPage) {
    // This will be handled by the redirect in AuthProvider or middleware,
    // but as a fallback we can show a loading state.
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div>Redirecting...</div>
      </div>
    );
  }
  
  return <><AppShell>{children}</AppShell><Toaster /></>;
}
