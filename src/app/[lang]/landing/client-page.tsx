
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, FileText, Bot, Recycle, Building, School, PartyPopper, CheckCircle2, XCircle } from "lucide-react";
import React from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4" aria-hidden="true">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

const UseCaseCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <Card className="text-center">
        <CardHeader className="items-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-2" aria-hidden="true">
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
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader dictionary={dictionary} lang={lang} />

            <main className="flex-1">
                <section className="relative py-20 md:py-32">
                     <div className="absolute inset-0 z-0">
                        <Image 
                            src="https://cdn.pixabay.com/photo/2019/05/10/09/55/demonstration-4193109_1280.jpg"
                            alt="Background image of recycling for money"
                            fill
                            priority
                            className="object-cover text-transparent"
                            data-ai-hint="environment protest"
                        />
                        <div className="absolute inset-0 bg-black/60"></div>
                    </div>
                    <div className="container-responsive relative z-10">
                        <div className="mx-auto max-w-4xl text-center">
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

                <section className="py-16 sm:py-24 bg-muted/50">
                    <div className="container-responsive">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.valueProposition.title}</h2>
                             <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-y-4 gap-x-8 text-muted-foreground text-center">
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" /> {d.valueProposition.stats.stat1}</p>
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" /> {d.valueProposition.stats.stat2}</p>
                                <p className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" /> {d.valueProposition.stats.stat3}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-xl text-red-800 dark:text-red-300">{d.valueProposition.from.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.from.item1}</span></li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.from.item2}</span></li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.from.item3}</span></li>
                                        <li className="flex items-start gap-2"><XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.from.item4}</span></li>
                                    </ul>
                                </CardContent>
                            </Card>
                            <Card className="p-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                                <CardHeader className="p-0 mb-4">
                                    <CardTitle className="text-xl text-green-800 dark:text-green-300">{d.valueProposition.to.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <ul className="space-y-2 text-muted-foreground">
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.to.item1}</span></li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.to.item2}</span></li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.to.item3}</span></li>
                                        <li className="flex items-start gap-2"><CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" /><span>{d.valueProposition.to.item4}</span></li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </section>

                <section id="use-cases" className="py-16 sm:py-24">
                    <div className="container-responsive">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.useCases.title}</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{d.useCases.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                <section id="features" className="py-16 sm:py-24 bg-muted/50">
                    <div className="container-responsive">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.features.title}</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{d.features.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

                <section id="contact" className="py-20 sm:py-32">
                    <div className="container-responsive text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.cta.title}</h2>
                        <p className="mt-4 text-lg md:text-xl text-muted-foreground">{d.cta.subtitle}</p>
                        <div className="mt-8">
                             <Button size="lg" asChild>
                                <Link href={`/${lang}/login`}>{d.cta.button}</Link>
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="border-t">
                <div className="container-responsive flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <p className="text-sm text-center md:text-left text-muted-foreground">© 2024 WasteWise. {d.footer.rights}</p>
                    <p className="text-sm text-center md:text-right text-muted-foreground">{d.footer.madeWith}</p>
                </div>
            </footer>
        </div>
    );
}
