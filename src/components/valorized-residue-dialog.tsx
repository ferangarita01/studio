"use client";

import { useState, useMemo } from "react";
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

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";

import type { Dictionary } from "@/lib/get-dictionary";
import type { ValorizedResidue, EmissionFactor } from "@/lib/types";
import { addValorizedResidue } from "@/services/waste-data-service";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// -----------------------------
// ✅ Schema constructor
// -----------------------------
const formSchema = (dictionary: Dictionary["valorizedResidueDialog"]) =>
  z.object({
    date: z.date({
      required_error: dictionary.validation.date,
    }),
    factorId: z.string().min(1, { message: dictionary.validation.material }),
    quantity: z.coerce
      .number()
      .min(0.01, { message: dictionary.validation.quantity }),
  });

type FormSchema = z.infer<ReturnType<typeof formSchema>>;

// -----------------------------
// ✅ Props
// -----------------------------
interface ValorizedResidueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["valorizedResidueDialog"];
  emissionFactors: EmissionFactor[];
  onResidueAdded: (residue: ValorizedResidue) => void;
}

// -----------------------------
// ✅ Component
// -----------------------------
export function ValorizedResidueDialog({
  open,
  onOpenChange,
  dictionary,
  emissionFactors,
  onResidueAdded,
}: ValorizedResidueDialogProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema(dictionary)), // 👈 usamos dictionary completo
    defaultValues: {
      date: new Date(),
      quantity: 0,
    },
  });

  const selectedFactorId = form.watch("factorId");
  const quantity = form.watch("quantity");

  // 🔥 Calculamos emisiones evitadas
  const calculatedEmissions = useMemo(() => {
    const factor = emissionFactors.find((f) => f.id === selectedFactorId);
    if (factor && quantity > 0) {
      return quantity * factor.factor;
    }
    return 0;
  }, [selectedFactorId, quantity, emissionFactors]);

  // -----------------------------
  // ✅ Submit Handler
  // -----------------------------
  const onSubmit = async (values: FormSchema) => {
    if (!user) return;

    const selectedFactor = emissionFactors.find((f) => f.id === values.factorId);
    if (!selectedFactor) return;

    setIsLoading(true);
    try {
      const newResidueData = {
        userId: user.uid,
        type: selectedFactor.subcategory,
        quantity: values.quantity,
        unit: selectedFactor.unit.split("/")[1] || "unit", // ej: kg de "kg CO2e/kg"
        date: values.date,
        emissionsAvoided: calculatedEmissions,
      };

      const newEntry = await addValorizedResidue(user.uid, newResidueData);
      onResidueAdded(newEntry);

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add valorized residue:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------
  // ✅ Cerrar y limpiar
  // -----------------------------
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  // -----------------------------
  // ✅ UI
  // -----------------------------
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{dictionary.title}</DialogTitle>
              <DialogDescription>{dictionary.description}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* 📅 Fecha */}
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

              {/* 🏷 Material */}
              <FormField
                control={form.control}
                name="factorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.material.label}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={dictionary.material.placeholder}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emissionFactors
                          .filter(
                            (f) =>
                              f.category === "Residuos" ||
                              f.category === "Materiales"
                          )
                          .map((factor) => (
                            <SelectItem key={factor.id} value={factor.id}>
                              {factor.subcategory} ({factor.region})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🔢 Cantidad */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.quantity.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={dictionary.quantity.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 🌱 Resultado */}
              {calculatedEmissions > 0 && (
                <div className="rounded-lg border bg-emerald-50 border-emerald-200 p-4 text-center">
                  <p className="text-sm font-medium text-emerald-800">
                    {dictionary.emissionsResult}
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {calculatedEmissions.toFixed(2)} kg CO2e
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                {dictionary.cancel}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {dictionary.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
