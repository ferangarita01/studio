
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, FileText, Bot, Recycle, Building, School, PartyPopper, CheckCircle2, XCircle, Moon, Sun, Languages } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";


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

function LanguageToggle({ dictionary } : { dictionary: Dictionary["navigation"]["languageToggle"]}) {
    const pathname = usePathname()
    const pathWithoutLocale = pathname.split('/').slice(2).join('/');

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
            <Link href={`/en/${pathWithoutLocale}`}>English</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
            <Link href={`/es/${pathWithoutLocale}`}>Español</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const UseCaseCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center">
        <CardHeader className="items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                {icon}
            </div>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

export function LandingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    const d = dictionary.landingPage;
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
      setIsClient(true);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <Link href={`/${lang}/landing`} className="flex items-center gap-2 font-bold text-lg text-primary mr-auto">
                        <Recycle className="h-6 w-6" />
                        <span>{d.header.title}</span>
                    </Link>
                    <nav className="flex items-center gap-2">
                       {isClient ? (
                        <>
                           <LanguageToggle dictionary={dictionary.navigation.languageToggle} />
                           <ThemeToggle dictionary={dictionary.navigation.themeToggle} />
                        </>
                       ) : (
                        <>
                            <div className="w-9 h-9" />
                            <div className="w-9 h-9" />
                        </>
                       )}
                       <Button variant="ghost" asChild>
                           <Link href={`/${lang}/login`}>{d.header.login}</Link>
                       </Button>
                       <Button asChild>
                           <Link href={`/${lang}/login`}>{d.header.getStarted}</Link>
                       </Button>
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <section className="py-20 sm:py-32">
                    <div className="container px-4 md:px-6 text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl max-w-4xl mx-auto">
                           {d.hero.title}
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
                           {d.hero.subtitle}
                        </p>
                        <div className="mt-10">
                            <Button size="lg" asChild>
                                <Link href={`/${lang}/login`}>{d.hero.cta}</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="py-20 bg-muted/50">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">{d.valueProposition.title}</h2>
                             <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-y-4 gap-x-8 text-muted-foreground text-center">
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> {d.valueProposition.stats.stat1}</p>
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> {d.valueProposition.stats.stat2}</p>
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" /> {d.valueProposition.stats.stat3}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-xl text-red-800 dark:text-red-300">{d.valueProposition.from.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5" />{d.valueProposition.from.item1}</li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5" />{d.valueProposition.from.item2}</li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5" />{d.valueProposition.from.item3}</li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5" />{d.valueProposition.from.item4}</li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-xl text-green-800 dark:text-green-300">{d.valueProposition.to.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{d.valueProposition.to.item1}</li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{d.valueProposition.to.item2}</li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{d.valueProposition.to.item3}</li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />{d.valueProposition.to.item4}</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section id="use-cases" className="py-20">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">{d.useCases.title}</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{d.useCases.subtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                             <UseCaseCard 
                                icon={<Building className="w-8 h-8" />}
                                title={d.useCases.companies.title}
                                description={d.useCases.companies.description}
                            />
                             <UseCaseCard 
                                icon={<School className="w-8 h-8" />}
                                title={d.useCases.schools.title}
                                description={d.useCases.schools.description}
                            />
                             <UseCaseCard 
                                icon={<PartyPopper className="w-8 h-8" />}
                                title={d.useCases.events.title}
                                description={d.useCases.events.description}
                            />
                        </div>
                    </div>
                </section>

                <section id="features" className="py-20 bg-muted/50">
                    <div className="container">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">{d.features.title}</h2>
                            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{d.features.subtitle}</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            <FeatureCard 
                                icon={<Bot className="w-6 h-6" />}
                                title={d.features.one.title}
                                description={d.features.one.description}
                            />
                            <FeatureCard 
                                icon={<AreaChart className="w-6 h-6" />}
                                title={d.features.two.title}
                                description={d.features.two.description}
                            />
                            <FeatureCard 
                                icon={<FileText className="w-6 h-6" />}
                                title={d.features.three.title}
                                description={d.features.three.description}
                            />
                        </div>
                    </div>
                </section>

                <section className="py-20">
                    <div className="container text-center">
                        <h2 className="text-3xl font-bold">{d.cta.title}</h2>
                        <p className="mt-4 text-lg text-muted-foreground">{d.cta.subtitle}</p>

                        <div className="mt-8">
                             <Button size="lg" asChild>
                                <Link href={`/${lang}/login`}>{d.cta.button}</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="border-t">
                <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <p className="text-sm text-muted-foreground">© 2024 EcoCircle. {d.footer.rights}</p>
                     <p className="text-sm text-muted-foreground">{d.footer.madeWith}</p>
                </div>
            </footer>
        </div>
    );
}
