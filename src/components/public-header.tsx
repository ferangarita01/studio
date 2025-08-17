
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Languages, Recycle, Globe, Sparkles } from "lucide-react";
import React, { useState, useEffect } from "react";
import type { Dictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Skeleton } from "./ui/skeleton";

function LanguageToggle({ dictionary, lang }: { dictionary: Dictionary["navigation"]["languageToggle"], lang: Locale }) {
  const pathname = usePathname();
  const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-200 ring-1 ring-white/10 hover:bg-white/5 transition h-auto">
                    <Globe className="h-4 w-4" />
                    <span>{lang.toUpperCase()}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0B1020] border-white/10 text-slate-200">
                <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href={`/en/${pathWithoutLocale}`}>English</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
                    <Link href={`/es/${pathWithoutLocale}`}>Español</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface PublicHeaderProps {
    dictionary: Dictionary;
    lang: Locale;
}

export function PublicHeader({ dictionary, lang }: PublicHeaderProps) {
    const d = dictionary.landingPage;
    const { isAuthenticated, isLoading } = useAuth();
    const [isClient, setIsClient] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 8);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const targetPath = `/${lang}/landing`;
        
        if (pathname !== targetPath) {
            router.push(`${targetPath}#${targetId}`);
        } else {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header className={cn("fixed top-0 inset-x-0 z-50 transition-all", isScrolled && 'backdrop-blur bg-[#0B1020]/70 ring-1 ring-white/10')}>
            <div className="container-responsive">
                <div className="flex h-16 items-center justify-between rounded-xl mt-2 px-3 sm:px-4">
                    <Link href={`/${lang}/landing`} className="flex items-center gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 ring-1 ring-inset ring-white/20 shadow-lg shadow-emerald-900/30">
                            <Recycle className="h-5 w-5 text-white" />
                        </span>
                        <span className="text-slate-100 text-lg font-semibold tracking-tight">{d.header.title}</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#use-cases" onClick={(e) => handleScroll(e, 'use-cases')} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Use Cases</a>
                        <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Features</a>
                        <a href="#roi" onClick={(e) => handleScroll(e, 'roi')} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">ROI</a>
                        <Link href={`/${lang}/pricing`} className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Pricing</Link>
                    </nav>
                    <div className="flex items-center gap-3">
                       <LanguageToggle dictionary={dictionary.navigation.languageToggle} lang={lang} />
                       {isLoading || !isClient ? (
                           <Skeleton className="h-9 w-40" />
                       ) : isAuthenticated ? (
                            <Button asChild className="text-sm font-medium text-slate-200 hover:text-white" variant="link">
                                <Link href={`/${lang}`}>Dashboard</Link>
                            </Button>
                       ) : (
                           <>
                             <Button asChild className="text-sm font-medium text-slate-200 hover:text-white" variant="link">
                                <Link href={`/${lang}/login`}>{d.header.login}</Link>
                            </Button>
                            <Button asChild className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/30 hover:opacity-95 transition h-auto rounded-lg">
                                <Link href={`/${lang}/landing#demo`}><Sparkles /><span>{d.header.getStarted}</span></Link>
                            </Button>
                           </>
                       )}
                    </div>
                </div>
            </div>
        </header>
    );
}
