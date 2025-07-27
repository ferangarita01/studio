
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, AuthProvider } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { FirebaseError } from "firebase/app";
import type { Dictionary } from "@/lib/get-dictionary";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DictionariesProvider } from "@/context/dictionary-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserProfile } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = (dictionary: Dictionary["loginPage"]["validation"]) => z.object({
  fullName: z.string().min(2, dictionary.fullName),
  accountType: z.enum(["company", "individual"], { required_error: dictionary.accountType }),
  taxId: z.string().optional(),
  idNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: dictionary.email }),
  password: z.string().min(6, { message: dictionary.password }),
  terms: z.boolean().refine(val => val === true, {
    message: dictionary.terms,
  }),
}).refine(data => {
    if (data.accountType === 'company') return !!data.taxId;
    return true;
}, {
    message: dictionary.taxId,
    path: ["taxId"],
}).refine(data => {
    if (data.accountType === 'individual') return !!data.idNumber;
    return true;
}, {
    message: dictionary.idNumber,
    path: ["idNumber"],
});

type LoginSchema = z.infer<typeof loginSchema>;
type SignUpSchema = z.infer<ReturnType<typeof signUpSchema>>;


function LoginPageContent({ dictionary }: { dictionary: Dictionary["loginPage"] }) {
  const { login, signUp, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang;

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const validationDictionary = dictionary.validation;

  const currentSchema = useMemo(() => {
    return isSignUp ? signUpSchema(validationDictionary) : loginSchema;
  }, [isSignUp, validationDictionary]);


  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    reset,
  } = useForm<SignUpSchema>({
    resolver: zodResolver(currentSchema),
  });
  
  const accountType = watch("accountType");

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      router.push(`/${lang}`);
    }
  }, [isAuthLoading, isAuthenticated, router, lang]);


  const onSubmit = async (data: any) => {
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const profileData: Omit<UserProfile, 'id' | 'role' | 'email'> = {
            fullName: data.fullName,
            accountType: data.accountType,
            taxId: data.taxId,
            idNumber: data.idNumber,
            jobTitle: data.jobTitle,
            address: data.address,
            city: data.city,
            country: data.country,
            phone: data.phone,
        };
        await signUp(data.email, data.password, profileData);
      } else {
        await login(data.email, data.password);
      }
      // Successful login/signup will trigger the useEffect above to redirect
    } catch (err: any) {
      console.error(err);
      if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
         setError("This email address is already in use. Try logging in instead.");
      } else {
        const message = err.message || "An unexpected error occurred.";
        setError(message.replace('Firebase: ','').replace('Error', ''));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setError('');
    reset();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
       <Button asChild variant="outline" className="absolute top-4 left-4">
        <Link href={`/${lang}/landing`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {dictionary.backButton}
        </Link>
      </Button>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? dictionary.signUp : dictionary.title}</CardTitle>
          <CardDescription>
            {isSignUp ? dictionary.signUpDescription : dictionary.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4">
              {isSignUp && (
                 <>
                    <div className="grid gap-2">
                        <Label htmlFor="fullName">{dictionary.labels.fullName}</Label>
                        <Input id="fullName" {...register("fullName")} disabled={isSubmitting} />
                        {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="accountType">{dictionary.labels.accountType}</Label>
                      <Controller
                        name="accountType"
                        control={control}
                        render={({ field }) => (
                           <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                              <SelectTrigger>
                                <SelectValue placeholder={dictionary.labels.selectAccountType} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="individual">{dictionary.labels.individual}</SelectItem>
                                <SelectItem value="company">{dictionary.labels.company}</SelectItem>
                              </SelectContent>
                            </Select>
                        )}
                      />
                       {errors.accountType && <p className="text-sm text-destructive">{errors.accountType.message}</p>}
                    </div>
                   
                    {accountType === 'company' && (
                        <div className="grid gap-2">
                            <Label htmlFor="taxId">{dictionary.labels.taxId}</Label>
                            <Input id="taxId" {...register("taxId")} disabled={isSubmitting} />
                            {errors.taxId && <p className="text-sm text-destructive">{errors.taxId.message}</p>}
                        </div>
                    )}

                    {accountType === 'individual' && (
                        <div className="grid gap-2">
                            <Label htmlFor="idNumber">{dictionary.labels.idNumber}</Label>
                            <Input id="idNumber" {...register("idNumber")} disabled={isSubmitting} />
                            {errors.idNumber && <p className="text-sm text-destructive">{errors.idNumber.message}</p>}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="jobTitle">{dictionary.labels.jobTitle}</Label>
                        <Input id="jobTitle" {...register("jobTitle")} disabled={isSubmitting} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">{dictionary.labels.address}</Label>
                        <Input id="address" {...register("address")} disabled={isSubmitting} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="city">{dictionary.labels.city}</Label>
                            <Input id="city" {...register("city")} disabled={isSubmitting} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="country">{dictionary.labels.country}</Label>
                            <Input id="country" {...register("country")} disabled={isSubmitting} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">{dictionary.labels.phone}</Label>
                        <Input id="phone" type="tel" {...register("phone")} disabled={isSubmitting} />
                    </div>
                 </>
              )}

              <div className="grid gap-2">
                <Label htmlFor="email">{dictionary.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={isSubmitting}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{dictionary.password}</Label>
                  {!isSignUp && (
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      {dictionary.forgotPassword}
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  disabled={isSubmitting}
                />
                 {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              {isSignUp && (
                <FormField
                    control={control}
                    name="terms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    {dictionary.labels.acceptTerms}{" "}
                                    <Link href="#" className="underline">{dictionary.labels.termsAndConditions}</Link>.
                                </FormLabel>
                                 {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
                            </div>
                        </FormItem>
                    )}
                />
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Action Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? dictionary.signUp : dictionary.loginButton}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? dictionary.hasAccount : dictionary.noAccount}{" "}
            <Button variant="link" className="p-0 h-auto" onClick={toggleForm}>
                {isSignUp ? dictionary.loginButton : dictionary.signUp}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


export function LoginClient({ dictionary }: { dictionary: Dictionary }) {
  
  if (!dictionary?.loginPage?.validation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dictionary...</span>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster />
      <DictionariesProvider dictionary={dictionary}>
        <AuthProvider>
          <LoginPageContent dictionary={dictionary.loginPage} />
        </AuthProvider>
      </DictionariesProvider>
    </ThemeProvider>
  )
}
