"use client";

import React, { useState, useTransition, useRef } from "react";
import { Loader2, Sparkles, Leaf, Download } from "lucide-react";
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

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const height = pdfWidth / ratio;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, height);
      pdf.save("WasteWise_Analysis_Report.pdf");
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-4xl gap-2">
        <h1 className="text-3xl font-semibold">{dictionary.title}</h1>
        <p className="text-muted-foreground">
          {dictionary.description}
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
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
            <div className="grid gap-6" ref={reportRef}>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}