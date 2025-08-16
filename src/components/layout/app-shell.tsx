

"use client";

import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, createContext, useContext, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import dynamic from 'next/dynamic';
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
  Users,
  User as UserIcon,
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
import type { Company, UserProfile, PlanType } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { CreateCompanyDialog } from "@/components/create-company-dialog";
import { useAuth, AuthProvider } from "@/context/auth-context";
import { useDictionaries, DictionariesProvider } from "@/context/dictionary-context";
import { 
  addCompany as addCompanyService, 
  getCompanies, 
  getCompanyById,
  deleteCompany as deleteCompanyService,
  updateCompany as updateCompanyService,
  assignUserToCompany as assignUserToCompanyService,
  getUsers
} from "@/services/waste-data-service";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";
import type { Dictionary } from "@/lib/get-dictionary";
import { ThemeProvider } from "../theme-provider";
import { Toaster } from "../ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { WhatsAppButton } from "../whatsapp-button";
import { UpgradePlanDialog } from "../upgrade-plan-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const ClientOnlyToaster = dynamic(() => import('@/components/ui/toaster').then(mod => mod.Toaster), {
  ssr: false,
});

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
    { href: '/analyzer', icon: BrainCircuit, labelKey: 'aiAgent', roles: ['admin', 'client'], plan: 'Premium' },
    { href: '/log', icon: Trash2, labelKey: 'log', roles: ['admin', 'client'] },
    { href: '/reports/disposal', icon: FileText, labelKey: 'finalDisposal', roles: ['admin', 'client'] },
    { href: '/schedule', icon: Calendar, labelKey: 'collections', roles: ['admin', 'client'] },
    { href: '/reports', icon: FileText, labelKey: 'reports', roles: ['admin', 'client'] },
    { href: '/materials', icon: Package, labelKey: 'prices', roles: ['admin', 'client'] },
    { href: '/companies', icon: Users, labelKey: 'companies', roles: ['admin'] },
    { href: '/compliance', icon: Gavel, labelKey: 'compliance', roles: ['admin', 'client'], plan: 'Premium' },
    { href: '/profile', icon: UserIcon, labelKey: 'profile', roles: ['admin', 'client'] },
] as const;


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
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  addCompany: (company: Company) => void;
  isLoading: boolean;
  handleDeleteCompany: (companyId: string) => Promise<void>;
  handleAssignUser: (companyId: string, userId: string | null) => Promise<void>;
  handleUpdateCompany: (companyId: string, data: Partial<Company>) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

function CompanySwitcher() {
  const dictionary = useDictionaries()?.navigation;
  const { user, role } = useAuth();
  const { companies, selectedCompany, setSelectedCompany, addCompany, isLoading } = useCompany();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);

  if (!dictionary || !user) return null;

  const handleCreateCompany = async (name: string) => {
    if(!user?.uid) return;
    const newCompany = await addCompanyService(name, user.uid);
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
  if (!selectedCompany && companies.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-2 text-center">
        {dictionary.companySwitcher.noCompanies}
        {role === 'admin' && (
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
              <span className="truncate">{selectedCompany ? selectedCompany.name : dictionary.companySwitcher.label}</span>
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
            value={selectedCompany?.id || ""}
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
          {role === 'admin' && (
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

function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, role, userProfile, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const dictionary = useDictionaries()?.companiesPage;

  useEffect(() => {
    const manageCompanies = async () => {
        setIsLoading(true);
        if (user && role) {
            const userCompanies = await getCompanies(user.uid, role === 'admin');
            setCompanies(userCompanies);
            if (role === 'admin') {
                setSelectedCompany(userCompanies[0] || null);
            } else if (role === 'client' && userProfile?.assignedCompanyId) {
                setSelectedCompany(userCompanies.find(c => c.id === userProfile.assignedCompanyId) || null);
            }
        } else {
            setCompanies([]);
            setSelectedCompany(null);
        }
        setIsLoading(false);
    };
    
    // Only run the effect once authentication is complete
    if (!isAuthLoading) {
      manageCompanies();
    }
}, [user, role, userProfile, isAuthLoading]);

  const addCompany = (company: Company) => {
    setCompanies(prev => [...prev, company].sort((a,b) => a.name.localeCompare(b.name)));
  };

  const handleDeleteCompany = useCallback(async (companyId: string) => {
    try {
        await deleteCompanyService(companyId);
        setCompanies(prev => prev.filter(c => c.id !== companyId));
        if (selectedCompany?.id === companyId) {
           setSelectedCompany(companies[0] || null);
        }
        toast({
            title: dictionary?.toast.delete.title,
            description: dictionary?.toast.delete.description
        });
    } catch (error) {
         toast({
            title: "Error",
            description: "Failed to delete company.",
            variant: "destructive"
        });
    }
  }, [toast, dictionary, companies, selectedCompany]);

  const handleAssignUser = useCallback(async (companyId: string, userId: string | null) => {
    try {
      await assignUserToCompanyService(companyId, userId);
      const clients = await getUsers('client');
      const updatedCompanies = companies.map(c => {
        if (c.id === companyId) {
          const assignedUser = clients.find(client => client.id === userId);
          return { ...c, assignedUserUid: userId || undefined, assignedUserName: assignedUser?.email || undefined };
        }
        return c;
      });
      setCompanies(updatedCompanies);

      toast({
        title: dictionary?.toast.assign.title,
        description: dictionary?.toast.assign.description,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to assign user.",
        variant: "destructive"
      });
    }
  }, [companies, toast, dictionary]);

  const handleUpdateCompany = useCallback(async (companyId: string, data: Partial<Company>) => {
    try {
      await updateCompanyService(companyId, data);
      setCompanies(prevCompanies => prevCompanies.map(c => 
        c.id === companyId ? { ...c, ...data } : c
      ));
      toast({
        title: dictionary?.toast.update.title,
        description: dictionary?.toast.update.description,
      });
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to update company.",
        variant: "destructive"
      });
    }
  }, [toast, dictionary]);


  const companyContextValue = useMemo(() => ({
    selectedCompany,
    setSelectedCompany: (company: Company | null) => {
        setSelectedCompany(company);
    },
    companies,
    setCompanies,
    addCompany,
    isLoading,
    handleDeleteCompany,
    handleAssignUser,
    handleUpdateCompany,
  }), [selectedCompany, companies, addCompany, isLoading, handleDeleteCompany, handleAssignUser, handleUpdateCompany]);

  return (
      <CompanyContext.Provider value={companyContextValue}>
          {children}
      </CompanyContext.Provider>
  )
}

function UserMenu() {
    const { logout, user, userProfile } = useAuth();
    const dictionary = useDictionaries()?.navigation;
    const { setTheme } = useTheme();

    if (!user || !dictionary) return null;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={userProfile?.fullName || 'User'} />
                        <AvatarFallback>{userProfile?.fullName ? getInitials(userProfile.fullName) : 'U'}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile?.fullName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{dictionary.logout}</span>
                </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="ghost" size="sm" className="w-full justify-start gap-2 font-normal">
                          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                          <span>{dictionary.themeToggle.toggle}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>{dictionary.themeToggle.light}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>{dictionary.themeToggle.dark}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>{dictionary.themeToggle.system}</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function AppShellContent({ children, lang }: { children: React.ReactNode, lang: string }) {
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

  const pathname = usePathname();
  const router = useRouter();

  const { isAuthenticated, isLoading: isAuthLoading, logout, role, userProfile } = useAuth();
  const dictionary = useDictionaries();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentPath = `/${pathname.split('/').slice(2).join('/')}`;

  const isPublicPage = useMemo(() => {
    const publicPaths = ['/login', '/landing', '/asorecifuentes', '/pricing', '/embed/impact'];
    // Welcome page is not public, it requires auth
    return publicPaths.some(p => currentPath.startsWith(p));
  }, [currentPath]);

  // Auth & Routing effect
  useEffect(() => {
    if (isAuthLoading || !isClient) return;

    // 1. Not authenticated: if not on a public page, redirect to landing
    if (!isAuthenticated && !isPublicPage) {
      router.push(`/${lang}/landing`);
      return;
    }
    
    // 2. Authenticated: handle redirects for authenticated users
    if (isAuthenticated) {
      const isOnWelcomePage = currentPath.startsWith('/welcome');
      const hasCompletedProfile = !!userProfile?.accountType;

      // If profile is not complete, redirect to /welcome, unless already there
      if (!hasCompletedProfile) {
        if (!isOnWelcomePage) {
          router.push(`/${lang}/welcome`);
        }
        return;
      }

      // If profile IS complete, but user is on /welcome or /login, redirect to dashboard
      if (hasCompletedProfile && (isOnWelcomePage || currentPath.startsWith('/login'))) {
          router.push(`/${lang}`);
          return;
      }
      
      // Check for role/plan authorization for the current page
      const findItem = (items: typeof allNavItems, path: string): (typeof allNavItems[number]) | undefined => {
          for (const item of items) {
              if (item.href === path || (item.href !== '/' && path.startsWith(item.href) && item.href.length > 1)) {
                  return item;
              }
          }
          if (path === '/') return items.find(item => item.href === '/');
          return undefined;
      };

      const currentItem = findItem(allNavItems, currentPath);
      
      if (currentItem) {
          const isAuthorizedRole = role && currentItem.roles.includes(role);
          const isPremiumFeature = 'plan' in currentItem && currentItem.plan === 'Premium';
          const hasPremiumPlan = role === 'client' && userProfile?.plan === 'Premium';

          if (!isAuthorizedRole || (isPremiumFeature && role === 'client' && !hasPremiumPlan)) {
               router.push(`/${lang}`);
          }
      }
    }
  }, [isAuthenticated, isAuthLoading, currentPath, isPublicPage, router, lang, isClient, role, userProfile]);
  

  const navItems = useMemo(() => {
    if (!role) return [];
    return allNavItems.filter(item => item.roles.includes(role));
  }, [role]);

  const handlePremiumClick = (e: React.MouseEvent<HTMLAnchorElement>, item: { plan?: string }) => {
    const isPremiumFeature = item.plan === 'Premium';
    const isFreeUser = role === 'client' && userProfile?.plan !== 'Premium';

    if (isPremiumFeature && isFreeUser) {
      e.preventDefault();
      setUpgradeDialogOpen(true);
      setMobileMenuOpen(false);
    } else {
      setMobileMenuOpen(false);
    }
  };

  const getHref = (href: string) => {
    if (href === '/') return `/${lang}`;
    return `/${lang}${href}`;
  }

  const NavContent = () => {
    if (!dictionary) {
      return <NavSkeleton />;
    }
    
    const navDictionary = dictionary.navigation;

    return (
      <div>
        <div className="p-2">
          <CompanySwitcher />
        </div>
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item) => {
              const label = navDictionary.links[item.labelKey as keyof typeof navDictionary.links];

              if ('subItems' in item) {
                const subItems = (item as any).subItems;
                const isActive = subItems.some((sub:any) => pathname.startsWith(getHref(sub.href)));
                return (
                  <Collapsible key={item.labelKey} defaultOpen={isActive}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        <span>{label}</span>
                      </div>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 py-1 pl-7">
                      {subItems.map((subItem:any) => {
                        if (!subItem.roles.includes(role!)) return null;
                        const subHref = getHref(subItem.href);
                        const subLabel = navDictionary.links[subItem.labelKey as keyof typeof navDictionary.links];
                        const isSubActive = pathname === subHref;
                        return (
                          <Link
                            key={subItem.labelKey}
                            href={subHref}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                              isSubActive && "bg-muted text-primary"
                            )}
                            onClick={(e) => handlePremiumClick(e, subItem)}
                          >
                            <span>{subLabel}</span>
                            {subItem.plan === 'Premium' && (
                              <Badge variant="outline" className="ml-auto flex items-center gap-1 border-yellow-500/50 text-yellow-500 text-xs px-2">
                                {navDictionary.premium}
                              </Badge>
                            )}
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
                  onClick={(e) => handlePremiumClick(e, item)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{label}</span>
                  {item.plan === 'Premium' && (
                    <Badge variant="outline" className="ml-auto flex items-center gap-1 border-yellow-500/50 text-yellow-500 text-xs px-2">
                      {navDictionary.premium}
                    </Badge>
                  )}
                </Link>
              );
            })
          }
        </nav>
      </div>
    );
  };
  
  if (!isClient || isAuthLoading || !dictionary) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div>Loading...</div>
        </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
     return (
        <div className="flex h-screen w-full items-center justify-center"><div>Loading...</div></div>
     );
  }
  
  const navDictionary = dictionary.navigation;

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Logo />
            </div>
            <div className="flex-1 overflow-y-auto py-2">
               <NavContent />
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
                 <div className="flex-1 overflow-y-auto py-2">
                    <NavContent />
                 </div>
              </SheetContent>
            </Sheet>
            <div className="w-full flex-1 md:hidden">
              <span className="font-semibold">{navDictionary.title}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <LanguageToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex flex-1 flex-col overflow-auto bg-background/50 relative">
            <div className="absolute inset-0 z-[-1]">
                <Image
                    src="https://space.gov.ae/app_themes/lg21016/images/Sustainability%20Development%20Goals.png"
                    alt="Abstract background representing recycling and data"
                    fill
                    priority
                    className="object-cover opacity-5 blur-sm"
                    data-ai-hint="sustainability goals"
                />
            </div>
            <div className="relative z-10">
                {children}
            </div>
          </main>
        </div>
        <WhatsAppButton />
        {navDictionary.upgradeDialog && (
          <UpgradePlanDialog
            open={isUpgradeDialogOpen}
            onOpenChange={setUpgradeDialogOpen}
            dictionary={navDictionary.upgradeDialog}
            lang={lang}
          />
        )}
      </div>
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
      <ClientOnlyToaster />
      <DictionariesProvider dictionary={dictionary}>
        <AuthProvider>
          <CompanyProvider>
            <AppShellContent lang={lang}>
                {children}
            </AppShellContent>
          </CompanyProvider>
        </AuthProvider>
      </DictionariesProvider>
    </ThemeProvider>
   )
}

    