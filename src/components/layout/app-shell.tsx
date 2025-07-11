"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/get-dictionary";

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

export function AppShell({ children, dictionary }: { children: React.ReactNode; dictionary: Dictionary["navigation"] }) {
  const pathname = usePathname();
  const currentLang = pathname.split('/')[1];

  const getHref = (href: string) => {
    if (href === '/') return `/${currentLang}`;
    return `/${currentLang}${href}`;
  }
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
                <Logo dictionary={dictionary} />
                <div className="flex items-center gap-2">
                    <LanguageToggle dictionary={dictionary.languageToggle} />
                    <ThemeToggle dictionary={dictionary.themeToggle} />
                    <SidebarTrigger className="md:hidden" />
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
                const href = getHref(item.href);
                const label = dictionary.links[item.labelKey];
                return (
                    <SidebarMenuItem key={href}>
                      <Link href={href}>
                          <SidebarMenuButton
                            isActive={pathname === href || (item.href !== '/' && pathname.startsWith(href))}
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
        <div className="hidden md:flex md:flex-col p-2 mt-auto">
             <div className="flex items-center justify-end gap-2">
                <LanguageToggle dictionary={dictionary.languageToggle} />
                <ThemeToggle dictionary={dictionary.themeToggle} />
            </div>
        </div>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
