"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { PlusCircle, Activity, ArrowUpRight, Calendar as CalendarIcon, DollarSign, Users } from "lucide-react";

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
import { upcomingDisposals, wasteData, wasteLog } from "@/lib/data";
import type { WasteEntry } from "@/lib/types";

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

export default function DashboardPage() {
  const [isAddWasteDialogOpen, setAddWasteDialogOpen] = React.useState(false);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setAddWasteDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Waste Entry
              </span>
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Waste This Month
              </CardTitle>
              <TrashIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,254 kg</div>
              <p className="text-xs text-muted-foreground">
                +15.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recycling Rate</CardTitle>
              <RecycleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Disposals</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                Next one in 2 days
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">On Track</div>
              <p className="text-xs text-muted-foreground">
                All reports filed on time
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Waste Generation Overview</CardTitle>
              <CardDescription>
                Monthly waste generation by type.
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
              <CardTitle>Upcoming Disposals</CardTitle>
              <CardDescription>
                Scheduled waste pickup and disposal events.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {upcomingDisposals.map((disposal) => (
                <div key={disposal.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                  <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                  <div className="grid gap-1">
                    <p className="font-medium">
                      {disposal.wasteTypes.join(', ')} Pickup
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {disposal.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <Badge variant="secondary">{disposal.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Waste Entries</CardTitle>
            <CardDescription>
              A log of the most recently recorded waste entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Quantity (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wasteLog.slice(0, 5).map((entry: WasteEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {entry.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
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
      <AddWasteDialog open={isAddWasteDialogOpen} onOpenChange={setAddWasteDialogOpen} />
    </div>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function RecycleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1 .034-1.834L8.615 4.97a1.83 1.83 0 0 1 1.57-.881h0a1.785 1.785 0 0 1 1.834.034l1.332.894" />
      <path d="m14 13-3.138-2.105a1.785 1.785 0 0 0-2.158.33l-1.35 2.025" />
      <path d="M14 13h2.185a1.83 1.83 0 0 1 1.57.881 1.785 1.785 0 0 1-.034 1.834l-5.337 8.01a1.83 1.83 0 0 1-1.57.881H9.5a1.785 1.785 0 0 1-1.834-.034l-1.332-.894" />
      <path d="m7 16 3.138 2.105a1.785 1.785 0 0 0 2.158-.33l1.35-2.025" />
      <path d="m11 4 3 4" />
      <path d="m18 11 2.5-1.5" />
      <path d="m5 13-2.5 1.5" />
    </svg>
  );
}
