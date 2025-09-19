
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Recycle, 
  Sparkles, 
  Calculator, 
  PlayCircle,
  TrendingDown,
  PieChart,
  Target,
  XCircle,
  CheckCircle2,
  AlertTriangle,
  FileWarning,
  Clock,
  Trash2,
  Coins,
  BadgeCheck,
  Bot,
  Gauge,
  Building2,
  GraduationCap,
  Ticket,
  Library,
  Hammer,
  FileBarChart,
  ClipboardCheck,
  ShieldCheck,
  Handshake,
  ListChecks,
  CalendarCheck,
  Info,
  Truck,
  Banknote,
  Percent,
  Globe,
  Briefcase,
  AlertOctagon,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  HardHat,
  Users,
  Building,
  ArrowRight,
  Leaf
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";


ChartJS.register(ArcElement, Tooltip, Legend, DoughnutController);

const StatCard = ({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string, subtitle: string }) => (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
        <div className="flex items-center gap-2 text-emerald-300">
            {icon}
            <span className="text-xs font-medium">{title}</span>
        </div>
        <p className="mt-2 text-slate-200 text-lg font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
);

const BeforeAfterCard = ({
  isAfter,
  dictionary,
}: {
  isAfter: boolean;
  dictionary: Dictionary["landingPage"]["valueProposition"];
}) => {
  const d = isAfter ? dictionary.to : dictionary.from;
  const items = isAfter
    ? [
        { icon: Coins, text: d.item1 },
        { icon: BadgeCheck, text: d.item2 },
        { icon: Bot, text: d.item3 },
        { icon: Gauge, text: d.item4 },
        { icon: CheckCircle2, text: d.item5 },
      ]
    : [
        { icon: AlertTriangle, text: d.item1 },
        { icon: FileWarning, text: d.item2 },
        { icon: Clock, text: d.item3 },
        { icon: Trash2, text: d.item4 },
        { icon: XCircle, text: d.item5 },
      ];
  const colors = isAfter
    ? {
        gradient: "from-emerald-600/10 to-blue-900/20",
        iconBg: "bg-emerald-500/20",
        iconRing: "ring-emerald-300/20",
        iconColor: "text-emerald-300",
        titleColor: "text-emerald-200",
      }
    : {
        gradient: "from-rose-600/10 to-rose-900/20",
        iconBg: "bg-rose-500/20",
        iconRing: "ring-rose-300/20",
        iconColor: "text-rose-300",
        titleColor: "text-rose-200",
      };

  return (
    <div className={`rounded-2xl p-6 ring-1 ring-white/10 bg-gradient-to-b ${colors.gradient}`}>
      <div className="flex items-center gap-2">
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${colors.iconBg} ${colors.iconRing}`}>
          {isAfter ? <CheckCircle2 className={`h-5 w-5 ${colors.iconColor}`} /> : <XCircle className={`h-5 w-5 ${colors.iconColor}`} />}
        </span>
        <h3 className={`text-xl font-semibold tracking-tight ${colors.titleColor}`}>{d.title}</h3>
      </div>
      <ul className="mt-5 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <item.icon className={`h-5 w-5 mt-0.5 ${colors.iconColor}`} />
            <span className="text-slate-300">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const ROICalculator = ({ dictionary, lang }: { dictionary: Dictionary["landingPage"]["roiCalculator"], lang: Locale }) => {
    const d = dictionary;
    const [values, setValues] = useState({
        wasteVolume: 50,
        disposalCost: 150000,
        contaminationRate: 15,
        salePrice: 250000,
    });

    const [roi, setRoi] = useState({
        grossIncome: 0,
        disposalCost: 0,
        netIncome: 0,
        recyclableRate: 0,
        avoidedDisposalCost: 0,
        carbonFootprint: 0,
    });

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<ChartJS | null>(null);

    const formatCurrency = (n: number) => '$' + n.toLocaleString('es-CO', { maximumFractionDigits: 0 });

    useEffect(() => {
        const recalc = () => {
            const { wasteVolume, disposalCost, contaminationRate, salePrice } = values;
            
            const recyclableRate = 1 - (contaminationRate / 100);
            const totalRecyclableTons = wasteVolume * recyclableRate;
            const gross = totalRecyclableTons * salePrice;
            const cost = wasteVolume * disposalCost;
            const net = gross - cost;
            const avoidedCost = totalRecyclableTons * disposalCost;
            const carbonFootprint = totalRecyclableTons * 1800; // en Kg

            setRoi({ 
                grossIncome: gross, 
                disposalCost: cost, 
                netIncome: net,
                recyclableRate: recyclableRate * 100,
                avoidedDisposalCost: avoidedCost,
                carbonFootprint: carbonFootprint,
            });
        };
        recalc();
    }, [values]);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                }
                chartInstance.current = new ChartJS(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: [d.legend.income, d.legend.cost],
                        datasets: [{
                            data: [roi.grossIncome, roi.disposalCost],
                            backgroundColor: ['#34d399', '#f87171'],
                            borderColor: ['#134e4a', '#7f1d1d'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context) => formatCurrency(context.parsed)
                                }
                            }
                        },
                        cutout: '64%'
                    }
                });
            }
        }
        
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [d.legend.income, d.legend.cost]);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.data.datasets[0].data = [roi.grossIncome, roi.disposalCost];
            chartInstance.current.update();
        }
    }, [roi]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setValues(prev => ({ ...prev, [id]: Number(value) }));
    };
    
    const handleSliderChange = (value: number[]) => {
        setValues(prev => ({...prev, contaminationRate: value[0]}));
    }
    
    return (
        <section id="roi" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
            <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{d.title}</h2>
                <p className="mt-3 text-slate-300">{d.subtitle}</p>
            </div>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 rounded-2xl p-6 ring-1 ring-white/10 bg-white/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'wasteVolume', label: d.labels.wasteVolume, icon: Trash2, value: values.wasteVolume },
                            { id: 'disposalCost', label: d.labels.disposalCost, icon: Banknote, value: values.disposalCost },
                        ].map(field => (
                            <div key={field.id}>
                                <Label htmlFor={field.id} className="text-sm text-slate-300">{field.label}</Label>
                                <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0B1020] ring-1 ring-white/10 px-3">
                                    <field.icon className="h-4 w-4 text-slate-400" />
                                    <Input
                                        id={field.id}
                                        type="number"
                                        min="0"
                                        value={field.value}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent py-3 outline-none text-slate-200 placeholder-slate-500 border-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                     <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <Label htmlFor="salePrice" className="text-sm text-slate-300">{d.labels.salePrice}</Label>
                            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0B1020] ring-1 ring-white/10 px-3">
                                <Coins className="h-4 w-4 text-slate-400" />
                                <Input
                                    id="salePrice"
                                    type="number"
                                    min="0"
                                    value={values.salePrice}
                                    onChange={handleInputChange}
                                    className="w-full bg-transparent py-3 outline-none text-slate-200 placeholder-slate-500 border-none"
                                />
                            </div>
                        </div>
                         <div>
                           <Label htmlFor="carbonFootprint" className="text-sm text-slate-300">{d.labels.carbonFootprint}</Label>
                            <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0B1020] ring-1 ring-white/10 px-3">
                                <Leaf className="h-4 w-4 text-slate-400" />
                                <Input
                                    id="carbonFootprint"
                                    type="text"
                                    value={roi.carbonFootprint.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                    readOnly
                                    className="w-full bg-transparent py-3 outline-none text-slate-200 placeholder-slate-500 border-none"
                                />
                            </div>
                        </div>
                    </div>
                     <div className="mt-4">
                        <Label htmlFor="contaminationRate" className="text-sm text-slate-300">{d.labels.contaminationRate} ({values.contaminationRate}%)</Label>
                        <Slider
                            id="contaminationRate"
                            min={0}
                            max={100}
                            step={1}
                            value={[values.contaminationRate]}
                            onValueChange={handleSliderChange}
                            className="mt-2"
                        />
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.recyclingRate}</div>
                            <div className="mt-1 text-xl font-semibold tracking-tight text-white">{roi.recyclableRate.toFixed(0)}%</div>
                        </div>
                        <div className="rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.avoidedDisposalCost}</div>
                            <div className="mt-1 text-xl font-semibold tracking-tight text-emerald-300">{formatCurrency(roi.avoidedDisposalCost)}</div>
                        </div>
                    </div>
                     <div className="mt-6 flex items-center gap-3">
                        <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition">
                           <Link href={`/${lang}/pricing`}>
                            <Handshake className="h-4 w-4" /><span>{d.cta}</span>
                           </Link>
                        </Button>
                        <p className="text-xs text-slate-400">{d.disclaimer}</p>
                    </div>
                </div>
                <div className="lg:col-span-2 rounded-2xl p-6 ring-1 ring-white/10 bg-white/5">
                    <h3 className="text-lg font-semibold tracking-tight text-white">{d.breakdownTitle}</h3>
                    <p className="mt-1 text-sm text-slate-300">{d.breakdownSubtitle}</p>
                    <div className="mt-6">
                        <div className="relative h-48"><canvas ref={chartRef}></canvas></div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                                <div>
                                    <div className="text-sm text-slate-300">{d.legend.income}</div>
                                    <div className="text-sm font-medium text-slate-200">{formatCurrency(roi.grossIncome)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                                <div>
                                    <div className="text-sm text-slate-300">{d.legend.cost}</div>
                                    <div className="text-sm font-medium text-slate-200">{formatCurrency(roi.disposalCost)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.netIncome}</div>
                            <div className="mt-1 text-2xl font-semibold tracking-tight text-white">{formatCurrency(roi.netIncome)}</div>
                        </div>
                        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                            <Info className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs">{d.info}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};


export function LandingClient({ dictionary, lang }: { dictionary: Dictionary, lang: Locale }) {
    const d = dictionary.landingPage;
    const [selectedUseCase, setSelectedUseCase] = useState<any | null>(null);

    const useCases = {
        companies: { icon: <Building className="h-5 w-5 text-emerald-300" /> },
        schools: { icon: <GraduationCap className="h-5 w-5 text-blue-300" /> },
        events: { icon: <Ticket className="h-5 w-5 text-indigo-300" /> },
        universities: { icon: <Library className="h-5 w-5 text-purple-300" /> },
        recyclers: { icon: <Recycle className="h-5 w-5 text-emerald-300" /> },
        construction: { icon: <HardHat className="h-5 w-5 text-amber-300" /> },
    };

    const features = {
        one: { icon: <Bot key="one" className="h-6 w-6 text-emerald-300" /> },
        two: { icon: <FileBarChart key="two" className="h-6 w-6 text-blue-300" /> },
        three: { icon: <ClipboardCheck key="three" className="h-6 w-6 text-amber-300" /> },
        four: { icon: <ShieldCheck key="four" className="h-6 w-6 text-purple-300" /> },
    };

    const handleScrollToCalculator = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const calculatorSection = document.getElementById('roi');
        if (calculatorSection) {
            calculatorSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0B1020] text-slate-200">
            <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(1000px_600px_at_80%_-100px,rgba(59,130,246,0.25),transparent)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(800px_500px_at_10%_-50px,rgba(16,185,129,0.18),transparent)]"></div>
                <div className="absolute inset-0 opacity-[0.15]" style={{backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "40px 40px"}}></div>
            </div>

            <PublicHeader dictionary={dictionary} lang={lang} />

            <main className="relative pt-28 sm:pt-32">
                <section className="relative">
                    <div className="absolute inset-0 -z-10 overflow-hidden rounded-b-[2rem]">
                        <Image 
                          src="https://firebasestorage.googleapis.com/v0/b/wastewise-hdbhk.firebasestorage.app/o/img.jpg?alt=media&token=ad081ca2-8ba5-4309-9d71-b5d409d1e07d" 
                          alt="Earth from space, sustainability" 
                          fill 
                          priority
                          className="opacity-30 object-cover" 
                          data-ai-hint="earth space sustainability" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/40 via-[#0B1020]/60 to-[#0B1020]"></div>
                    </div>
                    <div className="container-responsive">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">{d.hero.title}</h1>
                            <p className="mt-5 text-base sm:text-lg text-slate-300">{d.hero.subtitle}</p>
                             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                                 <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition h-auto rounded-xl">
                                    <a href="#roi" onClick={handleScrollToCalculator}>
                                      <Calculator /><span>{d.hero.cta}</span>
                                    </a>
                                 </Button>
                            </div>
                             <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                 <StatCard icon={<TrendingDown className="h-4 w-4" />} title={d.valueProposition.stats.stat1.title} value={d.valueProposition.stats.stat1.value} subtitle={d.valueProposition.stats.stat1.subtitle} />
                                 <StatCard icon={<PieChart className="h-4 w-4" />} title={d.valueProposition.stats.stat2.title} value={d.valueProposition.stats.stat2.value} subtitle={d.valueProposition.stats.stat2.subtitle} />
                                 <StatCard icon={<Target className="h-4 w-4" />} title={d.valueProposition.stats.stat3.title} value={d.valueProposition.stats.stat3.value} subtitle={d.valueProposition.stats.stat3.subtitle} />
                            </div>
                        </div>
                    </div>
                </section>
                
                 <section id="how" className="container-responsive mt-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{d.valueProposition.title}</h2>
                        <p className="mt-3 text-slate-300">{d.valueProposition.subtitle}</p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                       <BeforeAfterCard isAfter={false} dictionary={d.valueProposition} />
                       <BeforeAfterCard isAfter={true} dictionary={d.valueProposition} />
                    </div>
                </section>

                <section id="use-cases" className="container-responsive mt-20">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{(d.useCases as any).title}</h2>
                        <p className="mt-3 text-slate-300">{(d.useCases as any).subtitle}</p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                       {Object.keys(useCases).map((key) => {
                          const useCaseKey = key as keyof typeof useCases;
                          const caseData = (d.useCases as any)[useCaseKey];
                          const caseStudy = d.caseStudies[useCaseKey];
                          const icon = useCases[useCaseKey].icon;

                          if (!caseData || !caseStudy) return null;
                          
                          return (
                            <div
                                key={key}
                                role="button"
                                onClick={() => setSelectedUseCase(caseStudy)}
                                className="rounded-2xl p-5 ring-1 ring-white/10 bg-white/5 hover:bg-white/7.5 transition cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                     <span className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-300/20">
                                        {icon}
                                    </span>
                                    <h3 className="font-semibold tracking-tight text-white">{caseData.title}</h3>
                                </div>
                                <p className="mt-3 text-sm text-slate-300">{caseData.description}</p>
                            </div>
                          )
                        })}
                    </div>
                </section>

                <section id="features" className="mt-20 bg-white/5 ring-1 ring-white/10">
                    <div className="container-responsive py-16">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{(d.features as any).title}</h2>
                            <p className="mt-3 text-slate-300">{(d.features as any).subtitle}</p>
                        </div>
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {Object.keys(features).map((key) => {
                              const featureKey = key as keyof typeof features;
                              const featureData = (d.features as any)[featureKey];
                              const icon = features[featureKey].icon;
                              
                              if (!featureData) return null;

                               return (
                                 <div key={key} className="rounded-2xl p-5 bg-[#0B1020] ring-1 ring-white/10">
                                  {icon}
                                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">{featureData.title}</h3>
                                  <p className="mt-2 text-sm text-slate-300">{featureData.description}</p>
                               </div>
                             )
                           })}
                        </div>
                    </div>
                </section>
                
                <ROICalculator dictionary={d.roiCalculator} lang={lang} />
                
                <section id="demo" className="mt-20">
                    <div className="container-responsive">
                        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 ring-1 ring-white/10 bg-gradient-to-br from-[#0B1020] to-slate-900">
                             <Image 
                                src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80" 
                                alt="Minimal 3D render background" 
                                fill 
                                className="absolute inset-0 opacity-10 -z-10 object-cover" 
                                data-ai-hint="abstract background" />
                             <div className="max-w-2xl">
                                <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{d.cta.title}</h2>
                                <p className="mt-3 text-slate-300">{d.cta.subtitle}</p>
                                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                                   <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition h-auto rounded-xl">
                                      <Link href={`/${lang}/login`}><CalendarCheck /><span>{d.cta.button}</span></Link>
                                   </Button>
                                    <Button asChild variant="outline" className="px-5 py-3 text-sm font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition h-auto rounded-xl bg-transparent border-white/10">
                                       <Link href="#features"><ListChecks /><span>{d.cta.buttonSecondary}</span></Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            
             <footer className="mt-16">
                <div className="container-responsive py-10">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                             <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 ring-1 ring-inset ring-white/20">
                                <Recycle className="h-4 w-4 text-white" />
                            </span>
                            <span className="text-slate-300 text-sm">{d.footer.copyright}</span>
                        </div>
                        <div className="flex items-center gap-5 text-sm">
                            <Link href="#" className="text-slate-300 hover:text-white">{d.footer.privacy}</Link>
                            <Link href="#" className="text-slate-300 hover:text-white">{d.footer.terms}</Link>
                            <Link href="#" className="text-slate-300 hover:text-white">{d.footer.contact}</Link>
                        </div>
                    </div>
                </div>
            </footer>
             <Dialog open={!!selectedUseCase} onOpenChange={() => setSelectedUseCase(null)}>
                <DialogContent className="max-w-2xl bg-[#0F172A]/80 backdrop-blur-lg border-white/10 text-white">
                  {selectedUseCase && (
                    <>
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-white">
                          {dictionary.landingPage.caseStudies.title}: {selectedUseCase.sector}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                        <div className="flex flex-col items-center text-center p-4 rounded-lg bg-black/20">
                          <Image 
                            src={`https://placehold.co/100x100.png`} 
                            alt={`${selectedUseCase.sector} logo`}
                            width={80} 
                            height={80}
                            className="rounded-full mb-4 ring-2 ring-white/10"
                            data-ai-hint="company logo"
                          />
                          <p className="font-semibold text-white">{selectedUseCase.manager}</p>
                          <p className="text-sm text-slate-400">{selectedUseCase.title}</p>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                <AlertOctagon className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-400">{dictionary.landingPage.caseStudies.problem}</h4>
                                <p className="text-sm text-slate-300">{selectedUseCase.problem}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                <Lightbulb className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-400">{dictionary.landingPage.caseStudies.solution}</h4>
                                <p className="text-sm text-slate-300">{selectedUseCase.solution}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                               <TrendingUpIcon className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-emerald-400">{dictionary.landingPage.caseStudies.results}</h4>
                                <p className="text-sm text-slate-300">{selectedUseCase.results}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
            </Dialog>
        </div>
    );
}


    