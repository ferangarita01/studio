
"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, createContext, useContext, useMemo, useEffect } from "react";
import {
  BrainCircuit,
  Calendar,
  FileText,
  LayoutDashboard,
  Recycle,
  Trash2,
  Moon,
  Sun,
  Languages,
  PanelLeft,
  Building,
  ChevronsUpDown,
  PlusCircle,
  Package,
  LogOut,
  Gavel,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Company } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { CreateCompanyDialog } from "@/components/create-company-dialog";
import { useAuth, AuthProvider } from "@/context/auth-context";
import { useDictionaries, DictionariesProvider } from "@/context/dictionary-context";
import { addCompany as addCompanyService, getCompanies } from "@/services/waste-data-service";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import type { Dictionary } from "@/lib/get-dictionary";
import { ThemeProvider } from "../theme-provider";
import { Toaster } from "../ui/toaster";

const Logo = () => {
  const dictionary = useDictionaries()?.navigation;
  if (!dictionary) return null;
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
      <Recycle className="h-6 w-6" />
      <span className="text-lg">{dictionary.title}</span>
    </Link>
  );
};

const allNavItems = [
    { href: '/', icon: LayoutDashboard, labelKey: 'dashboard', roles: ['admin', 'client'] },
    { href: '/analyzer', icon: BrainCircuit, labelKey: 'analyzer', roles: ['admin'] },
    { href: '/log', icon: Trash2, labelKey: 'log', roles: ['admin', 'client'] },
    { href: '/schedule', icon: Calendar, labelKey: 'schedule', roles: ['admin', 'client'] },
    { 
      icon: FileText, 
      labelKey: 'reports', 
      roles: ['admin', 'client'],
      subItems: [
        { href: '/reports', labelKey: 'financialReports', roles: ['admin', 'client'] },
        { href: '/reports/disposal', labelKey: 'finalDisposal', roles: ['admin', 'client'] }
      ]
    },
    { href: '/materials', icon: Package, labelKey: 'materials', roles: ['admin'] },
    { href: '/compliance', icon: Gavel, labelKey: 'compliance', roles: ['admin', 'client'] },
] as const;


function ThemeToggle() {
  const { setTheme } = useTheme();
  const dictionary = useDictionaries()?.navigation.themeToggle;
  if (!dictionary) return null;

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

function LanguageToggle() {
    const pathname = usePathname()
    const pathWithoutLocale = pathname.split('/').slice(2).join('/');
    const dictionary = useDictionaries()?.navigation.languageToggle;
    if (!dictionary) return null;


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

interface CompanyContextType {
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  companies: Company[];
  addCompany: (company: Company) => void;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

function CompanySwitcher({ isClient }: { isClient: boolean }) {
  const dictionary = useDictionaries()?.navigation;
  const { role } = useAuth();
  const { companies, selectedCompany, setSelectedCompany, addCompany, isLoading } = useCompany();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  
  if (!dictionary) return null;

  const handleCreateCompany = async (name: string) => {
    const newCompany = await addCompanyService(name);
    addCompany(newCompany);
    setSelectedCompany(newCompany);
    setCreateOpen(false);
  };
  
  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }
  
  if (role === 'client') {
      if (!selectedCompany) {
         return <div className="p-2 text-sm text-center text-muted-foreground">No company assigned.</div>;
      }
      return (
         <div className="flex items-center gap-2 truncate p-2 border rounded-md bg-muted/50">
            <Building className="h-4 w-4 flex-shrink-0" />
            <span className="truncate font-medium">{selectedCompany.name}</span>
          </div>
      );
  }

  // Admin view
  if (!selectedCompany && !isLoading) {
    return (
      <div className="text-sm text-muted-foreground p-2 text-center">
        {dictionary.companySwitcher.noCompanies}
        {isClient && role === 'admin' && (
           <Button variant="link" size="sm" onClick={() => setCreateOpen(true)} className="p-1">{dictionary.companySwitcher.createOne}</Button>
        )}
         <CreateCompanyDialog
            dictionary={dictionary.createCompanyDialog}
            open={isCreateOpen}
            onOpenChange={setCreateOpen}
            onCreate={handleCreateCompany}
          />
      </div>
    );
  }

  if (!selectedCompany) {
    return <Skeleton className="h-9 w-full" />;
  }
  
  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Building className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{selectedCompany.name}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          <div className="p-2">
              <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={dictionary.companySwitcher.searchPlaceholder}
                  className="w-full"
              />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={selectedCompany.id}
            onValueChange={(id) => {
              const company = companies.find((c) => c.id === id);
              if (company) {
                setSelectedCompany(company);
                setSearch("");
              }
            }}
          >
            {filteredCompanies.map((company) => (
              <DropdownMenuRadioItem key={company.id} value={company.id}>
                {company.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          {isClient && role === 'admin' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setCreateOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {dictionary.companySwitcher.createCompany}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <CreateCompanyDialog
        dictionary={dictionary.createCompanyDialog}
        open={isCreateOpen}
        onOpenChange={setCreateOpen}
        onCreate={handleCreateCompany}
      />
    </>
  );
}

function AppShellContent({ children, lang }: { children: React.ReactNode, lang: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const { isAuthenticated, isLoading: isAuthLoading, logout, role, companyId: clientCompanyId } = useAuth();
  const dictionary = useDictionaries()?.navigation;
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated && !pathname.endsWith('/login')) {
      router.push(`/${lang}/login`);
    }
  }, [isAuthenticated, isAuthLoading, pathname, router, lang]);
  
  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      const companyIdToFetch = role === 'client' ? clientCompanyId : undefined;
      const fetchedCompanies = await getCompanies(companyIdToFetch || undefined);

      setCompanies(fetchedCompanies);

      if (fetchedCompanies.length > 0) {
         setSelectedCompany(fetchedCompanies[0]);
      } else {
        setSelectedCompany(null);
      }
      setIsLoadingCompanies(false);
    };
    if (role) {
      fetchCompanies();
    }
  }, [role, clientCompanyId]);

  const navItems = useMemo(() => {
    if (!role) return [];
    return allNavItems.filter(item => item.roles.includes(role));
  }, [role]);

  const currentPath = `/${pathname.split('/').slice(2).join('/')}`;
  const isAuthorized = navItems.some(item => 'href' in item && (item.href === '/' ? currentPath === item.href : currentPath.startsWith(item.href))) ||
    navItems.some(item => 'subItems' in item && item.subItems.some(sub => sub.href === '/' ? currentPath === sub.href : currentPath.startsWith(sub.href)));

  React.useEffect(() => {
    if (role && navItems.length > 0 && !isAuthorized) {
       router.push(`/${lang}`);
    }
  }, [isAuthorized, role, router, lang, navItems.length]);
  
  if (isAuthLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated || pathname.endsWith('/login')) {
    return <>{children}</>;
  }

  if (!dictionary) return null;
   if (role && navItems.length > 0 && !isAuthorized) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  const addCompany = (company: Company) => {
    setCompanies(prev => [...prev, company]);
  };

  const companyContextValue = useMemo(() => ({
    selectedCompany,
    setSelectedCompany: (company: Company | null) => {
      if (role === 'admin') {
        setSelectedCompany(company);
      }
    },
    companies,
    addCompany,
    isLoading: isLoadingCompanies,
  }), [selectedCompany, companies, addCompany, isLoadingCompanies, role]);

  const getHref = (href: string) => {
    if (href === '/') return `/${lang}`;
    return `/${lang}${href}`;
  }

  const NavContent = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <div className="p-2">
        <CompanySwitcher isClient={isClient} />
      </div>
      {navItems.map((item) => {
        const label = dictionary.links[item.labelKey as keyof typeof dictionary.links];
        
        if ('subItems' in item) {
          const isActive = item.subItems.some(sub => pathname.startsWith(getHref(sub.href)));
          return (
            <Collapsible key={item.labelKey} defaultOpen={isActive}>
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180">
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {label}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 py-1 pl-7">
                {item.subItems.map(subItem => {
                   if (!subItem.roles.includes(role!)) return null;
                   const subHref = getHref(subItem.href);
                   const subLabel = dictionary.links[subItem.labelKey as keyof typeof dictionary.links];
                   const isSubActive = pathname === subHref;
                   return (
                    <Link
                      key={subItem.labelKey}
                      href={subHref}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isSubActive && "bg-muted text-primary"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {subLabel}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        }

        const href = getHref(item.href);
        const isActive = pathname === href || (item.href !== '/' && pathname.startsWith(href) && item.href.length > 1);
        return (
          <Link
            key={item.labelKey}
            href={href}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              isActive && "bg-muted text-primary"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {label}
            </div>
            {isClient && role === 'admin' && item.labelKey === 'analyzer' && (
              <Badge variant="outline" className="text-xs">Beta</Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const NavSkeleton = () => (
     <div className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
        <div className="p-2">
            <Skeleton className="h-9 w-full" />
        </div>
        {[...Array(5)].map((_, i) => (
             <Skeleton key={i} className="h-10 w-full" />
        ))}
     </div>
  );
  
  return (
    <CompanyContext.Provider value={companyContextValue}>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
            </div>
            <div className="flex-1 overflow-y-auto">
              {isClient ? <NavContent /> : <NavSkeleton />}
            </div>
             <div className="mt-auto p-4">
                 <Button size="sm" variant="ghost" onClick={logout} className="w-full justify-start gap-2">
                    <LogOut className="h-4 w-4"/>
                    <span>{dictionary.logout}</span>
                  </Button>
              </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col p-0">
                 <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Logo />
                 </div>
                 <div className="flex-1 overflow-y-auto">
                    {isClient ? <NavContent /> : <NavSkeleton />}
                 </div>
                 <div className="mt-auto p-4 border-t">
                   <Button size="sm" variant="ghost" onClick={logout} className="w-full justify-start gap-2">
                      <LogOut className="h-4 w-4"/>
                      <span>{dictionary.logout}</span>
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1 md:hidden">
              <span className="font-semibold">{dictionary.title}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background/50">{children}</main>
        </div>
      </div>
      <Toaster />
    </CompanyContext.Provider>
  );
}

export function AppShell({ children, lang, dictionary }: { children: React.ReactNode, lang: string, dictionary: Dictionary }) {
   return (
    <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
    >
        <DictionariesProvider dictionary={dictionary}>
            <AuthProvider>
                <AppShellContent lang={lang}>
                    {children}
                </AppShellContent>
            </AuthProvider>
        </DictionariesProvider>
    </ThemeProvider>
   )
}
