
"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
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
import { useAuth } from "@/context/auth-context";
import { useDictionaries } from "@/context/dictionary-context";
import type { Locale } from "@/i18n-config";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { FirebaseError } from "firebase/app";

export default function LoginPage() {
  const { login, signUp } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as Locale;
  const dictionary = useDictionaries()?.loginPage;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await login(email, password);
      }
      router.push(`/${lang}`);
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

  if (!dictionary) {
    return <div>Loading translations...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{isSignUp ? dictionary.signUp : dictionary.title}</CardTitle>
          <CardDescription>
            {isSignUp ? dictionary.signUpDescription : dictionary.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{dictionary.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
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
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
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
            <Button variant="link" className="p-0 h-auto" onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
                {isSignUp ? dictionary.loginButton : dictionary.signUp}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
