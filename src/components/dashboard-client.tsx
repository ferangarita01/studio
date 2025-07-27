
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Activity, CalendarIcon, Trash2, Recycle, Loader2 } from "lucide-react";

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
import { getWasteChartData, getWasteLog, getDisposalEvents } from "@/services/waste-data-service";
import { useAuth } from "@/context/auth-context";

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
};

interface DashboardClientProps {
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
          {isClient && (
            <div className="text-muted-foreground mt-2">
              {role === 'admin' ? (
                <p>{dictionary.gettingStarted.adminText}</p>
              ) : (
                <p>{dictionary.gettingStarted.clientText}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export function DashboardClient({
  dictionary,
}: DashboardClientProps) {
  const { isAuthLoading } = useAuth();
  const { selectedCompany, isLoading: isCompanyContextLoading } = useCompany();
  
  const [wasteDataAll, setWasteDataAll] = React.useState<Record<string, any[]>>({});
  const [wasteLogAll, setWasteLogAll] = React.useState<WasteEntry[]>([]);
  const [disposalEvents, setDisposalEvents] = React.useState<DisposalEvent[]>([]);
  const [isDataLoading, setIsDataLoading] = React.useState(true);
  const [isClient, setIsClient] = React.useState(false);

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
      const [wasteData, wasteLog, events] = await Promise.all([
        getWasteChartData(),
        getWasteLog(),
        getDisposalEvents(),
      ]);
      setWasteDataAll(wasteData);
      setWasteLogAll(wasteLog);
      setDisposalEvents(events);
      setIsDataLoading(false);
    };

    if (!isCompanyContextLoading) {
      fetchDashboardData();
    }
  }, [selectedCompany, isCompanyContextLoading]);
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  }
  
  const formatShortDate = (date: Date) => {
     return new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  const renderLoadingState = () => (
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
       </div>
  )

  if (isCompanyContextLoading || isAuthLoading || !isClient) {
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

  const wasteData = selectedCompany ? wasteDataAll[selectedCompany.id] || [] : [];
  const wasteLog = selectedCompany ? wasteLogAll.filter(entry => entry.companyId === selectedCompany.id) : [];
  const upcomingDisposals = selectedCompany ? disposalEvents.filter(d => (d.status === 'Scheduled' || d.status === 'Ongoing') && d.companyId === selectedCompany.id) : [];


  return (
    <div className="flex w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {dictionary.cards.totalWaste.title}
              </CardTitle>
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,254 kg</div>
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
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                {dictionary.cards.recyclingRate.change}
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
          <Card>
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
                <BarChart data={wasteData} accessibilityLayer>
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
                  <Bar dataKey="organic" stackId="a" fill="var(--color-organic)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="general" stackId="a" fill="var(--color-general)" radius={[4, 4, 0, 0]} />
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
  );
}
