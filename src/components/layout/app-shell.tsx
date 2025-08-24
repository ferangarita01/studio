

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
  Bell,
  Settings,
  Loader2,
  CalendarDays
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
  updateUserPlan,
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
    <Link href="/" className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-blue-600 p-2">
            <Recycle className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-xl font-bold">{dictionary.title}</h1>
    </Link>
  );
};

const allNavItems = [
    { href: '/', icon: LayoutDashboard, labelKey: 'dashboard', roles: ['admin', 'client'] },
    { href: '/compliance', icon: Gavel, labelKey: 'compliance', roles: ['admin', 'client'], plan: 'Premium' },
    { href: '/analyzer', icon: BrainCircuit, labelKey: 'aiAgent', roles: ['admin', 'client'], plan: 'Premium' },
    { href: '/log', icon: Trash2, labelKey: 'log', roles: ['admin', 'client'] },
    { href: '/reports/disposal', icon: FileText, labelKey: 'finalDisposal', roles: ['admin', 'client'] },
    { href: '/schedule', icon: CalendarDays, labelKey: 'collections', roles: ['admin', 'client'] },
    { href: '/reports', icon: FileText, labelKey: 'reports', roles: ['admin', 'client'] },
    { href: '/materials', icon: Package, labelKey: 'prices', roles: ['admin', 'client'] },
    { href: '/companies', icon: Users, labelKey: 'companies', roles: ['admin'] },
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
  if (role === 'admin' && companies.length === 0) {
    return (
      <>
        <div className="text-sm text-muted-foreground p-2 text-center">
          {dictionary.companySwitcher.noCompanies}
          <Button variant="link" size="sm" onClick={() => setCreateOpen(true)} className="p-1 h-auto">
            {dictionary.companySwitcher.createOne}
          </Button>
        </div>
        <CreateCompanyDialog
          dictionary={dictionary.createCompanyDialog}
          open={isCreateOpen}
          onOpenChange={setCreateOpen}
          onCreate={handleCreateCompany}
        />
      </>
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
      // First, update the company details in the database
      await updateCompanyService(companyId, data);

      // If the plan was changed, update the assigned user's plan as well
      const companyToUpdate = companies.find(c => c.id === companyId);
      if (data.plan && companyToUpdate?.assignedUserUid) {
        await updateUserPlan(companyToUpdate.assignedUserUid, data.plan);
      }
      
      // Update the local state for immediate UI feedback
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
  }, [toast, dictionary, companies]);


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
    const { theme, setTheme } = useTheme();

    if (!user || !dictionary) return null;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={userProfile?.fullName || 'User'} />
                        <AvatarFallback>{userProfile?.fullName ? getInitials(userProfile.fullName) : 'U'}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
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
                 <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                    <span>{theme === 'dark' ? dictionary.themeToggle.light : dictionary.themeToggle.dark}</span>
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


function AppShellContent({ children, lang }: { children: React.ReactNode, lang: string }) {
  const NavSkeleton = () => (
     <div className="space-y-2 p-4">
        {[...Array(6)].map((_, i) => (
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
  const { theme, setTheme } = useTheme();


  useEffect(() => {
    setIsClient(true);
  }, []);

  const currentPath = `/${pathname.split('/').slice(2).join('/')}`;

  const isPublicPage = useMemo(() => {
    const publicPaths = ['/login', '/landing', '/asorecifuentes', '/pricing', '/embed/impact'];
    return publicPaths.some(p => currentPath.startsWith(p));
  }, [currentPath]);

  // Auth & Routing effect
  useEffect(() => {
    if (isAuthLoading || !isClient) return;

    if (!isAuthenticated && !isPublicPage) {
      router.push(`/${lang}/landing`);
      return;
    }
    
    if (isAuthenticated) {
      const isOnWelcomePage = currentPath.startsWith('/welcome');
      const hasCompletedProfile = !!userProfile?.accountType;

      if (!hasCompletedProfile) {
        if (!isOnWelcomePage) {
          router.push(`/${lang}/welcome`);
        }
        return;
      }

      if (hasCompletedProfile && (isOnWelcomePage || currentPath.startsWith('/login'))) {
          router.push(`/${lang}`);
          return;
      }
      
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
      <nav className="space-y-2">
        {navItems.map((item) => {
          const label = navDictionary.links[item.labelKey as keyof typeof navDictionary.links];
          const href = getHref(item.href);
          
          const isActive = pathname === href;

          return (
             <Link
                key={item.labelKey}
                href={href}
                onClick={(e) => handlePremiumClick(e, item)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200",
                  isActive 
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </div>
                {item.plan === 'Premium' && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    {navDictionary.premium}
                  </span>
                )}
              </Link>
          );
        })}
      </nav>
    );
  };
  
  if (!isClient || !dictionary) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (isAuthLoading || !isAuthenticated) {
     return (
        <div className="flex h-screen w-full items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin" />
        </div>
     );
  }
  
  const navDictionary = dictionary.navigation;

  return (
      <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
        <aside className="hidden md:block border-r bg-card p-4">
          <div className="flex flex-col gap-8">
            <div className="px-4">
              <Logo />
            </div>
            <NavContent />
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
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
              <SheetContent side="left" className="flex flex-col p-4 w-full max-w-sm">
                 <Logo />
                 <div className="mt-8 flex-1">
                    <NavContent />
                 </div>
              </SheetContent>
            </Sheet>
            
            <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>
              <LanguageToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
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
        defaultTheme="dark"
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
