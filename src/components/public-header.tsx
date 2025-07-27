
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Languages, Recycle } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";

function ThemeToggle({ dictionary }: { dictionary: Dictionary["navigation"]["themeToggle"] }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{dictionary.toggle}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {dictionary.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {dictionary.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {dictionary.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle({ dictionary }: { dictionary: Dictionary["navigation"]["languageToggle"] }) {
  const pathname = usePathname()
  const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Languages className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">{dictionary.toggle}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/en/${pathWithoutLocale}`}>English</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href={`/es/${pathWithoutLocale}`}>Español</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
    }
};

interface PublicHeaderProps {
    dictionary: Dictionary;
    lang: Locale;
}

export function PublicHeader({ dictionary, lang }: PublicHeaderProps) {
    const d = dictionary.landingPage;
    const pathname = usePathname();
    const isPricingPage = pathname.includes('/pricing');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-responsive flex h-14 items-center">
                <Link href={`/${lang}/landing`} className="flex items-center gap-2 font-bold text-lg text-primary mr-auto">
                    <Recycle className="h-6 w-6" />
                    <span>{d.header.title}</span>
                </Link>
                  <nav className={cn(
                      "hidden md:flex items-center gap-4 text-sm font-medium",
                      isClient ? "opacity-100" : "opacity-0"
                    )}>
                      <Link
                          href={`/${lang}/landing#use-cases`}
                          onClick={(e) => handleScroll(e, 'use-cases')}
                          className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                      >
                          {d.header.nav.useCases}
                      </Link>
                      <Link
                          href={`/${lang}/landing#features`}
                          onClick={(e) => handleScroll(e, 'features')}
                          className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
                      >
                          {d.header.nav.features}
                      </Link>
                      <Link
                          href={`/${lang}/pricing`}
                          className={isPricingPage ? "font-semibold text-primary" : "text-muted-foreground transition-colors hover:text-foreground"}
                      >
                          {d.header.nav.pricing}
                      </Link>
                  </nav>
                <div className="flex items-center gap-2 ml-auto">
                    <LanguageToggle dictionary={dictionary.navigation.languageToggle} />
                    <ThemeToggle dictionary={dictionary.navigation.themeToggle} />
                    <div className={cn(
                        "hidden md:flex items-center gap-2",
                        isClient ? "opacity-100" : "opacity-0"
                      )}>
                      <Button asChild>
                          <Link href={`/${lang}/login`}>{d.header.login}</Link>
                      </Button>
                      <Button asChild variant="outline">
                          <Link href={`/${lang}/landing#contact`}>{d.header.getStarted}</Link>
                      </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
