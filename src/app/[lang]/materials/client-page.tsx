"use client";

import { useEffect, useState } from "react";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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

interface MaterialsClientProps {
  dictionary: Dictionary["materialsPage"];
  initialMaterials: Material[];
}

export function MaterialsClient({ dictionary, initialMaterials }: MaterialsClientProps) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAdd = () => {
    setSelectedMaterial(null);
    setDialogOpen(true);
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setDialogOpen(true);
  };

  const handleDelete = (materialId: string) => {
    // This is a mock implementation. In a real app, you'd call an API.
    setMaterials(materials.filter(m => m.id !== materialId));
    toast({
      title: dictionary.toast.delete.title,
      description: dictionary.toast.delete.description,
    });
  };
  
  const handleSave = (material: Material) => {
    // This is a mock implementation. In a real app, you'd call an API.
    if (selectedMaterial) {
      setMaterials(materials.map(m => m.id === material.id ? material : m));
    } else {
      const newMaterial = { ...material, id: `m${materials.length + 1}` };
      setMaterials([...materials, newMaterial]);
    }
    toast({
      title: dictionary.toast.save.title,
      description: dictionary.toast.save.description,
    });
    setDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };


  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">{dictionary.title}</h1>
           <div className="ml-auto flex items-center gap-2">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dictionary.table.name}</TableHead>
                  <TableHead>{dictionary.table.type}</TableHead>
                  <TableHead className="text-right">{dictionary.table.pricePerKg}</TableHead>
                  <TableHead className="w-[50px]"><span className="sr-only">{dictionary.table.actions}</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{dictionary.types[material.type]}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isClient ? formatCurrency(material.pricePerKg) : <Skeleton className="h-4 w-16 float-right" />}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{dictionary.table.openMenu}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(material)}>{dictionary.table.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(material.id)} className="text-destructive">{dictionary.table.delete}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      {dictionary.noMaterials}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
