
"use client";

import React, { useState, useTransition, useRef, useMemo, useEffect } from "react";
import {
  Loader2,
  Sparkles,
  Leaf,
  Download,
  BarChart,
  PieChart as PieChartIcon, // Renamed to avoid conflict
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { analyzeWasteData } from "@/ai/flows/analyze-waste-data";
import type { AnalyzeWasteDataOutput } from "@/ai/flows/analyze-waste-data";
import { useToast } from "@/hooks/use-toast";
import type { Dictionary } from "@/lib/get-dictionary";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart as BarChartRecharts,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart as PieChartRecharts,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const placeholderData = `Waste Type,Quantity (kg)
Recycling,186
Organic,80
General,240
Recycling,305
Organic,200
General,280
Recycling,237
Organic,120
General,320`;

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function AIAnalyzerClient({
  dictionary,
}: {
  dictionary: Dictionary["analyzerPage"];
}) {
  const [wasteDataInput, setWasteDataInput] = useState(placeholderData);
  const [analysis, setAnalysis] = useState<AnalyzeWasteDataOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAnalyze = () => {
    startTransition(async () => {
      setAnalysis(null);
      const result = await analyzeWasteData({ wasteData: wasteDataInput });
      if (result) {
        setAnalysis(result);
      } else {
        toast({
          title: dictionary.toast.title,
          description: dictionary.toast.description,
          variant: "destructive",
        });
      }
    });
  };

  const handleDownloadPdf = async () => {
    const input = reportRef.current;
    if (!input) return;

    // Dynamically import the libraries only when needed
    const html2canvas = (await import("html2canvas")).default;
    const jsPDF = (await import("jspdf")).default;

    html2canvas(input, { scale: 2, windowWidth: 1200 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const pdfHeight = pdfWidth / ratio;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("WasteWise_Analysis_Report.pdf");
    });
  };
  
  const chartConfig = useMemo(() => {
    if (!analysis?.chartData) return {};
    const config: ChartConfig = {};
    analysis.chartData.forEach((item, index) => {
        config[item.name] = {
            label: item.name,
            color: CHART_COLORS[index % CHART_COLORS.length],
        };
    });
    return config;
  }, [analysis]);
  
  const totalWaste = useMemo(() => {
    if (!analysis?.chartData) return 0;
    return analysis.chartData.reduce((acc, item) => acc + item.total, 0);
  }, [analysis]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl gap-2">
        <h1 className="text-3xl font-semibold">{dictionary.title}</h1>
        <p className="text-muted-foreground">{dictionary.description}</p>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.inputCard.title}</CardTitle>
            <CardDescription>
              {dictionary.inputCard.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder={dictionary.inputCard.placeholder}
              className="min-h-[200px] font-mono"
              value={wasteDataInput}
              onChange={(e) => setWasteDataInput(e.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleAnalyze} disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {dictionary.inputCard.button}
            </Button>
          </CardFooter>
        </Card>

        {isPending && (
          <div className="mt-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">{dictionary.loading}</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8">
            <div className="flex justify-end mb-4">
              <Button onClick={handleDownloadPdf} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {dictionary.downloadPdf}
              </Button>
            </div>
            <div
              className="bg-card text-card-foreground p-8 rounded-lg shadow-sm border"
              ref={reportRef}
            >
              <header className="mb-8 border-b pb-4">
                <div className="flex items-center gap-2 font-semibold text-primary text-2xl">
                    <Recycle className="h-8 w-8" />
                    <span>WasteWise</span>
                </div>
                <h2 className="text-xl font-bold mt-2">{dictionary.report.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {dictionary.report.generatedOn}{' '}
                  {isClient ? (
                    new Date().toLocaleDateString()
                  ) : (
                    <Skeleton className="h-4 w-24 inline-block" />
                  )}
                </p>
              </header>
              
              <main className="grid gap-8">
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{dictionary.report.totalWaste.title}</CardTitle>
                            <BarChart className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalWaste.toFixed(2)} kg</div>
                            <p className="text-xs text-muted-foreground">{dictionary.report.totalWaste.description}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            {dictionary.carbonFootprintCard.title}
                        </CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                        <div className="text-2xl font-bold">{analysis.carbonFootprint.toFixed(2)} kg CO₂e</div>
                        <p className="text-xs text-muted-foreground">
                            {dictionary.carbonFootprintCard.description}
                        </p>
                        </CardContent>
                    </Card>
                </div>
              
                <div className="grid gap-6 md:grid-cols-5">
                    <Card className="md:col-span-3">
                        <CardHeader>
                        <CardTitle>{dictionary.report.wasteBreakdown.barChartTitle}</CardTitle>
                        </CardHeader>
                        <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <BarChartRecharts data={analysis.chartData} accessibilityLayer>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                            <YAxis label={{ value: 'kg', angle: -90, position: 'insideLeft' }} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="total" radius={4}>
                                {analysis.chartData.map((entry) => (
                                <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                                ))}
                            </Bar>
                            </BarChartRecharts>
                        </ChartContainer>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardHeader>
                        <CardTitle>{dictionary.report.wasteBreakdown.pieChartTitle}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                            <PieChartRecharts>
                                <ChartTooltip content={<ChartTooltipContent nameKey="total" />} />
                                <Pie data={analysis.chartData} dataKey="total" nameKey="name" innerRadius={50}>
                                    {analysis.chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                            </PieChartRecharts>
                        </ChartContainer>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                    <CardTitle>{dictionary.summaryCard.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="whitespace-pre-wrap">{analysis.summary}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle>{dictionary.recommendationsCard.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <p className="whitespace-pre-wrap">{analysis.recommendations}</p>
                    </CardContent>
                </Card>
              </main>

              <footer className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
                <p>WasteWise Waste Analysis Report</p>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
