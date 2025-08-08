"use client";

import * as React from 'react';
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
import type { Dictionary } from '@/lib/get-dictionary';
import { addDisposalCertificate, getCompanies, compressFileIfNeeded } from "@/services/waste-data-service";
import type { Company, DisposalCertificate } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from 'lucide-react';

type UploadDialogDictionary = Dictionary["reportsPage"]["finalDisposal"]["uploadDialog"];

const getFormSchema = (dictionary: UploadDialogDictionary) => z.object({
  companyId: z.string().min(1, { message: dictionary.validation.company }),
  file: z.instanceof(FileList).refine(files => files?.length === 1, {
    message: dictionary.validation.file
  }).refine(files => files?.[0]?.type === 'application/pdf', {
    message: dictionary.validation.file
  }),
});


interface UploadCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCertificateAdded: (certificate: DisposalCertificate) => void;
  dictionary: UploadDialogDictionary;
}

export function UploadCertificateDialog({
  open,
  onOpenChange,
  onCertificateAdded,
  dictionary
}: UploadCertificateDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const formSchema = getFormSchema(dictionary);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: undefined,
      file: undefined,
    },
  });
  
  React.useEffect(() => {
    if (open && user) {
      const fetchCompanies = async () => {
        const fetchedCompanies = await getCompanies(user.uid, true);
        setCompanies(fetchedCompanies);
      };
      fetchCompanies();
      form.reset();
    }
  }, [open, user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    setIsSubmitting(true);
    
    try {
      let fileToUpload = values.file[0];

      // Step 1: Compress if needed
      try {
        fileToUpload = await compressFileIfNeeded(fileToUpload);
      } catch (compressionError: any) {
        toast({
          title: "Archivo demasiado grande",
          description: compressionError.message,
          variant: "destructive",
          duration: 15000, // Show for longer
        });
        setIsSubmitting(false);
        return;
      }
      
      // Step 2: Upload the (potentially compressed) file
      const newCertificate = await addDisposalCertificate(
        values.companyId,
        fileToUpload,
        user.uid
      );
      
      onCertificateAdded(newCertificate);
      toast({
        title: dictionary.toast.success.title,
        description: dictionary.toast.success.description,
      });
      onOpenChange(false);

    } catch (error) {
      console.error("Failed to upload certificate:", error);
      toast({
        title: dictionary.toast.error.title,
        description: String(error) || dictionary.toast.error.description,
        variant: "destructive",
      });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const fileRef = form.register("file");

  if (!dictionary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{dictionary.title}</DialogTitle>
              <DialogDescription>{dictionary.description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{dictionary.companyLabel}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={dictionary.companyPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
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
                name="file"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{dictionary.fileLabel}</FormLabel>
                        <FormControl>
                            <Input 
                                type="file" 
                                accept="application/pdf"
                                {...fileRef}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
               />
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                {dictionary.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {dictionary.upload}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
