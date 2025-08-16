
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { Dictionary } from '@/lib/get-dictionary';
import type { AccountType, UserProfile } from '@/lib/types';
import { addCompany } from '@/services/waste-data-service';

const welcomeFormSchema = (dictionary: any) =>
  z.object({
    accountType: z.enum(['individual', 'company'], {
      required_error: dictionary.validation.accountType,
    }),
    companyName: z.string().optional(),
    taxId: z.string().optional(),
    idNumber: z.string().optional(),
  }).refine(
    (data) => {
      if (data.accountType === 'company') {
        return !!data.companyName && data.companyName.length >= 2;
      }
      return true;
    },
    {
      message: dictionary.validation.companyName,
      path: ['companyName'],
    }
  ).refine(
    (data) => {
      if (data.accountType === 'company') {
        return !!data.taxId;
      }
      return true;
    },
    {
      message: dictionary.validation.taxId,
      path: ['taxId'],
    }
  ).refine(
    (data) => {
      if (data.accountType === 'individual') {
        return !!data.idNumber;
      }
      return true;
    },
    {
      message: dictionary.validation.idNumber,
      path: ['idNumber'],
    }
  );

export function WelcomeClient({ dictionary }: { dictionary: Dictionary['welcomePage'] }) {
  const { user, userProfile, updateProfile, refreshUserProfile, lang } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(welcomeFormSchema(dictionary)),
    defaultValues: {
      accountType: undefined,
      companyName: '',
      taxId: '',
      idNumber: '',
    },
  });

  const accountType = form.watch('accountType');

  const onSubmit = async (data: z.infer<ReturnType<typeof welcomeFormSchema>>) => {
    if (!user) return;
    
    try {
      let profileUpdate: Partial<UserProfile> = {
        accountType: data.accountType as AccountType,
        idNumber: data.idNumber || '',
        companyName: data.companyName || '',
        taxId: data.taxId || '',
      };

      // If it's a new company account, create the company first
      if (data.accountType === 'company' && data.companyName) {
        const newCompany = await addCompany(data.companyName, user.uid, user.uid);
        profileUpdate.assignedCompanyId = newCompany.id;
      }

      await updateProfile(profileUpdate);
      
      // Refresh the user profile and company context BEFORE redirecting
      await refreshUserProfile();
      
      toast({ title: dictionary.toastSuccess });
      router.push(`/${lang}`);
    } catch (error) {
      toast({ title: dictionary.toastError, variant: 'destructive' });
      console.error(error);
    }
  };

  if (!userProfile) {
    return <Loader2 className="h-8 w-8 animate-spin" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {dictionary.title.replace('{name}', userProfile.fullName || 'User')}
          </CardTitle>
          <CardDescription>{dictionary.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Controller
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <div>
                  <Label className="mb-2 block">{dictionary.accountTypeLabel}</Label>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem value="individual" id="individual" className="peer sr-only" />
                      <Label
                        htmlFor="individual"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {dictionary.accountTypeIndividual}
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="company" id="company" className="peer sr-only" />
                       <Label
                        htmlFor="company"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {dictionary.accountTypeCompany}
                      </Label>
                    </div>
                  </RadioGroup>
                  {form.formState.errors.accountType && (
                    <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.accountType.message}</p>
                  )}
                </div>
              )}
            />

            {accountType === 'company' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">{dictionary.companyNameLabel}</Label>
                  <Input id="companyName" placeholder={dictionary.companyNamePlaceholder} {...form.register('companyName')} />
                   {form.formState.errors.companyName && (
                    <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.companyName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="taxId">{dictionary.taxIdLabel}</Label>
                  <Input id="taxId" placeholder={dictionary.taxIdPlaceholder} {...form.register('taxId')} />
                   {form.formState.errors.taxId && (
                    <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.taxId.message}</p>
                  )}
                </div>
              </div>
            )}

            {accountType === 'individual' && (
              <div>
                <Label htmlFor="idNumber">{dictionary.idNumberLabel}</Label>
                <Input id="idNumber" placeholder={dictionary.idNumberPlaceholder} {...form.register('idNumber')} />
                {form.formState.errors.idNumber && (
                    <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.idNumber.message}</p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dictionary.finishButton}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
