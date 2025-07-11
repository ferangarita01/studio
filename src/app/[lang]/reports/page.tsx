import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { Dictionary } from "@/lib/get-dictionary";

export default function ReportsPage({
  dictionary,
}: {
  dictionary: Dictionary["reportsPage"];
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{dictionary.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <FileText className="h-16 w-16" />
            <p>{dictionary.cardContent}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
