
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Dictionary } from "@/lib/get-dictionary";
import { addWasteEntry, getMaterials, updateWasteEntry } from "@/services/waste-data-service";
import type { WasteEntry, Material } from "@/lib/types";
import { useCompany } from "./layout/app-shell";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";


const formSchema = (dictionary: Dictionary["logPage"]["addWasteDialog"]["validation"]) => z.object({
    materialId: z.string({
        required_error: dictionary.material.required,
    }),
    quantity: z.coerce.number().min(0.1, { message: dictionary.quantity.min }),
});

type FormSchema = z.infer<ReturnType<typeof formSchema>>;

interface AddWasteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dictionary: Dictionary["logPage"]["addWasteDialog"];
    onEntrySaved: (savedEntry: WasteEntry) => void;
    entryToEdit: WasteEntry | null;
}

export function AddWasteDialog({ open, onOpenChange, dictionary, onEntrySaved, entryToEdit }: AddWasteDialogProps) {
  const { toast } = useToast();
  const { selectedCompany } = useCompany();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const isEditMode = !!entryToEdit;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues: {
      materialId: undefined,
      quantity: 0,
    },
  });
  
  useEffect(() => {
    if (open) {
      const fetchMaterials = async () => {
        const fetchedMaterials = await getMaterials();
        setMaterials(fetchedMaterials);
      };
      fetchMaterials();

      if (isEditMode && entryToEdit) {
        form.reset({
            materialId: entryToEdit.materialId,
            quantity: entryToEdit.quantity,
        });
      } else {
        form.reset({
            materialId: undefined,
            quantity: 0,
        });
      }
    }
  }, [open, entryToEdit, isEditMode, form]);

  const onSubmit = async (values: FormSchema) => {
    if (!selectedCompany || !user) return;
    
    const selectedMaterial = materials.find(m => m.id === values.materialId);
    if (!selectedMaterial) {
        console.error("Selected material not found");
        return;
    }

    try {
        const price = selectedMaterial.pricePerKg || 0;
        const serviceCost = (selectedMaterial.serviceCostPerKg || 0) * values.quantity;

        const entryData = {
            companyId: selectedCompany.id,
            type: selectedMaterial.type,
            materialId: selectedMaterial.id,
            materialName: selectedMaterial.name,
            quantity: values.quantity,
            date: isEditMode ? entryToEdit!.date : new Date(),
            price,
            serviceCost,
        }

        if (isEditMode) {
            const updatedEntry = { ...entryToEdit, ...entryData };
            await updateWasteEntry(updatedEntry, user.uid);
            onEntrySaved(updatedEntry);
            toast({
                title: dictionary.toast.update.title,
                description: dictionary.toast.update.description,
            });
        } else {
            const newEntry = await addWasteEntry(entryData);
            onEntrySaved(newEntry);
            toast({
                title: dictionary.toast.add.title,
                description: dictionary.toast.add.description,
            });
        }
        
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save waste entry:", error);
         toast({
            title: "Error",
            description: "Failed to save waste entry. Please try again.",
            variant: "destructive"
        });
    }
  };
  
    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            form.reset();
        }
        onOpenChange(isOpen);
    };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <DialogHeader>
                <DialogTitle>{isEditMode ? dictionary.editTitle : dictionary.title}</DialogTitle>
                <DialogDescription>
                    {dictionary.description}
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="materialId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.material.label}</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={dictionary.material.selectPlaceholder} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {materials.map((material) => (
                                    <SelectItem key={material.id} value={material.id}>
                                        {material.name}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                     <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.quantity}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder={dictionary.quantityPlaceholder}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                </div>
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{dictionary.cancel}</Button>
                    <Button type="submit">{isEditMode ? dictionary.update : dictionary.save}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
