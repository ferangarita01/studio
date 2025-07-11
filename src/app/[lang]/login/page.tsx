import Link from "next/link";
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
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";

export default async function LoginPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = (await getDictionary(lang)).loginPage;

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
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">{dictionary.email}</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
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
            <Button type="submit" className="w-full" asChild>
                <Link href={`/${lang}`}>{dictionary.loginButton}</Link>
            </Button>
            <Button variant="outline" className="w-full">
              {dictionary.loginWithGoogle}
            </Button>
          </div>
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
