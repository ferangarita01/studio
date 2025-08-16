"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Material, WasteType } from "@/lib/types";
import type { Dictionary } from "@/lib/get-dictionary";


// ✅ Esquema Zod
const formSchema = (validation: any) =>
  z.object({
    name: z.string().min(1, validation?.name?.min || "Name is required"),
    type: z.enum(["Recycling", "Organic", "General", "Hazardous"], {
      errorMap: () => ({ message: validation?.type?.required || "Type is required" }),
    }),
    pricePerKg: z.coerce.number().min(0, validation?.price?.min || "Price must be positive"),
    serviceCostPerKg: z.coerce.number().min(0, validation?.serviceCost?.min || "Service cost must be positive"),
  });
  

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["materialsPage"]["materialDialog"];
  onSave: (material: Omit<Material, 'id'> & { id?: string }) => void;
  material: Material | null;
}

export function MaterialDialog({ open, onOpenChange, dictionary, onSave, material }: MaterialDialogProps) {
  
  const defaultValues = React.useMemo(() => ({
    name: material?.name || "",
    type: material?.type || "Recycling",
    pricePerKg: material?.pricePerKg || 0,
    serviceCostPerKg: material?.serviceCostPerKg || 0,
  }), [material]);

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);


  const onSubmit = (data: z.infer<ReturnType<typeof formSchema>>) => {
    const dataToSave = material ? { ...data, id: material.id } : data;
    onSave(dataToSave);
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset({
            name: "",
            type: "Recycling",
            pricePerKg: 0,
            serviceCostPerKg: 0,
        });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {material ? dictionary.editTitle : dictionary.addTitle}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.name}</FormLabel>
                  <FormControl>
                    <Input placeholder={dictionary.namePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.type}</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={dictionary.selectType} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(dictionary.types).map((key) => (
                           <SelectItem key={key} value={key}>{dictionary.types[key as keyof typeof dictionary.types]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Precio por Kg */}
            <FormField
              control={form.control}
              name="pricePerKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.price}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={dictionary.pricePlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Costo de servicio por Kg */}
            <FormField
              control={form.control}
              name="serviceCostPerKg"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{dictionary.serviceCost}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={dictionary.serviceCostPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botón guardar */}
            <Button type="submit" className="w-full">
              {dictionary.save}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}