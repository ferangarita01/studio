
"use client";

import { useEffect, useState, useCallback } from "react";
import { MoreHorizontal, PlusCircle, Loader2 } from "lucide-react";
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
import type { Dictionary } from "@/lib/get-dictionary";
import type { Material } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaterialDialog } from "@/components/material-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getMaterials, addMaterial, updateMaterial, deleteMaterial } from "@/services/waste-data-service";
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
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";


interface MaterialsClientProps {
  dictionary: Dictionary["materialsPage"];
}

export function MaterialsClient({ dictionary }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { toast } = useToast();
  const { user, role, isLoading: isAuthLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const fetchMaterials = async () => {
        setIsLoading(true);
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
        setIsLoading(false);
    };
    fetchMaterials();
  }, []);

  const handleAdd = () => {
    setSelectedMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  const handleDelete = async (materialId: string) => {
    if (!user) return;
    try {
      await deleteMaterial(materialId, user.uid);
      setMaterials(materials.filter(m => m.id !== materialId));
      toast({
        title: dictionary.toast.delete.title,
        description: dictionary.toast.delete.description,
      });
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || "Failed to delete material.",
        variant: "destructive"
      });
    }
  };
  
  const handleSave = useCallback(async (materialData: Material) => {
    if (!user) return;
    try {
      if (materialData.id) { // Editing existing material
        await updateMaterial(materialData, user.uid);
        setMaterials(materials.map(m => m.id === materialData.id ? materialData : m));
      } else { // Adding new material
        const newMaterial = await addMaterial(materialData, user.uid);
        setMaterials(currentMaterials => [...currentMaterials, newMaterial].sort((a,b) => a.name.localeCompare(b.name)));
      }
      toast({
        title: dictionary.toast.save.title,
        description: dictionary.toast.save.description,
      });
      setDialogOpen(false);
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || "Failed to save material.",
        variant: "destructive"
      });
    }
  }, [materials, toast, dictionary, user]);

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return '';
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const showAdminFeatures = isClient && !isAuthLoading && role === 'admin';

  if (!dictionary) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
           <div className={cn("ml-auto flex items-center gap-2", !showAdminFeatures && "hidden")}>
              <Button size="sm" className="h-8 gap-1" onClick={handleAdd}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {dictionary.addMaterial}
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
                    <TableHead>{dictionary.table.name}</TableHead>
                    <TableHead>{dictionary.table.type}</TableHead>
                    <TableHead className="text-right">{dictionary.table.pricePerKg}</TableHead>
                    <TableHead className="text-right">{dictionary.table.serviceCostPerKg}</TableHead>
                    <TableHead className={cn("w-[50px]", !showAdminFeatures && "hidden")}><span className="sr-only">{dictionary.table.actions}</span></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                     <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                         <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : materials.length > 0 ? (
                    materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{dictionary.types[material.type]}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           {formatCurrency(material.pricePerKg)}
                        </TableCell>
                        <TableCell className="text-right">
                           {formatCurrency(material.serviceCostPerKg)}
                        </TableCell>
                        <TableCell className={cn(!showAdminFeatures && "hidden")}>
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">{dictionary.table.openMenu}</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(material)}>{dictionary.table.edit}</DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    {dictionary.table.delete}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                              </DropdownMenuContent>
                            </DropdownMenu>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{dictionary.deleteDialog.title}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {dictionary.deleteDialog.description}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{dictionary.deleteDialog.cancel}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(material.id)}>{dictionary.deleteDialog.confirm}</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {dictionary.noMaterials}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <MaterialDialog
        open={isDialogOpen}
        onOpenChange={setDialogOpen}
        dictionary={dictionary.materialDialog}
        onSave={handleSave}
        material={selectedMaterial}
      />
    </>
  );
}
