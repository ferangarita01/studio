import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function LogPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <h1 className="text-lg font-semibold md:text-2xl">Waste Log</h1>
      <Card>
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <Trash2 className="h-16 w-16" />
            <p>A detailed table of all waste entries will be available here soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
