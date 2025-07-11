"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { Dictionary } from "@/lib/get-dictionary";
import type { ReportData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

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
  weeklyData: ReportData;
  monthlyData: ReportData;
}

function ReportView({
  dictionary,
  data,
}: {
  dictionary: Dictionary["reportsPage"]["reportView"];
  data: ReportData;
}) {
  return (
    <div className="grid gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.cards.collectionCosts.title}</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalCosts.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{dictionary.cards.collectionCosts.description}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{dictionary.cards.recyclingIncome.title}</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalIncome.toFixed(2)}</div>
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
              ${data.netResult.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">{dictionary.cards.netResult.description}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
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
                        {new Date(tx.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={tx.type === 'income' ? 'default' : 'destructive'} className="font-semibold">
                         {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


export function ReportsClient({
  dictionary,
  weeklyData,
  monthlyData,
}: ReportsClientProps) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
      </div>
      <Tabs defaultValue="weekly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="weekly">{dictionary.tabs.weekly}</TabsTrigger>
          <TabsTrigger value="monthly">{dictionary.tabs.monthly}</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly" className="space-y-4">
          <ReportView dictionary={dictionary.reportView} data={weeklyData} />
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <ReportView dictionary={dictionary.reportView} data={monthlyData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
