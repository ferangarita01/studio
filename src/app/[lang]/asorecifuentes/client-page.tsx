
"use client";

import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";

export function AsorecifuentesClient({
  dictionary,
  lang,
}: {
  dictionary: Dictionary;
  lang: Locale;
}) {
  const d = dictionary.landingPage;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PublicHeader dictionary={dictionary} lang={lang} />

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://placehold.co/1200x800.png"
              alt="Background image of recycling for money"
              fill
              priority
              className="object-cover"
              data-ai-hint="recycling money"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="container-responsive relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 flex justify-center">
                <Image
                  src="https://placehold.co/150x150.png"
                  alt="Asorecifuentes Logo"
                  width={120}
                  height={120}
                  className="rounded-full bg-white p-2"
                  data-ai-hint="company logo"
                />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                {d.hero.title}
              </h1>
              <p className="mt-6 text-lg text-gray-200 sm:text-xl">
                {d.hero.subtitle}
              </p>
              <div className="mt-10">
                <Button size="lg" asChild>
                  <Link href={`/${lang}/login`}>{d.hero.cta}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container-responsive flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-center md:text-left text-muted-foreground">
            © 2024 EcoCircle S.A.S. E.S.P. {d.footer.rights}
          </p>
          <p className="text-sm text-center md:text-right text-muted-foreground">
            {d.footer.madeWith}
          </p>
        </div>
      </footer>
    </div>
  );
}
