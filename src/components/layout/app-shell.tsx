"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import React, { useState, createContext, useContext } from "react";
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
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/get-dictionary";
import { companies } from "@/lib/data";
import type { Company } from "@/lib/types";

const Logo = ({ dictionary }: { dictionary: Dictionary["navigation"] }) => (
  <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
    <Recycle className="h-6 w-6" />
    <span className="text-lg">{dictionary.title}</span>
  </Link>
);

const navItems = [
    { href: '/', icon: LayoutDashboard, labelKey: 'dashboard' },
    { href: '/analyzer', icon: BrainCircuit, labelKey: 'analyzer' },
    { href: '/log', icon: Trash2, labelKey: 'log' },
    { href: '/schedule', icon: Calendar, labelKey: 'schedule' },
    { href: '/reports', icon: FileText, labelKey: 'reports' },
] as const;


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

interface CompanyContextType {
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

function CompanySwitcher({ dictionary }: { dictionary: Dictionary["navigation"]["companySwitcher"] }) {
  const { selectedCompany, setSelectedCompany } = useCompany();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="truncate">{selectedCompany.name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuLabel>{dictionary.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={selectedCompany.id}
          onValueChange={(id) => {
            const company = companies.find((c) => c.id === id);
            if (company) {
              setSelectedCompany(company);
            }
          }}
        >
          {companies.map((company) => (
            <DropdownMenuRadioItem key={company.id} value={company.id}>
              {company.name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export function AppShell({ children, dictionary }: { children: React.ReactNode; dictionary: Dictionary["navigation"] }) {
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1] || 'en';
  const [selectedCompany, setSelectedCompany] = useState<Company>(companies[0]);

  const getHref = (href: string) => {
    if (href === '/') return `/${currentLang}`;
    return `/${currentLang}${href}`;
  }
  
  return (
    <CompanyContext.Provider value={{ selectedCompany, setSelectedCompany }}>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
              <div className="flex items-center justify-between">
                  <Logo dictionary={dictionary} />
                  <div className="flex items-center gap-2 md:hidden">
                      <LanguageToggle dictionary={dictionary.languageToggle} />
                      <ThemeToggle dictionary={dictionary.themeToggle} />
                      <SidebarTrigger/>
                  </div>
              </div>
          </SidebarHeader>
          <SidebarContent>
            <div className="p-2">
              <CompanySwitcher dictionary={dictionary.companySwitcher} />
            </div>
            <SidebarMenu>
              {navItems.map((item) => {
                  const href = getHref(item.href);
                  const label = dictionary.links[item.labelKey];
                  const isActive = pathname === href || (item.href !== '/' && pathname.startsWith(href));
                  return (
                      <SidebarMenuItem key={href}>
                        <Link href={href} passHref legacyBehavior>
                          <SidebarMenuButton
                            as="a"
                            isActive={isActive}
                            tooltip={label}
                          >
                            <item.icon />
                            <span>{label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                  )
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="hidden md:flex p-2 mt-auto">
               <div className="flex items-center justify-end gap-2">
                  <LanguageToggle dictionary={dictionary.languageToggle} />
                  <ThemeToggle dictionary={dictionary.themeToggle} />
              </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </CompanyContext.Provider>
  );
}
