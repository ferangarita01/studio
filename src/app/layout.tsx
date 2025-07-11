import { redirect } from 'next/navigation'

// This is the root layout component for the application.
// It redirects the user to the default locale.
export default function RootLayout() {
  redirect('/en/login')
}
