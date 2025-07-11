import { redirect } from 'next/navigation';

// This is the root layout, which redirects to the default language
export default function RootLayout() {
  redirect('/en');
}
