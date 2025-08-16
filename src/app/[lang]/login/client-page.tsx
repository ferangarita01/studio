
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { DictionariesProvider } from "@/context/dictionary-context";
import { AuthProvider } from "@/context/auth-context";
import type { Dictionary } from "@/lib/get-dictionary";
import { PasswordResetDialog } from "@/components/password-reset-dialog";
import { cn } from "@/lib/utils";
import { signInWithGoogleRedirect } from "@/lib/firebase";
import { Checkbox } from "@/components/ui/checkbox";

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.651-3.657-11.303-8.591l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.417,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const createLoginSchema = (dictionary: Dictionary["loginPage"]["validation"]) => {
  return z.object({
    email: z.string()
      .min(1, { message: dictionary.email })
      .email({ message: dictionary.email }),
    password: z.string()
      .min(1, { message: dictionary.password }),
  });
};

const createSignUpSchema = (dictionary: Dictionary["loginPage"]["validation"]) => {
  return z.object({
    fullName: z.string()
      .min(2, { message: dictionary.fullName }),
    email: z.string()
      .min(1, { message: dictionary.email })
      .email({ message: dictionary.email }),
    password: z.string()
      .min(6, { message: dictionary.password }),
    terms: z.boolean()
      .refine(val => val === true, {
        message: dictionary.terms,
      }),
  });
};

type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
type SignUpFormData = z.infer<ReturnType<typeof createSignUpSchema>>;

function LoginPageContent({ dictionary }: { dictionary: Dictionary["loginPage"] }) {
  const { login, signUp, signInWithGoogle, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang;
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPasswordOpen, setResetPasswordOpen] = useState(false);
  const validationDictionary = dictionary.validation; 

  const loginSchema = useMemo(() => createLoginSchema(validationDictionary), [validationDictionary]);
  const signUpSchema = useMemo(() => createSignUpSchema(validationDictionary), [validationDictionary]);

  const signUpDefaultValues: SignUpFormData = {
    fullName: "",
    email: "",
    password: "",
    terms: false,
  };

  const loginDefaultValues: LoginFormData = {
    email: "",
    password: "",
  };

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: loginDefaultValues
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: signUpDefaultValues
  });

  const toggleForm = useCallback(() => {
    const newIsSignUp = !isSignUp;
    setIsSignUp(newIsSignUp);
    setError('');
    loginForm.reset();
    signUpForm.reset();
  }, [isSignUp, loginForm, signUpForm]);

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
        await signInWithGoogle();
    } catch(err: any) {
        if (err.code === 'auth/popup-blocked') {
            await signInWithGoogleRedirect();
        } else {
            const message = err.message || "An unexpected error occurred.";
            setError(message.replace('Firebase: ','').replace('Error ', ''));
        }
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleLoginSubmit = async (data: LoginFormData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
    } catch (err: any) {
      const message = err.message || "An unexpected error occurred.";
      setError(message.replace('Firebase: ','').replace('Error ', ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (data: SignUpFormData) => {
    setError("");
    setIsSubmitting(true);
    try {
      await signUp(data.email, data.password, { fullName: data.fullName });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
         setError(dictionary.validation.emailInUse);
      } else {
        const message = err.message || "An unexpected error occurred.";
        setError(message.replace('Firebase: ','').replace('Error ', ''));
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isAuthLoading || (isAuthenticated && !window.location.pathname.includes('/welcome'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  
  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-background p-4 relative">
         <Link href={`/${lang}/landing`} passHref>
            <Button variant="ghost" className="absolute top-4 left-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {dictionary.backButton}
            </Button>
         </Link>
        <Card className="mx-auto w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">{isSignUp ? dictionary.signUp : dictionary.title}</CardTitle>
            <CardDescription>
              {isSignUp ? dictionary.signUpDescription : dictionary.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" onClick={handleGoogleSignIn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <GoogleIcon className="mr-2" />
                  )}
                  {dictionary.loginWithGoogle}
                </Button>
            </div>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    {dictionary.orContinueWith}
                    </span>
                </div>
            </div>

            {isSignUp ? (
              /* SignUp Form */
              <Form {...signUpForm}>
                <form onSubmit={signUpForm.handleSubmit(handleSignUpSubmit)} className="space-y-4">
                   <FormField
                    control={signUpForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder={dictionary.labels.fullName} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" placeholder={dictionary.email} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={signUpForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="password" placeholder={dictionary.password} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signUpForm.control}
                    name="terms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                           <FormLabel className="text-xs text-muted-foreground">
                            {dictionary.labels.acceptTerms}{" "}
                            <Link href="#" className="underline">{dictionary.labels.termsAndConditions}</Link>.
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Action Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {dictionary.signUp}
                  </Button>
                </form>
              </Form>
            ) : (
              /* Login Form */
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="email" placeholder={dictionary.email} {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                         <div className="relative">
                            <FormControl>
                              <Input type="password" placeholder={dictionary.password} {...field} disabled={isSubmitting} />
                            </FormControl>
                            <div className="absolute -top-3 right-0">
                                <Button 
                                type="button" 
                                variant="link" 
                                size="sm" 
                                className="h-auto p-0 text-xs" 
                                onClick={() => setResetPasswordOpen(true)}
                                >
                                {dictionary.forgotPassword}
                                </Button>
                            </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Action Failed</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {dictionary.loginButton}
                  </Button>
                </form>
              </Form>
            )}

            <div className="mt-4 text-center text-sm">
              {isSignUp ? dictionary.hasAccount : dictionary.noAccount}{" "}
              <Button variant="link" className="p-0 h-auto" onClick={toggleForm}>
                  {isSignUp ? dictionary.loginButton : dictionary.signUp}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <PasswordResetDialog
        dictionary={dictionary}
        isOpen={isResetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
   </>
  );
}

export function LoginClient({ dictionary }: { dictionary: Dictionary }) {
  return (
    <ThemeProvider attribute="class"
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

    