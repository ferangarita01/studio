
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, CalendarIcon, Trash2, Recycle, Loader2, DollarSign } from "lucide-react";
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
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(lang, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
  
  const formatShortDate = (date: Date) => {
     return new Intl.DateTimeFormat(lang, {
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
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
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary?.title || "Dashboard"}</h1>
          </div>
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
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
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
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dictionary.cards.totalWaste.title}
              </CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWaste.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.totalWaste.change}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.recyclingRate.title}</CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recyclingRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.recyclingRate.change}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.income.title}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalIncome)}</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.income.description}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.upcomingDisposals.title}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingDisposals.length}</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.upcomingDisposals.next}
              </p>
            </CardContent>
          </Card>
          <Card asChild>
            <Link href={`/${lang}/compliance`} onClick={handlePremiumFeatureClick}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{dictionary.cards.complianceStatus.title}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-2xl font-bold text-primary">{dictionary.cards.complianceStatus.status}</div>
                <p className="text-xs text-muted-foreground">
                    {dictionary.cards.complianceStatus.detail}
                </p>
                </CardContent>
            </Link>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
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
            <CardContent className="grid gap-4">
              {upcomingDisposals.length > 0 ? (
                upcomingDisposals.slice(0, 4).map((disposal) => (
                  <div key={disposal.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                    <div className="grid gap-1">
                      <p className="font-medium">
                        {disposal.wasteTypes.join(', ')} {dictionary.disposals.pickup}
                      </p>
                       <p className="text-sm text-muted-foreground">
                          {formatDate(disposal.date)}
                      </p>
                      <Badge variant="secondary">{dictionary.disposals.status[disposal.status as keyof typeof dictionary.disposals.status]}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming disposals.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.recentEntries.title}</CardTitle>
            <CardDescription>
              {dictionary.recentEntries.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.recentEntries.table.date}</TableHead>
                    <TableHead>{dictionary.recentEntries.table.type}</TableHead>
                    <TableHead className="text-right">{dictionary.recentEntries.table.quantity}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteLog.length > 0 ? (
                    wasteLog.slice(0, 5).map((entry: WasteEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {formatShortDate(entry.date)}
                        </TableCell>
                        <TableCell>{entry.type}</TableCell>
                        <TableCell className="text-right">{entry.quantity.toFixed(2)} kg</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No recent entries.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
    {dictionary.navigation.upgradeDialog && (
      <UpgradePlanDialog
        open={isUpgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        dictionary={dictionary.navigation.upgradeDialog}
        lang={lang}
      />
    )}
    </>
  );
}

    

    
