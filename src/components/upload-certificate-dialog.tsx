

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
import { getCompanies, addDisposalCertificate } from '@/services/waste-data-service';
import type { Company, DisposalCertificate } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from 'lucide-react';
import { useCompany } from './layout/app-shell';

type UploadDialogDictionary = Dictionary["reportsPage"]["finalDisposal"]["uploadDialog"];

const getFormSchema = (dictionary: UploadDialogDictionary) => z.object({
  companyId: z.string().min(1, { message: dictionary.validation.company }),
  fileUrl: z.string().url({ message: dictionary.validation.fileUrl }),
  fileName: z.string().min(1, { message: dictionary.validation.fileName }),
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
  const { user, role } = useAuth();
  const { selectedCompany } = useCompany();
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const formSchema = React.useMemo(() => getFormSchema(dictionary), [dictionary]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyId: "",
      fileUrl: "",
      fileName: "",
    },
  });
  
  React.useEffect(() => {
    if (open && user) {
      if (role === 'admin') {
        const fetchCompanies = async () => {
          const fetchedCompanies = await getCompanies(user.uid, true);
          setCompanies(fetchedCompanies);
        };
        fetchCompanies();
      }
      // Set the company from context if it exists
      if (selectedCompany) {
        form.setValue('companyId', selectedCompany.id);
      }
    }
  }, [open, user, role, selectedCompany, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
        const newCertificate = await addDisposalCertificate(
            values.companyId,
            values.fileName,
            values.fileUrl,
            user.uid
        );
        
        onCertificateAdded(newCertificate);
        toast({
            title: dictionary.toast.success.title,
            description: dictionary.toast.success.description,
        });
        onOpenChange(false);
    } catch (dbError) {
        console.error("Failed to save certificate record:", dbError);
        toast({
        title: dictionary.toast.error.title,
        description: "Failed to save the certificate link. Please try again.",
        variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        form.reset({ companyId: "", fileUrl: "", fileName: "" });
    }
    onOpenChange(isOpen);
  };

  if (!dictionary) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
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
                    <Select onValueChange={field.onChange} value={field.value} disabled={role === 'client'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={dictionary.companyPlaceholder} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {role === 'admin' ? (
                          companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))
                        ) : selectedCompany ? (
                           <SelectItem value={selectedCompany.id}>
                              {selectedCompany.name}
                            </SelectItem>
                        ): null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="fileName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{dictionary.fileNameLabel}</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder={dictionary.fileNamePlaceholder}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
               />
               <FormField
                control={form.control}
                name="fileUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{dictionary.fileUrlLabel}</FormLabel>
                        <FormControl>
                            <Input 
                                placeholder={dictionary.fileUrlPlaceholder}
                                {...field}
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
