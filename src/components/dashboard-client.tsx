"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { PlusCircle, Activity, CalendarIcon, Trash2, Recycle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AddWasteDialog } from "@/components/add-waste-dialog";
import type { WasteEntry, DisposalEvent } from "@/lib/types";
import type { Dictionary } from "@/lib/get-dictionary";
import { disposalEvents } from "@/lib/data";
import { useCompany } from "./layout/app-shell";

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
  wasteDataAll: Record<string, any[]>;
  wasteLogAll: WasteEntry[];
}

export function DashboardClient({
  dictionary,
  wasteDataAll,
  wasteLogAll,
}: DashboardClientProps) {
  const [isAddWasteDialogOpen, setAddWasteDialogOpen] = React.useState(false);
  const { selectedCompany } = useCompany();

  const wasteData = wasteDataAll[selectedCompany.id] || [];
  const wasteLog = wasteLogAll.filter(entry => entry.companyId === selectedCompany.id);
  const upcomingDisposals = disposalEvents.filter(d => (d.status === 'Scheduled' || d.status === 'Ongoing') && d.companyId === selectedCompany.id);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setAddWasteDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {dictionary.addWasteEntry}
              </span>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
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
              {upcomingDisposals.map((disposal) => (
                <div key={disposal.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="grid gap-1">
                    <p className="font-medium">
                      {disposal.wasteTypes.join(', ')} {dictionary.disposals.pickup}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(disposal.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <Badge variant="secondary">{dictionary.disposals.status[disposal.status as keyof typeof dictionary.disposals.status]}</Badge>
                  </div>
                </div>
              ))}
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dictionary.recentEntries.table.date}</TableHead>
                  <TableHead>{dictionary.recentEntries.table.type}</TableHead>
                  <TableHead className="text-right">{dictionary.recentEntries.table.quantity}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteLog.slice(0, 5).map((entry: WasteEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </TableCell>
                    <TableCell>{entry.type}</TableCell>
                    <TableCell className="text-right">{entry.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <AddWasteDialog 
        open={isAddWasteDialogOpen} 
        onOpenChange={setAddWasteDialogOpen}
        dictionary={dictionary.addWasteDialog}
      />
    </div>
  );
}
