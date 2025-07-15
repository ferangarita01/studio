
"use client";

import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import {
  Loader2,
  Send,
  Sparkles,
  Leaf,
  BarChart,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Bar as BarRecharts,
  BarChart as BarChartRecharts,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart as PieChartRecharts,
  Cell,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | React.ReactNode;
}

export function AIAnalyzerClient({
  dictionary,
}: {
  dictionary: Dictionary["analyzerPage"];
}) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: dictionary.initialMessage }
  ]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
           viewport.scrollTop = viewport.scrollHeight;
        }
      }
    }, 100);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    startTransition(async () => {
        try {
            // If the user just says "hi" or something, use the placeholder data
            const dataToAnalyze = input.toLowerCase().includes('csv') || input.includes(',') ? input : placeholderData;
            
            const result = await analyzeWasteData({ wasteData: dataToAnalyze });
            
            if (result) {
                const assistantResponse: Message = {
                    id: Date.now().toString() + '-res',
                    role: 'assistant',
                    content: <AnalysisResult dictionary={dictionary} analysis={result} />
                };
                setMessages(prev => [...prev, assistantResponse]);
            } else {
                 throw new Error("No result from analysis");
            }
        } catch (error) {
            toast({
                title: dictionary.toast.title,
                description: dictionary.toast.description,
                variant: "destructive",
            });
            // remove user message on failure
            setMessages(prev => prev.slice(0, -1));
        }
    });

    setInput("");
  };

   useEffect(() => {
     scrollToBottom();
   }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-1 flex-col p-4 md:p-6 h-[calc(100vh-60px)]">
        <div className="mb-4">
            <h1 className="text-3xl font-semibold">{dictionary.title}</h1>
            <p className="text-muted-foreground">{dictionary.description}</p>
        </div>
        <div className="flex-1 flex flex-col bg-card border rounded-lg shadow-sm">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                 <div className="space-y-6 pr-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex items-start gap-4", message.role === 'user' ? 'justify-end' : '')}>
                             {message.role === 'assistant' && (
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback><Sparkles /></AvatarFallback>
                                </Avatar>
                             )}
                             <div className={cn("max-w-xl rounded-lg p-3 text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                {typeof message.content === 'string' ? <p className="whitespace-pre-wrap">{message.content}</p> : message.content}
                             </div>
                             {message.role === 'user' && (
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                             )}
                        </div>
                    ))}
                    {isPending && (
                       <div className="flex items-start gap-4">
                           <Avatar className="h-9 w-9 border">
                               <AvatarFallback><Sparkles /></AvatarFallback>
                           </Avatar>
                           <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                               <Loader2 className="h-5 w-5 animate-spin" />
                               <span className="text-sm text-muted-foreground">{dictionary.loading}</span>
                           </div>
                       </div>
                    )}
                </div>
            </ScrollArea>
             <div className="border-t p-4">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={dictionary.inputPlaceholder}
                        disabled={isPending}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isPending || !input.trim()}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
             </div>
        </div>
    </div>
  );
}

const AnalysisResult = ({ dictionary, analysis }: { dictionary: Dictionary["analyzerPage"], analysis: AnalyzeWasteDataOutput }) => {
  const chartConfig = React.useMemo(() => {
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
  
  const totalWaste = React.useMemo(() => {
    if (!analysis?.chartData) return 0;
    return analysis.chartData.reduce((acc, item) => acc + item.total, 0);
  }, [analysis]);
  
  return (
    <div className="space-y-6">
        <header className="border-b pb-4">
            <div className="flex items-center gap-2 font-semibold text-primary text-lg">
                <Recycle className="h-6 w-6" />
                <span>{dictionary.report.title}</span>
            </div>
        </header>
        
        <main className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
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
            
            <Card>
                <CardHeader>
                <CardTitle>{dictionary.report.wasteBreakdown.barChartTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChartRecharts data={analysis.chartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} fontSize={12} />
                    <YAxis label={{ value: 'kg', angle: -90, position: 'insideLeft' }} fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <BarRecharts dataKey="total" radius={4}>
                        {analysis.chartData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                        ))}
                    </BarRecharts>
                    </BarChartRecharts>
                </ChartContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>{dictionary.report.wasteBreakdown.pieChartTitle}</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full aspect-square">
                    <PieChartRecharts>
                        <ChartTooltip content={<ChartTooltipContent nameKey="total" />} />
                        <Pie data={analysis.chartData} dataKey="total" nameKey="name" innerRadius={50} strokeWidth={2}>
                            {analysis.chartData.map((entry) => (
                            <Cell key={`cell-${entry.name}`} fill={chartConfig[entry.name]?.color} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                    </PieChartRecharts>
                </ChartContainer>
                </CardContent>
            </Card>

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
    </div>
  );
};
