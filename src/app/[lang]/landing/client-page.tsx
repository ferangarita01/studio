
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
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import Image from "next/image";
import { PublicHeader } from "@/components/public-header";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
      ]
    : [
        { icon: AlertTriangle, text: d.item1 },
        { icon: FileWarning, text: d.item2 },
        { icon: Clock, text: d.item3 },
        { icon: Trash2, text: d.item4 },
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
        costPerTon: 80,
        recycleRate: 40,
        recoveryPrice: 120,
    });

    const [roi, setRoi] = useState({
        avoidedDisposal: 0,
        recyclingIncome: 0,
        totalRoi: 0,
    });

    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<ChartJS | null>(null);

    const formatCurrency = (n: number) => '$' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

    useEffect(() => {
        const recalc = () => {
            const volume = values.wasteVolume;
            const cost = values.costPerTon;
            const rate = Math.min(100, Math.max(0, values.recycleRate)) / 100;
            const price = values.recoveryPrice;

            const recyclableTons = volume * rate;
            const avoided = recyclableTons * cost;
            const income = recyclableTons * price;
            const total = avoided + income;

            setRoi({ avoidedDisposal: avoided, recyclingIncome: income, totalRoi: total });
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
                        labels: [d.legend.avoided, d.legend.income],
                        datasets: [{
                            data: [roi.avoidedDisposal, roi.recyclingIncome],
                            backgroundColor: ['#34d399', '#60a5fa'],
                            borderColor: ['#134e4a', '#1e3a8a'],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(15,23,42,0.95)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                borderWidth: 1,
                                padding: 12,
                                titleColor: '#e2e8f0',
                                bodyColor: '#e2e8f0',
                            }
                        },
                        cutout: '64%'
                    }
                });
            }
        }
        
        // This effect hook handles the update of chart data.
        const updateChart = () => {
             if (chartInstance.current && chartInstance.current.canvas?.ownerDocument) {
                chartInstance.current.data.datasets[0].data = [roi.avoidedDisposal, roi.recyclingIncome];
                chartInstance.current.update();
            }
        }
        updateChart();

        // This effect hook handles the cleanup of the chart instance.
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [roi.avoidedDisposal, roi.recyclingIncome, d.legend.avoided, d.legend.income]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setValues(prev => ({ ...prev, [id]: Number(value) }));
    };
    
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
                            { id: 'wasteVolume', label: d.labels.wasteVolume, icon: Truck, value: values.wasteVolume },
                            { id: 'costPerTon', label: d.labels.disposalCost, icon: Banknote, value: values.costPerTon },
                            { id: 'recycleRate', label: d.labels.recyclableRate, icon: Percent, value: values.recycleRate },
                            { id: 'recoveryPrice', label: d.labels.recoveryPrice, icon: Coins, value: values.recoveryPrice },
                        ].map(field => (
                            <label key={field.id} className="block">
                                <span className="text-sm text-slate-300">{field.label}</span>
                                <div className="mt-2 flex items-center gap-2 rounded-xl bg-[#0B1020] ring-1 ring-white/10 px-3">
                                    <field.icon className="h-4 w-4 text-slate-400" />
                                    <input
                                        id={field.id}
                                        type="number"
                                        min="0"
                                        value={field.value}
                                        onChange={handleInputChange}
                                        className="w-full bg-transparent py-3 outline-none text-slate-200 placeholder-slate-500"
                                    />
                                </div>
                            </label>
                        ))}
                    </div>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.avoidedDisposal}</div>
                            <div className="mt-1 text-xl font-semibold tracking-tight text-emerald-300">{formatCurrency(roi.avoidedDisposal)}</div>
                        </div>
                        <div className="rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.recyclingIncome}</div>
                            <div className="mt-1 text-xl font-semibold tracking-tight text-blue-300">{formatCurrency(roi.recyclingIncome)}</div>
                        </div>
                        <div className="rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="text-xs text-slate-400">{d.results.totalRoi}</div>
                            <div className="mt-1 text-xl font-semibold tracking-tight text-white">{formatCurrency(roi.totalRoi)}</div>
                        </div>
                    </div>
                     <div className="mt-6 flex items-center gap-3">
                        <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition">
                           <Link href={`/${lang}/login`}><Handshake className="h-4 w-4" /><span>{d.cta}</span></Link>
                        </Button>
                        <p className="text-xs text-slate-400">{d.disclaimer}</p>
                    </div>
                </div>
                <div className="lg:col-span-2 rounded-2xl p-6 ring-1 ring-white/10 bg-white/5">
                    <h3 className="text-lg font-semibold tracking-tight text-white">{d.breakdownTitle}</h3>
                    <p className="mt-1 text-sm text-slate-300">{d.breakdownSubtitle}</p>
                    <div className="mt-6">
                        <div className="relative h-64"><canvas ref={chartRef}></canvas></div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                                <div>
                                    <div className="text-sm text-slate-300">{d.legend.avoided}</div>
                                    <div className="text-sm font-medium text-slate-200">{formatCurrency(roi.avoidedDisposal)}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="h-3 w-3 rounded-full bg-blue-400"></span>
                                <div>
                                    <div className="text-sm text-slate-300">{d.legend.income}</div>
                                    <div className="text-sm font-medium text-slate-200">{formatCurrency(roi.recyclingIncome)}</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 rounded-xl bg-[#0B1020] ring-1 ring-white/10 p-4">
                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-slate-300">{d.info}</p>
                            </div>
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

    const useCases = [
      {
        icon: <Building2 className="h-5 w-5 text-emerald-300" />,
        key: 'companies',
      },
      {
        icon: <GraduationCap className="h-5 w-5 text-blue-300" />,
        key: 'schools',
      },
      {
        icon: <Ticket className="h-5 w-5 text-indigo-300" />,
        key: 'events',
      },
      {
        icon: <Library className="h-5 w-5 text-purple-300" />,
        key: 'universities',
      },
      {
        icon: <Recycle className="h-5 w-5 text-emerald-300" />,
        key: 'recyclers',
      },
      {
        icon: <Hammer className="h-5 w-5 text-amber-300" />,
        key: 'construction',
      },
    ];
    
    const featureIcons = [
        <Bot key="one" className="h-6 w-6 text-emerald-300" />,
        <FileBarChart key="two" className="h-6 w-6 text-blue-300" />,
        <ClipboardCheck key="three" className="h-6 w-6 text-amber-300" />,
        <ShieldCheck key="four" className="h-6 w-6 text-purple-300" />
    ];

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
                        <Image src="https://firebasestorage.googleapis.com/v0/b/wastewise-hdbhk.firebasestorage.app/o/img.jpg?alt=media&token=ad081ca2-8ba5-4309-9d71-b5d409d1e07d" alt="Earth from space, sustainability" layout="fill" objectFit="cover" className="opacity-30" data-ai-hint="earth space sustainability" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1020]/40 via-[#0B1020]/60 to-[#0B1020]"></div>
                    </div>
                    <div className="container-responsive">
                        <div className="mx-auto max-w-3xl text-center">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">{d.hero.title}</h1>
                            <p className="mt-5 text-base sm:text-lg text-slate-300">{d.hero.subtitle}</p>
                             <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                                 <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition h-auto rounded-xl">
                                    <Link href="#roi"><Calculator /><span>{d.hero.cta}</span></Link>
                                 </Button>
                                 <Button asChild variant="outline" className="px-5 py-3 text-sm font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition h-auto rounded-xl bg-transparent border-white/10">
                                     <Link href="#how"><PlayCircle /><span>{d.valueProposition.cta}</span></Link>
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
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{d.useCases.title}</h2>
                        <p className="mt-3 text-slate-300">{d.useCases.subtitle}</p>
                    </div>
                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                       {useCases.map((useCase, index) => {
                          const caseData = d.useCases[useCase.key as keyof typeof d.useCases];
                          const caseStudy = d.caseStudies[useCase.key as keyof typeof d.caseStudies];
                          return (
                            <div
                                key={index}
                                role="button"
                                onClick={() => setSelectedUseCase(caseStudy)}
                                className="rounded-2xl p-5 ring-1 ring-white/10 bg-white/5 hover:bg-white/7.5 transition cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                     <span className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-300/20">
                                        {useCase.icon}
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
                            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">{d.features.title}</h2>
                            <p className="mt-3 text-slate-300">{d.features.subtitle}</p>
                        </div>
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           {Object.values(d.features).map((feature: any, index: number) => (
                             <div key={index} className="rounded-2xl p-5 bg-[#0B1020] ring-1 ring-white/10">
                                {featureIcons[index]}
                                <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">{feature.title}</h3>
                                <p className="mt-2 text-sm text-slate-300">{feature.description}</p>
                             </div>
                           ))}
                        </div>
                    </div>
                </section>
                
                <ROICalculator dictionary={d.roiCalculator} lang={lang} />
                
                <section id="demo" className="mt-20">
                    <div className="container-responsive">
                        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 ring-1 ring-white/10 bg-gradient-to-br from-[#0B1020] to-slate-900">
                             <Image src="https://images.unsplash.com/photo-1621619856624-42fd193a0661?w=1080&q=80" alt="Minimal 3D render background" layout="fill" objectFit="cover" className="absolute inset-0 opacity-10 -z-10" data-ai-hint="abstract background" />
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
