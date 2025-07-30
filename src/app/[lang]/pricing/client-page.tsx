
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
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public-header";
import { PayPalButtonWrapper } from "@/components/paypal-button";

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
  isPayPal?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, lang, isPopular, isPayPal = false }) => {
  const planPrice = plan.price.replace(/[^0-9.]/g, '');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  return (
    <Card className={cn("flex flex-col", isPopular ? "border-2 border-primary shadow-lg" : "")}>
      <CardHeader className="relative">
        {isPopular && (
          <Badge variant="default" className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1">
            {plan.popular}
          </Badge>
        )}
        <CardTitle className="text-2xl text-center pt-4">{plan.name}</CardTitle>
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
        <div className="relative h-10">
            <div className={cn("absolute inset-0 transition-opacity", isPayPal && isClient ? 'opacity-100' : 'opacity-0')}>
                {isPayPal && isClient && <PayPalButtonWrapper amount={planPrice} description={`${plan.name} Plan Subscription`} />}
            </div>
            <div className={cn("absolute inset-0 transition-opacity", isPayPal && isClient ? 'opacity-0' : 'opacity-100')}>
                <Button asChild className="w-full" variant={isPopular ? "default" : "outline"}>
                    <Link href={`/${lang}/login`}>{plan.cta}</Link>
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};


export function PricingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    if (!dictionary?.pricingPage || !dictionary?.landingPage?.footer || !dictionary.pricingPage.plans.basic || !dictionary.pricingPage.plans.professional || !dictionary.pricingPage.plans.enterprise) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    const d = dictionary.pricingPage;
    const l = dictionary.landingPage;
    
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader dictionary={dictionary} lang={lang} />

            <main className="flex-1">
                <section className="py-16 sm:py-24">
                    <div className="container-responsive">
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
                          <PricingCard plan={d.plans.professional} lang={lang} isPopular isPayPal />
                          <PricingCard plan={d.plans.enterprise} lang={lang} />
                        </div>
                    </div>
                </section>
            </main>
            
            <footer className="border-t">
                <div className="container-responsive flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
                    <p className="text-sm text-center md:text-left text-muted-foreground">© 2024 WasteWise. {l.footer.rights}</p>
                    <p className="text-sm text-center md:text-right text-muted-foreground">{l.footer.madeWith}</p>
                </div>
            </footer>
        </div>
    );
}
