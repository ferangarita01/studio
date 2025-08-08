
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, DollarSign, Download, Loader2 } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Dictionary } from "@/lib/get-dictionary";
import type { ReportData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useCompany } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { useDictionaries } from "@/context/dictionary-context";
import { getWeeklyReportData, getMonthlyReportData } from "@/services/waste-data-service";
import { cn } from "@/lib/utils";

const chartConfig = {
  costs: {
    label: "Costs",
    color: "hsl(var(--destructive))",
  },
  income: {
    label: "Income",
    color: "hsl(var(--primary))",
  },
};

interface ReportsClientProps {
  dictionary: Dictionary["reportsPage"];
}

function ReportView({
  dictionary,
  data,
}: {
  dictionary: Dictionary["reportsPage"]["reportView"];
  data: ReportData;
}) {
  const reportRef = useRef<HTMLDivElement>(null);
  const reportPageDictionary = useDictionaries()?.reportsPage;

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
  }

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) return;

    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const height = pdfWidth / ratio;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, height);
      pdf.save("WasteWise_Report.pdf");
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleDownloadPdf} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          {reportPageDictionary?.downloadPdf}
        </Button>
      </div>
      <div className="grid gap-4 md:gap-8" ref={reportRef}>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.collectionCosts.title}</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(data.totalCosts)}
              </div>
              <p className="text-xs text-muted-foreground">{dictionary.cards.collectionCosts.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.recyclingIncome.title}</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
               <div className="text-2xl font-bold">
                  {formatCurrency(data.totalIncome)}
                </div>
              <p className="text-xs text-muted-foreground">{dictionary.cards.recyclingIncome.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.netResult.title}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${data.netResult >= 0 ? 'text-primary' : 'text-destructive'}`}>
                 {formatCurrency(data.netResult)}
              </div>
              <p className="text-xs text-muted-foreground">{dictionary.cards.netResult.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>{dictionary.chart.title}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <BarChart data={data.chartData} accessibilityLayer>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} />} />
                  <Bar dataKey="costs" fill="var(--color-costs)" radius={4} />
                  <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{dictionary.transactions.title}</CardTitle>
              <CardDescription>{dictionary.transactions.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{dictionary.transactions.table.description}</TableHead>
                      <TableHead className="text-right">{dictionary.transactions.table.amount}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          <div className="font-medium">{tx.description}</div>
                           <div className="text-sm text-muted-foreground">
                            {formatDate(tx.date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="font-semibold">
                            {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


export function ReportsClient({
  dictionary,
}: ReportsClientProps) {
  const { selectedCompany } = useCompany();
  const { role, userProfile, isLoading: isAuthLoading } = useAuth();
  const [weeklyDataAll, setWeeklyDataAll] = useState<Record<string, ReportData>>({});
  const [monthlyDataAll, setMonthlyDataAll] = useState<Record<string, ReportData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      const [weekly, monthly] = await Promise.all([
        getWeeklyReportData(),
        getMonthlyReportData(),
      ]);
      setWeeklyDataAll(weekly);
      setMonthlyDataAll(monthly);
      setIsLoading(false);
    };
    fetchReports();
  }, []);
  
  const showAdminFeatures = isClient && !isAuthLoading && (role === 'admin' || userProfile?.plan === 'Premium');

  if (!selectedCompany) {
    return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Please select a company to see reports.</p>
            </div>
          </div>
       </div>
    );
  }
  
  if (isLoading || isAuthLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const weeklyData = weeklyDataAll[selectedCompany.id];
  const monthlyData = monthlyDataAll[selectedCompany.id];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
      </div>
      {(!weeklyData || !monthlyData) ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
          <p className="text-center text-muted-foreground">No report data available for this company.</p>
        </div>
      ) : (
        <Tabs defaultValue="weekly" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weekly">{dictionary.tabs.weekly}</TabsTrigger>
            <TabsTrigger value="monthly" className={cn(!showAdminFeatures && "hidden")}>
              {dictionary.tabs.monthly}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="weekly" className="space-y-4">
            <ReportView dictionary={dictionary.reportView} data={weeklyData} />
          </TabsContent>
          <TabsContent value="monthly" className={cn("space-y-4", !showAdminFeatures && "hidden")}>
             {monthlyData && <ReportView dictionary={dictionary.reportView} data={monthlyData} />}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
