
'use client';

import { useForm } from 'react-hook-form';
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
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Dictionary } from '@/lib/get-dictionary';
import type { UserProfile } from '@/lib/types';
import { useEffect } from 'react';

const profileFormSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  // Company fields are read-only for now, but can be added here if needed
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfileClient({ dictionary }: { dictionary: Dictionary['profilePage'] }) {
  const { userProfile, updateProfile, isLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        fullName: userProfile.fullName || '',
        phone: userProfile.phone || '',
        jobTitle: userProfile.jobTitle || '',
        address: userProfile.address || '',
        city: userProfile.city || '',
        country: userProfile.country || '',
      });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast({ title: dictionary.toastSuccess });
    } catch (error) {
      toast({ title: dictionary.toastError, variant: 'destructive' });
      console.error(error);
    }
  };

  if (isLoading || !userProfile) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  const isCompanyAccount = userProfile.accountType === 'company';

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="mx-auto w-full max-w-4xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{dictionary.title}</h1>
          <p className="text-muted-foreground">{dictionary.description}</p>
        </header>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{dictionary.personalInfo.title}</CardTitle>
              <CardDescription>{dictionary.personalInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">{dictionary.personalInfo.fullNameLabel}</Label>
                <Input id="fullName" {...form.register('fullName')} />
                {form.formState.errors.fullName && <p className="text-sm font-medium text-destructive">{form.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{dictionary.personalInfo.emailLabel}</Label>
                <Input id="email" type="email" value={userProfile.email} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{dictionary.personalInfo.phoneLabel}</Label>
                <Input id="phone" type="tel" {...form.register('phone')} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="jobTitle">{dictionary.personalInfo.jobTitleLabel}</Label>
                <Input id="jobTitle" {...form.register('jobTitle')} />
              </div>
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>{dictionary.companyInfo.title}</CardTitle>
              <CardDescription>{dictionary.companyInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{dictionary.companyInfo.accountTypeLabel}</Label>
                <Input value={userProfile.accountType} disabled />
              </div>
              {isCompanyAccount ? (
                <>
                  <div className="space-y-2">
                    <Label>{dictionary.companyInfo.companyNameLabel}</Label>
                    <Input value={userProfile.companyName} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>{dictionary.companyInfo.taxIdLabel}</Label>
                    <Input value={userProfile.taxId} disabled />
                  </div>
                </>
              ) : (
                 <div className="space-y-2">
                    <Label>{dictionary.companyInfo.idNumberLabel}</Label>
                    <Input value={userProfile.idNumber} disabled />
                  </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{dictionary.addressInfo.title}</CardTitle>
              <CardDescription>{dictionary.addressInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="space-y-2">
                <Label htmlFor="address">{dictionary.addressInfo.addressLabel}</Label>
                <Input id="address" {...form.register('address')} />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">{dictionary.addressInfo.cityLabel}</Label>
                    <Input id="city" {...form.register('city')} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="country">{dictionary.addressInfo.countryLabel}</Label>
                    <Input id="country" {...form.register('country')} />
                  </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dictionary.saveButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

    