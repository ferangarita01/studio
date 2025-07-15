
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/get-dictionary";
import { Gavel, FileText, ShieldCheck } from "lucide-react";

export function ComplianceClient({
  dictionary,
}: {
  dictionary: Dictionary["compliancePage"];
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl gap-2">
        <h1 className="text-3xl font-semibold">{dictionary.title}</h1>
        <p className="text-muted-foreground">{dictionary.description}</p>
      </div>

      <div className="mx-auto grid w-full max-w-5xl gap-8 mt-4">
        <Card>
            <CardHeader>
                <CardTitle>{dictionary.main.title}</CardTitle>
                <CardDescription>{dictionary.main.description}</CardDescription>
            </CardHeader>
            <CardContent>
                 <p>{dictionary.main.content}</p>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.regulations.title}</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{dictionary.cards.regulations.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.reports.title}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">{dictionary.cards.reports.description}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.audits.title}</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">{dictionary.cards.audits.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
