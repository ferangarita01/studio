"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

type MaterialType = "Recycling" | "Organic" | "General" | "Hazardous";

interface Material {
  id?: string;
  name: string;
  type: MaterialType;
  pricePerKg: number;
  serviceCostPerKg: number;
}

// ✅ Esquema Zod
const formSchema = (validation: any) =>
  z.object({
    name: z.string().min(1, validation.required),
    type: z.enum(["Recycling", "Organic", "General", "Hazardous"], {
      errorMap: () => ({ message: validation.required }),
    }),
    pricePerKg: z.coerce.number().min(0, validation.minValue),
    serviceCostPerKg: z.coerce.number().min(0, validation.minValue),
  });

interface MaterialDialogProps {
  dictionary: any;
  onSave: (material: Material) => void;
  material?: Material;
}

export function MaterialDialog({ dictionary, onSave, material }: MaterialDialogProps) {
  const getDefaultValues = (): Material => ({
    name: "",
    type: "Recycling",
    pricePerKg: 0,
    serviceCostPerKg: 0,
  });

  const form = useForm<Material>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues: getDefaultValues(),
  });

  const [open, setOpen] = React.useState(false);

  const handleOpenChange = (state: boolean) => {
    setOpen(state);
    if (!state) {
      form.reset(getDefaultValues());
    } else if (material) {
      form.reset({
        ...getDefaultValues(),
        ...material,
      });
    }
  };

  const onSubmit = (data: Material) => {
    onSave(data);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">
          {material ? dictionary.editMaterial : dictionary.addMaterial}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {material ? dictionary.editMaterial : dictionary.addMaterial}
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
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Recycling">{dictionary.recycling}</SelectItem>
                        <SelectItem value="Organic">{dictionary.organic}</SelectItem>
                        <SelectItem value="General">{dictionary.general}</SelectItem>
                        <SelectItem value="Hazardous">{dictionary.hazardous}</SelectItem>
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
                  <FormLabel>{dictionary.pricePerKg}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value.toString()}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
                  <FormLabel>{dictionary.serviceCostPerKg}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      value={field.value.toString()}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
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
