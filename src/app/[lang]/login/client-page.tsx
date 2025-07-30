
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const loginFormSchema = (dictionary: Dictionary["loginPage"]["validation"]) => z.object({
  email: z.string().email({ message: dictionary.email }),
  password: z.string().min(1, { message: dictionary.password }),
});

const signUpFormSchema = (dictionary: Dictionary["loginPage"]["validation"]) => z.object({
  fullName: z.string().min(2, dictionary.fullName),
  accountType: z.enum(["company", "individual"], { required_error: dictionary.accountType }),
  companyName: z.string().optional(),
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
    if (data.accountType === 'company') return !!data.companyName && data.companyName.length >= 2;
    return true;
}, {
    message: dictionary.companyName,
    path: ["companyName"],
}).refine(data => {
    if (data.accountType === 'individual') return !!data.idNumber;
    return true;
}, {
    message: dictionary.idNumber,
    path: ["idNumber"],
});

const signUpDefaultValues = {
  fullName: "",
  accountType: undefined,
  companyName: "",
  taxId: "",
  idNumber: "",
  jobTitle: "",
  address: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  password: "",
  terms: false,
};

const loginDefaultValues = {
  email: "",
  password: "",
};


function LoginPageContent({ dictionary }: { dictionary: Dictionary["loginPage"] }) {
  const { login, signUp, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang;
  const [isClient, setIsClient] = useState(false);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const validationDictionary = dictionary.validation;
  
  const currentSchema = useMemo(() => {
    return isSignUp ? signUpFormSchema(validationDictionary) : loginFormSchema(validationDictionary);
  }, [isSignUp, validationDictionary]);

  const form = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: isSignUp ? signUpDefaultValues : loginDefaultValues
  });
  
  const accountType = form.watch("accountType");

  const toggleForm = useCallback(() => {
    const newIsSignUp = !isSignUp;
    setIsSignUp(newIsSignUp);
    setError('');
    form.reset(newIsSignUp ? signUpDefaultValues : loginDefaultValues, {
      keepValues: false,
      keepErrors: false,
      keepDirty: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });
  }, [isSignUp, form]);


  useEffect(() => {
    setIsClient(true);
  }, []);

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
            companyName: data.companyName,
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
  
  if (!isClient || isAuthLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isSignUp ? (
                    <div className="space-y-4">
                      <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{dictionary.labels.fullName}</FormLabel>
                                  <FormControl>
                                      <Input {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name="accountType"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{dictionary.labels.accountType}</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder={dictionary.labels.selectAccountType} />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          <SelectItem value="individual">{dictionary.labels.individual}</SelectItem>
                                          <SelectItem value="company">{dictionary.labels.company}</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                     
                      <div className={cn("space-y-4", accountType !== 'company' && "hidden")}>
                         <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.labels.companyName}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="taxId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.labels.taxId}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>

                      <div className={cn(accountType !== 'individual' && "hidden")}>
                         <FormField
                            control={form.control}
                            name="idNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{dictionary.labels.idNumber}</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isSubmitting} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>

                       <FormField
                          control={form.control}
                          name="jobTitle"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{dictionary.labels.jobTitle}</FormLabel>
                                  <FormControl>
                                      <Input {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                       <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{dictionary.labels.address}</FormLabel>
                                  <FormControl>
                                      <Input {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                       <div className="grid grid-cols-2 gap-4">
                           <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{dictionary.labels.city}</FormLabel>
                                      <FormControl>
                                          <Input {...field} disabled={isSubmitting} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                           <FormField
                              control={form.control}
                              name="country"
                              render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>{dictionary.labels.country}</FormLabel>
                                      <FormControl>
                                          <Input {...field} disabled={isSubmitting} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                      </div>
                       <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>{dictionary.labels.phone}</FormLabel>
                                  <FormControl>
                                      <Input type="tel" {...field} disabled={isSubmitting} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                    </div>
                ) : null}

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{dictionary.email}</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="name@example.com" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                             <div className="flex items-center">
                                <FormLabel>{dictionary.password}</FormLabel>
                                {!isSignUp && (
                                     <Link
                                        href="#"
                                        className="ml-auto inline-block text-sm underline"
                                     >
                                        {dictionary.forgotPassword}
                                     </Link>
                                )}
                            </div>
                            <FormControl>
                                <Input type="password" {...field} disabled={isSubmitting} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isSignUp && (
                  <FormField
                      control={form.control}
                      name="terms"
                      render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md py-2">
                              <FormControl>
                                  <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      disabled={isSubmitting}
                                  />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                  <FormLabel>
                                      {dictionary.labels.acceptTerms}{" "}
                                      <Link href="#" className="underline">{dictionary.labels.termsAndConditions}</Link>.
                                  </FormLabel>
                                   <FormMessage />
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
            </form>
          </Form>
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

    