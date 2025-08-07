
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { LoginClient } from "./client-page";

export default async function LoginPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);

  // Robust check to ensure the validation dictionary is present before rendering.
  // This prevents runtime errors if the dictionary structure is incomplete.
  if (!dictionary?.loginPage?.validation) {
    console.error('Dictionary is missing required structure: loginPage.validation');
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            Error: Language configuration is not available. Please try again later.
        </div>
    );
  }

  return <LoginClient dictionary={dictionary} />;
}
