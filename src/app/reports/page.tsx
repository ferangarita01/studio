import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-lg font-semibold md:text-2xl">Report Generation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <FileText className="h-16 w-16" />
            <p>Compliance report generation and templates will be available here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
