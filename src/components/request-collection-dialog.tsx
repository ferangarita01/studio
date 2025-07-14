
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Dictionary } from "@/lib/get-dictionary";
import { cn } from "@/lib/utils";
import type { DisposalEvent, WasteType } from "@/lib/types";
import { useCompany } from "./layout/app-shell";
import { addDisposalEvent } from "@/services/waste-data-service";


const formSchema = (dictionary: Dictionary["schedulePage"]["requestCollectionDialog"]["validation"]) =>
  z.object({
    wasteTypes: z.array(z.string()).refine(value => value.some(item => item), {
      message: dictionary.wasteType.required,
    }),
    date: z.date({
      required_error: dictionary.date.required,
    }),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: dictionary.time.invalid
    }),
    instructions: z.string().optional(),
    isRecurrent: z.boolean().default(false).optional(),
  });

type FormSchema = z.infer<ReturnType<typeof formSchema>>;

interface RequestCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["schedulePage"]["requestCollectionDialog"];
  onEventAdded: (event: DisposalEvent) => void;
}

export function RequestCollectionDialog({
  open,
  onOpenChange,
  dictionary,
  onEventAdded,
}: RequestCollectionDialogProps) {
  const { toast } = useToast();
  const { selectedCompany } = useCompany();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues: {
        isRecurrent: false,
        time: "09:00",
        wasteTypes: [],
    },
  });

  const onSubmit = async (values: FormSchema) => {
    const [hours, minutes] = values.time.split(':').map(Number);
    const collectionDate = new Date(values.date);
    collectionDate.setHours(hours, minutes);

    const newEventData = {
        companyId: selectedCompany.id,
        date: collectionDate,
        wasteTypes: values.wasteTypes as WasteType[],
        status: 'Scheduled' as const,
        instructions: values.instructions,
    };

    try {
        const newEvent = await addDisposalEvent(newEventData);
        onEventAdded(newEvent);
        toast({
            title: dictionary.toast.title,
            description: dictionary.toast.description,
        });
        form.reset();
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to request collection:", error);
         toast({
            title: "Error",
            description: "Failed to request collection. Please try again.",
            variant: "destructive"
        });
    }
  };

  const wasteTypes = ["General", "Recycling", "Organic", "Hazardous"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{dictionary.title}</DialogTitle>
              <DialogDescription>{dictionary.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-1">
              <FormField
                control={form.control}
                name="wasteTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">{dictionary.wasteType.label}</FormLabel>
                      <FormDescription>
                        {dictionary.wasteType.placeholder}
                      </FormDescription>
                    </div>
                    {wasteTypes.map((item) => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="wasteTypes"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {dictionary.types[item as keyof typeof dictionary.types]}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
                />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{dictionary.date.label}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
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
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
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
                    name="time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{dictionary.time.label}</FormLabel>
                            <FormControl>
                               <div className="relative">
                                     <Input type="time" {...field} />
                                     <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                               </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.instructions.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={dictionary.instructions.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isRecurrent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{dictionary.recurrent.label}</FormLabel>
                      <FormDescription>
                        {dictionary.recurrent.description}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>{dictionary.cancel}</Button>
                <Button type="submit">{dictionary.submit}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
