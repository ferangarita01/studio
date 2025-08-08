
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
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";


const formSchema = (dictionary: Dictionary["logPage"]["addWasteDialog"]["validation"]) => z.object({
    date: z.date({
        required_error: "A date is required.", // This message can be translated if needed
    }),
    materialId: z.string({
        required_error: dictionary?.material?.required || "Please select a material.",
    }),
    quantity: z.coerce.number().min(0.1, { message: dictionary?.quantity?.min || "Quantity must be greater than 0." }),
    serviceCost: z.coerce.number().min(0, { message: dictionary?.serviceCost?.min || "Service cost cannot be negative." }),
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
      date: new Date(),
      materialId: undefined,
      quantity: 0,
      serviceCost: 0,
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
            date: entryToEdit.date,
            materialId: entryToEdit.materialId,
            quantity: entryToEdit.quantity,
            serviceCost: entryToEdit.serviceCost || 0,
        });
      } else {
        form.reset({
            date: new Date(),
            materialId: undefined,
            quantity: 0,
            serviceCost: 0,
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
        
        const entryData = {
            companyId: selectedCompany.id,
            type: selectedMaterial.type,
            materialId: selectedMaterial.id,
            materialName: selectedMaterial.name,
            quantity: values.quantity,
            date: values.date,
            price,
            serviceCost: values.serviceCost,
        }

        if (isEditMode) {
            const updatedEntry = { ...entryToEdit!, ...entryData };
            await updateWasteEntry(updatedEntry, user.uid);
            onEntrySaved(updatedEntry);
            toast({
                title: dictionary.toast.update.title,
                description: dictionary.toast.update.description,
            });
        } else {
            const newEntry = await addWasteEntry(entryData, user.uid);
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
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.date.label}</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>{dictionary.date.placeholder}</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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
                            <FormLabel>{dictionary.quantity.label}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder={dictionary.quantity.placeholder}
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="serviceCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.serviceCost.label}</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder={dictionary.serviceCost.placeholder}
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

    