import { redirect } from 'next/navigation'
import { i18n } from '@/i18n-config';

// This is the root layout component for the application.
// It redirects the user to the default locale's login page.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}