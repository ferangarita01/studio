"use client";

import React, { useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
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

export default function AIAnalyzerPage() {
  const [wasteDataInput, setWasteDataInput] = useState(placeholderData);
  const [analysis, setAnalysis] = useState<AnalyzeWasteDataOutput | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleAnalyze = () => {
    startTransition(async () => {
      setAnalysis(null);
      const result = await analyzeWasteData({ wasteData: wasteDataInput });
      if (result) {
        setAnalysis(result);
      } else {
        toast({
          title: "Analysis Failed",
          description: "Could not analyze the waste data. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <h1 className="text-3xl font-semibold">AI Waste Reduction Tool</h1>
        <p className="text-muted-foreground">
          Paste your waste data in CSV format to get AI-powered reduction insights.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Waste Data Input</CardTitle>
            <CardDescription>
              Provide waste type and quantity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your CSV data here"
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
              Analyze Data
            </Button>
          </CardFooter>
        </Card>

        {isPending && (
          <div className="mt-8 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Analyzing your data...</p>
          </div>
        )}

        {analysis && (
          <div className="mt-8 grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{analysis.summary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Reduction Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{analysis.recommendations}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
