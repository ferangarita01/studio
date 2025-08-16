

"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, CalendarDays, Trash2, Recycle, Loader2, DollarSign, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { format as formatDateFns, getMonth, getYear } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import Link from "next/link";


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { DisposalEvent, WasteEntry } from "@/lib/types";
import type { Dictionary } from "@/lib/get-dictionary";
import { useCompany } from "./layout/app-shell";
import { getWasteLog, getDisposalEvents } from "@/services/waste-data-service";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { UpgradePlanDialog } from "./upgrade-plan-dialog";
import { useDictionaries } from "@/context/dictionary-context";
import { useTheme } from "next-themes";

const chartConfig = {
  quantity: {
    label: "Quantity (kg)",
  },
  recycling: {
    label: "Recycling",
    color: "hsl(var(--chart-1))",
  },
  organic: {
    label: "Organic",
    color: "hsl(var(--chart-2))",
  },
  general: {
    label: "General",
    color: "hsl(var(--chart-3))",
  },
  hazardous: {
    label: "Hazardous",
    color: "hsl(var(--destructive))",
  },
};

interface DashboardPageContentProps {
  dictionary: Dictionary["dashboard"];
}

const StatCard = ({ title, value, subtitle, trend, icon: Icon, color = "blue", onClick }: { title: string, value: string, subtitle: string, trend?: string, icon: React.ElementType, color?: string, onClick?: (e: React.MouseEvent) => void }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const colorClasses: Record<string, string> = {
      blue: 'text-blue-500',
      green: 'text-emerald-500',
      orange: 'text-orange-500',
      purple: 'text-purple-500',
      red: 'text-red-500'
    };
    
    const cardContent = (
         <div className="h-full bg-card border-border rounded-xl border p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5">
            <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                {title}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">
                {value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground/80">
                {subtitle}
                </p>
            </div>
            <div className="rounded-lg p-3 bg-muted">
                <Icon className={cn("h-6 w-6", colorClasses[color] || 'text-blue-500')} />
            </div>
            </div>
            {trend && (
            <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500 font-medium">{trend}</span>
            </div>
            )}
        </div>
    );

    if (onClick) {
        return <div onClick={onClick} className="cursor-pointer h-full">{cardContent}</div>;
    }

    return cardContent;
};


function WelcomeMessage({ dictionary }: { dictionary: Dictionary["dashboard"]["welcome"] }) {
  const { role } = useAuth();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="text-center max-w-4xl mx-auto">
      <h3 className="mt-4 text-2xl font-bold">{dictionary.title}</h3>
      <div className="text-muted-foreground mt-4">
        <p>{dictionary.description}</p>
        <div className="mt-8 text-left">
          <h4 className="font-semibold text-lg mb-4 text-center">{dictionary.whatToExpect.title}</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <div><strong>{dictionary.whatToExpect.items.centralDashboard.title}</strong> {dictionary.whatToExpect.items.centralDashboard.description}</div>
            <div><strong>{dictionary.whatToExpect.items.aiAnalyzer.title}</strong> {dictionary.whatToExpect.items.aiAnalyzer.description}</div>
            <div><strong>{dictionary.whatToExpect.items.wasteLog.title}</strong> {dictionary.whatToExpect.items.wasteLog.description}</div>
            <div><strong>{dictionary.whatToExpect.items.calendar.title}</strong> {dictionary.whatToExpect.items.calendar.description}</div>
            <div><strong>{dictionary.whatToExpect.items.detailedReports.title}</strong> {dictionary.whatToExpect.items.detailedReports.description}</div>
            <div><strong>{dictionary.whatToExpect.items.materials.title}</strong> {dictionary.whatToExpect.items.materials.description}</div>
          </div>
        </div>
        <div className="mt-8">
          <h4 className="font-semibold text-lg">{dictionary.gettingStarted.title}</h4>
          <div className="text-muted-foreground mt-2">
            {isClient && (
                <>
                {role === 'admin' ? (
                    <p>{dictionary.gettingStarted.adminText}</p>
                ) : (
                    <p>{dictionary.gettingStarted.clientText}</p>
                )}
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export function DashboardPageContent({
  dictionary,
}: DashboardPageContentProps) {
  const { isAuthLoading, lang, role, userProfile } = useAuth();
  const { selectedCompany, isLoading: isCompanyContextLoading } = useCompany();
  const fullDictionary = useDictionaries();
  
  const [wasteLog, setWasteLog] = React.useState<WasteEntry[]>([]);
  const [disposalEvents, setDisposalEvents] = React.useState<DisposalEvent[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);
  const [isUpgradeDialogOpen, setUpgradeDialogOpen] = React.useState(false);


  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedCompany) {
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      const [log, events] = await Promise.all([
        getWasteLog(selectedCompany.id),
        getDisposalEvents(selectedCompany.id),
      ]);
      setWasteLog(log);
      setDisposalEvents(events);
      setIsDataLoading(false);
    };

    if (!isCompanyContextLoading && selectedCompany) {
      fetchDashboardData();
    } else if (!selectedCompany) {
        setIsDataLoading(false);
    }
  }, [selectedCompany, isCompanyContextLoading]);
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    };
    return new Intl.DateTimeFormat(lang, { ...defaultOptions, ...options }).format(new Date(date));
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const wasteDataForChart = React.useMemo(() => {
    if (!wasteLog.length) return [];
    
    const dateLocale = lang === 'es' ? es : enUS;

    const monthlyData = wasteLog.reduce((acc, entry) => {
      const year = getYear(entry.date);
      const month = getMonth(entry.date);
      const key = `${year}-${month}`;
      const monthName = formatDateFns(entry.date, 'MMMM', { locale: dateLocale });
      
      if (!acc[key]) {
        acc[key] = { 
            month: monthName, 
            year, 
            monthNum: month,
            recycling: 0, 
            organic: 0, 
            general: 0, 
            hazardous: 0 
        };
      }
      
      const typeKey = entry.type.toLowerCase() as keyof typeof acc[typeof key];
      if(typeKey in acc[key]){
         acc[key][typeKey] += entry.quantity;
      }

      return acc;
    }, {} as Record<string, { month: string; year: number; monthNum: number; recycling: number; organic: number; general: number; hazardous: number }>);
    
    return Object.values(monthlyData).sort((a,b) => (a.year - b.year) || (a.monthNum - b.monthNum));

  }, [wasteLog, lang]);

  const handlePremiumFeatureClick = (e: React.MouseEvent) => {
    const isPremiumFeature = true; // This card represents a premium feature
    const isFreeUser = role === 'client' && userProfile?.plan !== 'Premium';

    if (isPremiumFeature && isFreeUser) {
      e.preventDefault();
      setUpgradeDialogOpen(true);
    }
  };

  const renderLoadingState = () => (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
       </div>
  )

  if (isCompanyContextLoading || isAuthLoading || !isClient || !dictionary?.cards?.income) {
      return renderLoadingState();
  }
  
  if (!selectedCompany) {
     return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            <WelcomeMessage dictionary={dictionary.welcome} />
          </div>
       </div>
    );
  }

  if (isDataLoading) {
      return renderLoadingState();
  }

  const upcomingDisposals = disposalEvents.filter(d => (d.status === 'Scheduled' || d.status === 'Ongoing'));

  const totalWaste = wasteLog.reduce((acc, entry) => acc + entry.quantity, 0);
  const totalRecycling = wasteLog.filter(e => e.type === 'Recycling').reduce((acc, entry) => acc + entry.quantity, 0);
  const recyclingRate = totalWaste > 0 ? (totalRecycling / totalWaste) * 100 : 0;
  
  const totalIncome = wasteLog.reduce((acc, entry) => {
    const entryValue = (entry.price || 0) * entry.quantity - (entry.serviceCost || 0);
    return acc + entryValue;
  }, 0);


  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard
          title={dictionary.cards.totalWaste.title}
          value={`${totalWaste.toFixed(2)} kg`}
          subtitle={dictionary.cards.totalWaste.change}
          icon={Trash2}
          color="blue"
        />
        <StatCard
          title={dictionary.cards.recyclingRate.title}
          value={`${recyclingRate.toFixed(1)}%`}
          subtitle={dictionary.cards.recyclingRate.change}
          icon={Recycle}
          color="green"
        />
        <StatCard
          title={dictionary.cards.income.title}
          value={formatCurrency(totalIncome)}
          subtitle={dictionary.cards.income.description}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title={dictionary.cards.upcomingDisposals.title}
          value={upcomingDisposals.length.toString()}
          subtitle={dictionary.cards.upcomingDisposals.next}
          icon={AlertCircle}
          color="orange"
        />
        <StatCard
            title={dictionary.cards.complianceStatus.title}
            value={dictionary.cards.complianceStatus.status}
            subtitle={dictionary.cards.complianceStatus.detail}
            icon={CheckCircle2}
            color="green"
            onClick={(e) => handlePremiumFeatureClick(e)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{dictionary.wasteOverview.title}</CardTitle>
              <CardDescription>
                {dictionary.wasteOverview.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={wasteDataForChart} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="recycling" stackId="a" fill="var(--color-recycling)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="organic" stackId="a" fill="var(--color-organic)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="general" stackId="a" fill="var(--color-general)" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="hazardous" stackId="a" fill="var(--color-hazardous)" radius={[0, 0, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.disposals.title}</CardTitle>
              <CardDescription>
                {dictionary.disposals.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingDisposals.length > 0 ? (
                upcomingDisposals.slice(0, 4).map((disposal) => (
                    <div key={disposal.id} className="flex items-start gap-4 p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-primary mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-primary-dark dark:text-primary-light">{disposal.wasteTypes.join(', ')} {dictionary.disposals.pickup}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(disposal.date, { hour: 'numeric', minute: 'numeric', hour12: true })}
                        </p>
                         <Badge variant="secondary" className="mt-2">
                            {dictionary.disposals.status[disposal.status as keyof typeof dictionary.disposals.status]}
                        </Badge>
                      </div>
                    </div>
                ))
              ) : (
                 <div className="text-center py-8">
                  <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No upcoming disposals.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
      </div>

      {fullDictionary?.navigation.upgradeDialog && (
        <UpgradePlanDialog
          open={isUpgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          dictionary={fullDictionary.navigation.upgradeDialog}
          lang={lang}
        />
      )}
    </>
  );
}

