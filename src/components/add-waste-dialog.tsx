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
import { addWasteEntry } from "@/services/waste-data-service";
import type { WasteEntry, WasteType } from "@/lib/types";
import { useCompany } from "./layout/app-shell";

const formSchema = (dictionary: Dictionary["logPage"]["addWasteDialog"]["validation"]) => z.object({
    type: z.enum(["Recycling", "Organic", "General", "Hazardous"], {
        required_error: dictionary.type.required,
    }),
    quantity: z.coerce.number().min(0.1, { message: dictionary.quantity.min }),
});

type FormSchema = z.infer<ReturnType<typeof formSchema>>;

interface AddWasteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    dictionary: Dictionary["logPage"]["addWasteDialog"];
    onEntryAdded: (newEntry: WasteEntry) => void;
}

export function AddWasteDialog({ open, onOpenChange, dictionary, onEntryAdded }: AddWasteDialogProps) {
  const { toast } = useToast();
  const { selectedCompany } = useCompany();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues: {
      type: undefined,
      quantity: 0,
    },
  });

  const onSubmit = async (values: FormSchema) => {
    try {
        const newEntryData = {
            companyId: selectedCompany.id,
            type: values.type as WasteType,
            quantity: values.quantity,
            date: new Date(),
        }
        const newEntry = await addWasteEntry(newEntryData);
        onEntryAdded(newEntry);
        toast({
            title: dictionary.toast.title,
            description: dictionary.toast.description,
        });
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to add waste entry:", error);
         toast({
            title: "Error",
            description: "Failed to add waste entry. Please try again.",
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
                <DialogTitle>{dictionary.title}</DialogTitle>
                <DialogDescription>
                    {dictionary.description}
                </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{dictionary.wasteType}</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={dictionary.selectType} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Recycling">{dictionary.types.Recycling}</SelectItem>
                                <SelectItem value="Organic">{dictionary.types.Organic}</SelectItem>
                                <SelectItem value="General">{dictionary.types.General}</SelectItem>
                                <SelectItem value="Hazardous">{dictionary.types.Hazardous}</SelectItem>
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
                    <Button type="submit">{dictionary.save}</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
