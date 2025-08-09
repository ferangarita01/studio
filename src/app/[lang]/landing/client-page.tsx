
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AreaChart, FileText, Bot, Recycle, Building, School, PartyPopper, CheckCircle2, XCircle, GraduationCap, HardHat, Factory } from "lucide-react";
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
                            src="https://space.gov.ae/app_themes/lg21016/images/Sustainability%20Development%20Goals.png"
                            alt="Background image of recycling for money"
                            fill
                            priority
                            className="object-cover text-transparent"
                            data-ai-hint="sustainability goals"
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

                <section className="bg-slate-900 text-white py-16">
                  <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v12m0 0l-3-3m3 3l3-3M4 21h16" />
                      </svg>
                      <h2 className="text-3xl font-bold sm:text-4xl">
                        {d.valueProposition.title}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-2xl">✔</span>
                        <p>{d.valueProposition.stats.stat1}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-2xl">✔</span>
                        <p>{d.valueProposition.stats.stat2}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-2xl">✔</span>
                        <p>{d.valueProposition.stats.stat3}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                      <div className="bg-red-900/40 border border-red-700 rounded-lg p-6">
                        <h3 className="text-red-400 font-semibold text-xl mb-4">{d.valueProposition.from.title}</h3>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <span className="text-red-400">✖</span> {d.valueProposition.from.item1}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-400">✖</span> {d.valueProposition.from.item2}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-400">✖</span> {d.valueProposition.from.item3}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-400">✖</span> {d.valueProposition.from.item4}
                          </li>
                        </ul>
                      </div>

                      <div className="bg-green-900/40 border border-green-700 rounded-lg p-6">
                        <h3 className="text-green-400 font-semibold text-xl mb-4">{d.valueProposition.to.title}</h3>
                        <ul className="space-y-3">
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✔</span> {d.valueProposition.to.item1}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✔</span> {d.valueProposition.to.item2}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✔</span> {d.valueProposition.to.item3}
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-green-400">✔</span> {d.valueProposition.to.item4}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>


                <section id="use-cases" className="py-16 sm:py-24">
                    <div className="container-responsive">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{d.useCases.title}</h2>
                            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">{d.useCases.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                             <UseCaseCard 
                                icon={<GraduationCap className="w-8 h-8" />}
                                title={d.useCases.universities.title}
                                description={d.useCases.universities.description}
                            />
                             <UseCaseCard 
                                icon={<Recycle className="w-8 h-8" />}
                                title={d.useCases.recyclers.title}
                                description={d.useCases.recyclers.description}
                            />
                             <UseCaseCard 
                                icon={<HardHat className="w-8 h-8" />}
                                title={d.useCases.construction.title}
                                description={d.useCases.construction.description}
                            />
                             <UseCaseCard 
                                icon={<Factory className="w-8 h-8" />}
                                title={d.useCases.factories.title}
                                description={d.useCases.factories.description}
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
