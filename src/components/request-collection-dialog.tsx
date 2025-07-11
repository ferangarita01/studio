
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

const formSchema = (dictionary: Dictionary["schedulePage"]["requestCollectionDialog"]["validation"]) =>
  z.object({
    wasteType: z.string({
      required_error: dictionary.wasteType.required,
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

type FormSchema = ReturnType<typeof formSchema>;

interface RequestCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary["schedulePage"]["requestCollectionDialog"];
}

export function RequestCollectionDialog({
  open,
  onOpenChange,
  dictionary,
}: RequestCollectionDialogProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<FormSchema>>({
    resolver: zodResolver(formSchema(dictionary.validation)),
    defaultValues: {
        isRecurrent: false,
        time: "09:00",
    },
  });

  const onSubmit = (values: z.infer<FormSchema>) => {
    console.log("Collection Request:", values);
    toast({
      title: dictionary.toast.title,
      description: dictionary.toast.description,
    });
    form.reset();
    onOpenChange(false);
  };

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
                name="wasteType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.wasteType.label}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={dictionary.wasteType.placeholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General">{dictionary.types.General}</SelectItem>
                        <SelectItem value="Recycling">{dictionary.types.Recycling}</SelectItem>
                        <SelectItem value="Organic">{dictionary.types.Organic}</SelectItem>
                        <SelectItem value="Hazardous">{dictionary.types.Hazardous}</SelectItem>
                      </SelectContent>
                    </Select>
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
