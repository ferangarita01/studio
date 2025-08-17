
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { cn } from "@/lib/utils";
import { PublicHeader } from "@/components/public-header";
import { useAuth } from "@/context/auth-context";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Bot,
  Building2,
  Captions,
  Check,
  CreditCard,
  FileCheck2,
  FileText,
  Gauge,
  Layers,
  Leaf,
  LifeBuoy,
  Lock,
  MessagesSquare,
  RefreshCcw,
  Rocket,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Star,
  Truck,
  Workflow,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { PayPalButtonWrapper } from "@/components/paypal-button";
import { MercadoPagoButtonWrapper } from "@/components/mercadopago-button";
import { Skeleton } from "@/components/ui/skeleton";

interface PricingCardProps {
  plan: any; // Simplified for this context
  lang: Locale;
  isPopular?: boolean;
  isYearly: boolean;
  dictionary: Dictionary["pricingPage"];
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, lang, isPopular, isYearly, dictionary }) => {
  const { isAuthenticated, userProfile } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const isAlreadyPremium = userProfile?.plan === 'Premium';

  useEffect(() => {
    setIsClient(true);
  }, []);

  const price = isYearly ? plan.price.yearly : plan.price.monthly;
  const planPrice = String(price).replace(/[^0-9.]/g, '');
  
  const showPaymentButtons = isPopular && isAuthenticated && !isAlreadyPremium;
  const showContactSales = plan.name === dictionary.plans.enterprise.name;
  const showCurrentPlan = isPopular && isAuthenticated && isAlreadyPremium;

  const renderCtaButton = () => {
    if (!isClient) {
      return <Skeleton className="h-10 w-full mt-7" />;
    }

    if (showPaymentButtons) {
       return (
        <div className="mt-7 space-y-2">
          <PayPalButtonWrapper amount={planPrice} description={`${plan.name} Plan Subscription`} />
          <MercadoPagoButtonWrapper amount={Number(planPrice)} description={`${plan.name} Plan Subscription`} />
        </div>
      );
    }

    if (showCurrentPlan) {
      return (
        <Button className="w-full mt-7" disabled>
          {dictionary.yourCurrentPlan}
        </Button>
      );
    }
    
    if (showContactSales) {
        return (
             <Button asChild className="w-full mt-7 inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition">
                <Link href={`/${lang}/landing#contact`}>
                  <MessagesSquare className="h-4 w-4" />
                  {plan.cta}
                </Link>
             </Button>
        )
    }

    // Default "Get Started Free" button for the Free plan
     return (
        <div className="mt-7">
            <Button asChild className="w-full inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition">
                 <Link href={isAuthenticated ? `/${lang}` : `/${lang}/login`}>{plan.cta}</Link>
            </Button>
        </div>
    );
  };


  const planIcons: Record<string, React.ReactNode> = {
    // Premium
    "bot": <Bot className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "shield-check": <ShieldCheck className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "leaf": <Leaf className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "sprout": <Sprout className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "truck": <Truck className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "zap": <Zap className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "life-buoy": <LifeBuoy className="h-4 w-4 text-emerald-300 mt-0.5" />,
    // Enterprise
    "workflow": <Workflow className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "building-2": <Building2 className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "scale": <Scale className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "captions": <Captions className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "bar-chart-3": <BarChart3 className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "layers": <Layers className="h-4 w-4 text-emerald-300 mt-0.5" />,
    "file-check-2": <FileCheck2 className="h-4 w-4 text-emerald-300 mt-0.5" />,
  };

  return (
    <section className={cn("group relative rounded-2xl p-6 sm:p-8 transition",
      isPopular 
      ? "border border-emerald-400/30 bg-emerald-400/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/20"
      : "border border-white/10 bg-white/[0.035] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] hover:border-white/20"
    )}>
       {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="inline-flex items-center gap-1 rounded-full bg-emerald-400 text-[#0B0F13] px-2.5 py-1 text-[11px] font-medium">
                <Star className="h-3.5 w-3.5" /> {plan.popular}
            </div>
        </div>
       )}

        <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight text-white">{plan.name}</h3>
            <div className={cn("rounded-full px-2 py-1 text-[11px] font-medium",
                isPopular ? "bg-white/5 text-white/80 ring-1 ring-white/10" : "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20"
            )}>
              {plan.tag}
            </div>
        </div>
        <p className="mt-2 text-[14px] text-white/65">{plan.description}</p>

        <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-semibold tracking-tight">${price}</span>
             {!showContactSales && <span className="mb-1 text-sm text-white/60">/{dictionary.billing.month}</span>}
             {showContactSales && <span className="mb-1 text-sm text-white/60">/{dictionary.billing.year}</span>}
        </div>
        
        {isPopular && (
          <p className="text-xs text-white/50">
             {isYearly ? dictionary.billing.noteYearly : dictionary.billing.noteMonthly}
          </p>
        )}

        <ul className="mt-6 space-y-3">
          {plan.features.map((feature: any, index: number) => (
             <li key={index} className="flex items-start gap-3 text-[14px] text-white/80">
                {feature.icon ? planIcons[feature.icon] : <Check className="h-4 w-4 text-emerald-400 mt-0.5" />}
                <span>{feature.text}</span>
            </li>
          ))}
        </ul>

        {renderCtaButton()}
        
         {showContactSales && (
            <p className="mt-3 text-[12px] text-white/45">{plan.note}</p>
        )}
    </section>
  )
}

export function PricingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    const [isYearly, setIsYearly] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!dictionary?.pricingPage || !dictionary?.landingPage?.footer) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div>Loading...</div>
            </div>
        );
    }

    const d = dictionary.pricingPage;
    const navDict = dictionary.navigation;

    return (
        <div className="bg-[#0B0F13] text-white antialiased">
            <PublicHeader dictionary={dictionary} lang={lang} />
            
            {/* Header */}
            <header className="relative overflow-hidden pt-16">
                 <Image src="https://firebasestorage.googleapis.com/v0/b/wastewise-hdbhk.firebasestorage.app/o/ai-generated-8255296_1280.jpg?alt=media&token=67211fe6-5525-4a0a-93b3-6d25b0b8311c" alt="Fondo abstracto de naturaleza y tecnología" fill className="pointer-events-none select-none absolute inset-0 h-full w-full object-cover opacity-[0.15]" />
                 <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-transparent"></div>
                 <section className="relative">
                    <div className="mx-auto max-w-3xl px-6 pb-10 pt-8 sm:pt-14 text-center">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-white/70">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
                            {d.tag}
                        </span>
                        <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
                            {d.title}
                        </h1>
                        <p className="mt-4 text-[15px] leading-6 text-white/70">
                            {d.subtitle}
                        </p>

                        <div className="mt-6 flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="relative inline-flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
                                    <button onClick={() => setIsYearly(false)} className="relative z-10 px-3.5 py-1.5 text-sm font-medium text-white/80 data-[active=true]:text-white" data-active={!isYearly}>
                                        {d.billing.monthly}
                                    </button>
                                    <button onClick={() => setIsYearly(true)} className="relative z-10 px-3.5 py-1.5 text-sm font-medium text-white/80 data-[active=true]:text-white" data-active={isYearly}>
                                        {d.billing.yearly}
                                    </button>
                                    <span className="absolute inset-y-1 w-[calc(50%-4px)] rounded-full bg-white transition-transform duration-300" style={{ transform: isYearly ? 'translateX(100%)' : 'translateX(0)'}} aria-hidden="true"></span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300/90">
                                    <BadgePercent className="h-4 w-4" />
                                    {d.billing.save}
                                </span>
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-white/50">{isYearly ? d.billing.noteYearly : d.billing.noteMonthly}</p>
                    </div>
                </section>
            </header>

            {/* Pricing Cards */}
            <main className="relative pb-20">
              <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-2 lg:grid-cols-3">
                 <PricingCard plan={d.plans.basic} lang={lang} isYearly={isYearly} dictionary={d} />
                 <PricingCard plan={d.plans.professional} lang={lang} isPopular isYearly={isYearly} dictionary={d} />
                 <PricingCard plan={d.plans.enterprise} lang={lang} isYearly={isYearly} dictionary={d} />
              </div>

               {/* Comparativa rápida */}
                <section className="mx-auto mt-12 max-w-7xl px-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">{d.comparison.title}</h2>
                        <p className="mt-1 text-[14px] text-white/60">{d.comparison.subtitle}</p>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-2 text-[13px] text-white/60">
                                <Rocket className="h-4 w-4 text-emerald-300" /> {d.comparison.basic.title}
                            </div>
                            <p className="mt-2 text-[14px] text-white/80">{d.comparison.basic.description}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-2 text-[13px] text-white/60">
                                <Gauge className="h-4 w-4 text-emerald-300" /> {d.comparison.professional.title}
                            </div>
                            <p className="mt-2 text-[14px] text-white/80">{d.comparison.professional.description}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                            <div className="flex items-center gap-2 text-[13px] text-white/60">
                                <Shield className="h-4 w-4 text-emerald-300" /> {d.comparison.enterprise.title}
                            </div>
                            <p className="mt-2 text-[14px] text-white/80">{d.comparison.enterprise.description}</p>
                        </div>
                    </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="mx-auto mt-12 max-w-7xl px-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">{d.faq.title}</h2>
                    <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-emerald-300" />
                                <h3 className="text-[15px] font-medium tracking-tight">{d.faq.q1.question}</h3>
                            </div>
                            <p className="mt-2 text-[14px] text-white/70">{d.faq.q1.answer}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                            <div className="flex items-center gap-2">
                                <Lock className="h-4 w-4 text-emerald-300" />
                                <h3 className="text-[15px] font-medium tracking-tight">{d.faq.q2.question}</h3>
                            </div>
                            <p className="mt-2 text-[14px] text-white/70">{d.faq.q2.answer}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                            <div className="flex items-center gap-2">
                                <RefreshCcw className="h-4 w-4 text-emerald-300" />
                                <h3 className="text-[15px] font-medium tracking-tight">{d.faq.q3.question}</h3>
                            </div>
                            <p className="mt-2 text-[14px] text-white/70">{d.faq.q3.answer}</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                            <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-300" />
                                <h3 className="text-[15px] font-medium tracking-tight">{d.faq.q4.question}</h3>
                            </div>
                            <p className="mt-2 text-[14px] text-white/70">{d.faq.q4.answer}</p>
                        </div>
                    </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
                    <div className="flex items-center gap-2 text-white/60">
                    <Leaf className="h-4 w-4 text-emerald-300" />
                    <span className="text-sm">{dictionary.landingPage.footer.copyright}</span>
                    </div>
                    <div className="flex items-center gap-6">
                    <Link href="#" className="text-sm text-white/60 hover:text-white">{dictionary.landingPage.footer.terms}</Link>
                    <Link href="#" className="text-sm text-white/60 hover:text-white">{dictionary.landingPage.footer.privacy}</Link>
                    <Link href="#" className="text-sm text-white/60 hover:text-white">{dictionary.landingPage.footer.contact}</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

    