
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Moon, Sun, Languages, Recycle } from "lucide-react";
import React from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function ThemeToggle({ dictionary }: { dictionary: Dictionary["navigation"]["themeToggle"]}) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{dictionary.toggle}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {dictionary.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {dictionary.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {dictionary.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle({ dictionary }: { dictionary: Dictionary["navigation"]["languageToggle"] }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{dictionary.toggle}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href="/en/pricing">English</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/es/pricing">Español</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface PricingCardProps {
  plan: {
    name: string;
    price: string;
    period: string;
    description: string;
    cta: string;
    features: string[];
    popular?: string;
  };
  lang: Locale;
  isPopular?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, lang, isPopular }) => {
  return (
    <Card className={cn("flex flex-col", isPopular ? "border-primary shadow-lg" : "")}>
      <CardHeader className="relative">
        {isPopular && (
          <Badge variant="default" className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1">
            {plan.popular}
          </Badge>
        )}
        <CardTitle className="text-2xl text-center">{plan.name}</CardTitle>
        <CardDescription className="text-center">{plan.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-6">
        <div className="text-center">
          <span className="text-4xl font-bold">{plan.price}</span>
          <span className="text-muted-foreground">{plan.period}</span>
        </div>
        <ul className="space-y-3 flex-grow">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
        <Button asChild className="w-full" variant={isPopular ? "default" : "outline"}>
          <Link href={`/${lang}/login`}>{plan.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
};


export function PricingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    const d = dictionary.pricingPage;
    const l = dictionary.landingPage;
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href={`/${lang}/landing`} className="flex items-center gap-2 font-bold text-lg text-primary mr-auto">
                        <Recycle className="h-6 w-6" aria-hidden="true" />
                        <span>{l.header.title}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
                        <Link 
                            href={`/${lang}/landing`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {l.header.nav.useCases}
                        </Link>
                        <Link
                            href={`/${lang}/landing`}
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {l.header.nav.features}
                        </Link>
                         <Link
                            href={`/${lang}/pricing`}
                            className="font-semibold text-primary"
                        >
                            {l.header.nav.pricing}
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2 ml-auto">
                        <LanguageToggle dictionary={dictionary.navigation.languageToggle} />
                        <ThemeToggle dictionary={dictionary.navigation.themeToggle} />
                       <Button asChild>
                           <Link href={`/${lang}/login`}>{l.header.login}</Link>
                       </Button>
                       <Button asChild variant="outline">
                           <Link href={`/${lang}/landing#contact`}>{l.header.getStarted}</Link>
                       </Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-16 sm:py-24">
                    <div className="container px-4 md:px-6">
                        <div className="mx-auto max-w-2xl text-center mb-12">
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                {d.title}
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                {d.subtitle}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-start">
                          <PricingCard plan={d.plans.basic} lang={lang} />
                          <PricingCard plan={d.plans.professional} lang={lang} isPopular />
                          <PricingCard plan={d.plans.enterprise} lang={lang} />
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="border-t">
                <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <p className="text-sm text-center md:text-left text-muted-foreground">© 2024 WasteWise. {l.footer.rights}</p>
                    <p className="text-sm text-center md:text-right text-muted-foreground">{l.footer.madeWith}</p>
                </div>
            </footer>
        </div>
    );
}

    