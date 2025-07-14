
"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Dictionary } from "@/lib/get-dictionary";
import type { WasteEntry } from "@/lib/types";
import { useCompany } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AddWasteDialog } from "@/components/add-waste-dialog";

interface LogClientProps {
  dictionary: Dictionary["logPage"];
  initialWasteLog: WasteEntry[];
}

export function LogClient({ dictionary, initialWasteLog }: LogClientProps) {
  const { selectedCompany } = useCompany();
  const [isClient, setIsClient] = useState(false);
  const [isAddWasteDialogOpen, setAddWasteDialogOpen] = useState(false);
  const [allWasteLog, setAllWasteLog] = useState(initialWasteLog);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    setAllWasteLog(initialWasteLog);
  }, [initialWasteLog]);


  const handleEntryAdded = useCallback((newEntry: WasteEntry) => {
    // Add new entry to the top of the list
    setAllWasteLog(currentLog => [newEntry, ...currentLog]);
  }, []);

  if (!selectedCompany) {
    return (
       <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
          </div>
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-8">
            <div className="text-center">
              <p className="text-muted-foreground">Please select a company to see the waste log.</p>
            </div>
          </div>
       </div>
    );
  }

  const wasteLog = allWasteLog.filter(
    (entry) => entry.companyId === selectedCompany.id
  );

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
           <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setAddWasteDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {dictionary.addWasteEntry}
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{dictionary.cardTitle}</CardTitle>
            <CardDescription>{dictionary.cardDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{dictionary.table.date}</TableHead>
                    <TableHead>{dictionary.table.type}</TableHead>
                    <TableHead className="text-right">{dictionary.table.quantity}</TableHead>
                    <TableHead className="text-right">{dictionary.table.price}</TableHead>
                    <TableHead className="text-right">{dictionary.table.serviceCost}</TableHead>
                    <TableHead className="text-right">{dictionary.table.totalValue}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wasteLog.length > 0 ? (
                    wasteLog.map((entry) => {
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {isClient ? formatDate(entry.date) : <Skeleton className="h-4 w-32" />}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dictionary.types[entry.type]}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.quantity.toFixed(2)} kg
                          </TableCell>
                           <TableCell className="text-right">
                            {isClient ? formatCurrency(entry.price) : <Skeleton className="h-4 w-16 float-right" />}
                          </TableCell>
                           <TableCell className="text-right">
                            {isClient ? formatCurrency(entry.serviceCost) : <Skeleton className="h-4 w-16 float-right" />}
                          </TableCell>
                          <TableCell className="text-right">
                             {isClient ? (() => {
                                const totalValue = (entry.price || 0) * entry.quantity - (entry.serviceCost || 0);
                                return (
                                  <span className={totalValue >= 0 ? 'text-primary' : 'text-destructive'}>
                                    {formatCurrency(totalValue)}
                                  </span>
                                )
                             })() : <Skeleton className="h-4 w-20 float-right" />}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {dictionary.noEntries}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <AddWasteDialog 
        open={isAddWasteDialogOpen} 
        onOpenChange={setAddWasteDialogOpen}
        dictionary={dictionary.addWasteDialog}
        onEntryAdded={handleEntryAdded}
      />
    </>
  );
}
