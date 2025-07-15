
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
import { AlertCircle } from "lucide-react";


export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useParams();
  const lang = params.lang as Locale;
  const dictionary = useDictionaries()?.loginPage;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent, role: "admin" | "client") => {
    e.preventDefault();
    setError("");

    if (role === "admin") {
      if (email === "admin@demo.com" && password === "admin123") {
        login(role);
        router.push(`/${lang}`);
      } else {
        setError("Invalid admin credentials.");
      }
    } else if (role === "client") {
      if (email === "client@demo.com" && password === "client123") {
        login(role);
        router.push(`/${lang}`);
      } else {
        setError("Invalid client credentials.");
      }
    }
  };

  if (!dictionary) {
    return <div>Loading translations...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">{dictionary.title}</CardTitle>
          <CardDescription>
            {dictionary.description}
             <div className="text-xs text-muted-foreground mt-2">
                <p>Admin: admin@demo.com / admin123</p>
                <p>Client: client@demo.com / client123</p>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">{dictionary.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{dictionary.password}</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    {dictionary.forgotPassword}
                  </Link>
                </div>
                <Input 
                    id="password" 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Login Failed</AlertTitle>
                    <AlertDescription>
                        {error}
                    </AlertDescription>
                </Alert>
              )}
              <div className="flex flex-col gap-2">
                <Button onClick={(e) => handleLogin(e, 'admin')} className="w-full">
                  {dictionary.loginAsAdmin}
                </Button>
                <Button onClick={(e) => handleLogin(e, 'client')} variant="secondary" className="w-full">
                 {dictionary.loginAsClient}
                </Button>
              </div>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            {dictionary.noAccount}{" "}
            <Link href="#" className="underline">
              {dictionary.signUp}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
