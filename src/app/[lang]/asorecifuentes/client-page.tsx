
"use client";

import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Recycle, ExternalLink } from "lucide-react";

export function AsorecifuentesClient({
  dictionary,
  lang,
}: {
  dictionary: Dictionary;
  lang: Locale;
}) {
  const d = dictionary.asorecifuentesPage;
  const footerDict = dictionary.landingPage.footer;

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-responsive flex h-14 items-center">
                <Link href={`/${lang}/landing`} className="flex items-center gap-2 font-bold text-lg text-primary mr-auto">
                    <Recycle className="h-6 w-6" aria-hidden="true" />
                    <span>{d.header.title}</span>
                </Link>
                <div className="flex items-center gap-2 ml-auto">
                   <Button asChild>
                       <Link href={`/${lang}/login`}>{d.header.login}</Link>
                   </Button>
                </div>
            </div>
        </header>

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div className="absolute inset-0 z-0">
            <Image
              src="https://www.rmcad.edu/wp-content/uploads/2025/03/shutterstock_1798767082-scaled.jpg"
              alt="Background image of recycling for money"
              fill
              priority
              className="object-cover text-transparent"
              data-ai-hint="sustainability demonstration"
            />
            <div className="absolute inset-0 bg-black/60"></div>
          </div>
          <div className="container-responsive relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-8 flex justify-center">
                <Image
                  src="https://cdn.durable.co/blocks/30WhP605AVBhlh62x13B7wUXVQA3cE6HhmYJafPxhEYE8TUpFUZ4T4u3VNCLdiLl.png"
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

        <section id="partnership" className="py-16 sm:py-24 bg-muted/50">
          <div className="container-responsive">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.partnership.title}</h2>
              <p className="text-muted-foreground mt-4">{d.partnership.description}</p>
              <div className="mt-8">
                <Button asChild>
                  <Link href="https://asorecifuente.com/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {d.partnership.cta}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container-responsive flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-center md:text-left text-muted-foreground">
            © 2024 EcoCircle S.A.S. E.S.P. {footerDict.rights}
          </p>
          <p className="text-sm text-center md:text-right text-muted-foreground">
            {footerDict.madeWith}
          </p>
        </div>
      </footer>
    </div>
  );
}
