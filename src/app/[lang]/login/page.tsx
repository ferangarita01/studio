// src/app/[lang]/login/page.tsx
import { getDictionary } from "@/lib/get-dictionary";
import { LoginClient } from "./client-page";
import type { PageProps } from "@/lib/types";

// This is now a Server Component responsible for fetching the dictionary
export default async function LoginPage({ params: { lang } }: PageProps) {
  const dictionary = await getDictionary(lang);

  // The LoginClient component will handle all client-side logic and state.
  return <LoginClient dictionary={dictionary} />;
}
