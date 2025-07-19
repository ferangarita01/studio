
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/get-dictionary";
import { Gavel, FileText, ShieldCheck, PlusCircle, Pencil } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function ComplianceClient({
  dictionary,
}: {
  dictionary: Dictionary["compliancePage"];
}) {
  const { role } = useAuth();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto grid w-full max-w-5xl gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-3xl font-semibold">{dictionary.title}</h1>
                <p className="text-muted-foreground">{dictionary.description}</p>
            </div>
            {role === 'admin' && (
                <Button size="sm" className="h-8 gap-1 mt-4 sm:mt-0">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        {dictionary.admin.addRegulation}
                    </span>
                </Button>
            )}
        </div>
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
            {role === 'admin' && (
                 <CardFooter className="border-t px-6 py-4">
                    <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        {dictionary.admin.editContent}
                    </Button>
                 </CardFooter>
            )}
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.regulations.title}</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{dictionary.cards.regulations.description}</p>
            </CardContent>
             {role === 'admin' && (
                <CardFooter>
                    <Button className="w-full">{dictionary.admin.manage}</Button>
                </CardFooter>
            )}
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.reports.title}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">{dictionary.cards.reports.description}</p>
            </CardContent>
             {role === 'admin' && (
                <CardFooter>
                    <Button className="w-full">{dictionary.admin.manage}</Button>
                </CardFooter>
            )}
          </Card>
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{dictionary.cards.audits.title}</CardTitle>
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
                 <p className="text-sm text-muted-foreground">{dictionary.cards.audits.description}</p>
            </CardContent>
            {role === 'admin' && (
                <CardFooter>
                    <Button className="w-full">{dictionary.admin.manage}</Button>
                </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
