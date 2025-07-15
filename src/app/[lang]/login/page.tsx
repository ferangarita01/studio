
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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


export default function LoginPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const { login } = useAuth();
  const router = useRouter();
  const dictionary = useDictionaries()?.loginPage;

  const handleLogin = (e: React.FormEvent, role: "admin" | "client") => {
    e.preventDefault();
    login(role);
    router.push(`/${lang}`);
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
                <Input id="password" type="password" required />
              </div>
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
