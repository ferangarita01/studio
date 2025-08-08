
"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle, Loader2, MoreHorizontal, Trash2, Pencil } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Dictionary } from "@/lib/get-dictionary";
import type { WasteEntry } from "@/lib/types";
import { useCompany } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddWasteDialog } from "@/components/add-waste-dialog";
import { useAuth } from "@/context/auth-context";
import { getWasteLog, deleteWasteEntry } from "@/services/waste-data-service";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n-config";
import { useToast } from "@/hooks/use-toast";


interface LogClientProps {
  dictionary: Dictionary["logPage"];
  lang: Locale;
}

export function LogClient({ dictionary, lang }: LogClientProps) {
  const { selectedCompany } = useCompany();
  const [isAddWasteDialogOpen, setAddWasteDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WasteEntry | null>(null);
  const [wasteLog, setWasteLog] = useState<WasteEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { role, isLoading: isAuthLoading, user } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchLog = async () => {
      if (!selectedCompany) {
        setWasteLog([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const log = await getWasteLog(selectedCompany.id);
      setWasteLog(log);
      setIsLoading(false);
    };
    fetchLog();
  }, [selectedCompany]);

  const handleAddClick = () => {
    setSelectedEntry(null);
    setAddWasteDialogOpen(true);
  };
  
  const handleEditClick = (entry: WasteEntry) => {
    setSelectedEntry(entry);
    setAddWasteDialogOpen(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!user) return;
    try {
        await deleteWasteEntry(entryId, user.uid);
        setWasteLog(prev => prev.filter(entry => entry.id !== entryId));
        toast({
            title: dictionary.toast.delete.title,
            description: dictionary.toast.delete.description,
        });
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to delete waste entry.",
            variant: "destructive"
        });
    }
  };

  const handleEntrySaved = useCallback((savedEntry: WasteEntry) => {
    const entryExists = wasteLog.some(entry => entry.id === savedEntry.id);
    if (entryExists) {
        // Update existing entry
        setWasteLog(currentLog => 
            currentLog.map(entry => entry.id === savedEntry.id ? savedEntry : entry)
                      .sort((a,b) => b.date.getTime() - a.date.getTime())
        );
    } else {
        // Add new entry
        setWasteLog(currentLog => [savedEntry, ...currentLog].sort((a,b) => b.date.getTime() - a.date.getTime()));
    }
  }, [wasteLog]);

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

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat(lang, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(lang, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }
  
  const showAdminFeatures = isClient && !isAuthLoading && role === 'admin';

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
           <div className={cn("ml-auto flex items-center gap-2", !showAdminFeatures && "hidden")}>
             <Button size="sm" className="h-8 gap-1" onClick={handleAddClick}>
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
                    <TableHead>{dictionary.table.material}</TableHead>
                    <TableHead className="text-right">{dictionary.table.quantity}</TableHead>
                    <TableHead className="text-right">{dictionary.table.price}</TableHead>
                    <TableHead className="text-right">{dictionary.table.serviceCost}</TableHead>
                    <TableHead className="text-right">{dictionary.table.totalValue}</TableHead>
                     <TableHead className={cn("text-right", !showAdminFeatures && "hidden")}>
                        <span className="sr-only">{dictionary.table.actions}</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={showAdminFeatures ? 8 : 7} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : wasteLog.length > 0 ? (
                    wasteLog.map((entry) => {
                      const totalValue = (entry.price || 0) * entry.quantity - (entry.serviceCost || 0);
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            {formatDate(entry.date)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dictionary.types[entry.type]}</Badge>
                          </TableCell>
                          <TableCell>{entry.materialName || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            {entry.quantity.toFixed(2)} kg
                          </TableCell>
                           <TableCell className="text-right">
                            {formatCurrency(entry.price)}
                          </TableCell>
                           <TableCell className="text-right">
                            {formatCurrency(entry.serviceCost)}
                          </TableCell>
                          <TableCell className="text-right">
                              <span className={totalValue >= 0 ? 'text-primary' : 'text-destructive'}>
                                {formatCurrency(totalValue)}
                              </span>
                          </TableCell>
                           <TableCell className={cn("text-right", !showAdminFeatures && "hidden")}>
                            <AlertDialog>
                               <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="h-8 w-8 p-0">
                                     <span className="sr-only">Open menu</span>
                                     <MoreHorizontal className="h-4 w-4" />
                                   </Button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent align="end">
                                   <DropdownMenuItem onClick={() => handleEditClick(entry)}>
                                     <Pencil className="mr-2 h-4 w-4" />
                                     {dictionary.table.edit}
                                   </DropdownMenuItem>
                                   <AlertDialogTrigger asChild>
                                     <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                       <Trash2 className="mr-2 h-4 w-4" />
                                       {dictionary.table.delete}
                                     </DropdownMenuItem>
                                   </AlertDialogTrigger>
                                 </DropdownMenuContent>
                               </DropdownMenu>
                               <AlertDialogContent>
                                 <AlertDialogHeader>
                                   <AlertDialogTitle>{dictionary?.deleteDialog?.title || "Are you sure?"}</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     {dictionary?.deleteDialog?.description || "This action cannot be undone. This will permanently delete the waste entry."}
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>{dictionary?.deleteDialog?.cancel || "Cancel"}</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                                     {dictionary?.deleteDialog?.confirm || "Delete"}
                                   </AlertDialogAction>
                                 </AlertDialogFooter>
                               </AlertDialogContent>
                             </AlertDialog>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={showAdminFeatures ? 8 : 7} className="h-24 text-center">
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
        onEntrySaved={handleEntrySaved}
        entryToEdit={selectedEntry}
      />
    </>
  );
}

    