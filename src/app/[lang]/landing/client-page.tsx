
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BrainCircuit, AreaChart, Leaf, FileText, Bot } from "lucide-react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import React from "react";

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex flex-col items-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
    </div>
);

export function LandingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    const d = dictionary.landingPage;
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
    }, []);


    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <Link href={`/${lang}/landing`} className="flex items-center gap-2 font-bold text-lg text-primary">
                        <Leaf className="h-6 w-6" />
                        <span>{d.header.title}</span>
                    </Link>
                    <nav className="flex items-center gap-2">
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
                {/* Hero Section */}
                <section className="py-20 sm:py-32">
                    <div className="container text-center">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl max-w-3xl mx-auto">
                           {d.hero.title}
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                           {d.hero.subtitle}
                        </p>
                        <div className="mt-10">
                            <Button size="lg" asChild>
                                <Link href={`/${lang}/login`}>{d.hero.cta}</Link>
                            </Button>
                        </div>
                         <div className="mt-16">
                            <Image 
                                src="https://placehold.co/1200x600.png"
                                alt="Dashboard preview"
                                width={1200}
                                height={600}
                                data-ai-hint="dashboard sustainability"
                                className="rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
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
                
                {/* Trusted By Section */}
                <section className="py-20">
                    <div className="container">
                         <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold">{d.trustedBy.title}</h2>
                        </div>
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            className="w-full"
                        >
                            <CarouselContent>
                                {[...Array(6)].map((_, index) => (
                                <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
                                    <div className="p-1">
                                         <div className="flex aspect-video items-center justify-center p-6 grayscale hover:grayscale-0 transition-all">
                                            <Image
                                                src={`https://placehold.co/200x100.png`}
                                                alt={`Client logo ${index + 1}`}
                                                width={200}
                                                height={100}
                                                data-ai-hint="logo"
                                            />
                                        </div>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </section>

                {/* CTA Section */}
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
            
            {/* Footer */}
            <footer className="border-t">
                <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <p className="text-sm text-muted-foreground">© 2024 WasteWise. {d.footer.rights}</p>
                     <p className="text-sm text-muted-foreground">{d.footer.madeWith}</p>
                </div>
            </footer>
        </div>
    );
}
