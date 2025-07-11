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

const Logo = () => (
  <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
    <Recycle className="h-6 w-6" />
    <span className="text-lg">WasteWise</span>
  </Link>
);

const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/analyzer', icon: BrainCircuit, label: 'AI Analyzer' },
    { href: '/log', icon: Trash2, label: 'Waste Log' },
    { href: '/schedule', icon: Calendar, label: 'Schedule' },
    { href: '/reports', icon: FileText, label: 'Reports' },
];

function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LanguageToggle() {
    const pathname = usePathname()
    // This simple logic assumes the locale is the first part of the path
    const currentLocale = pathname.split('/')[1];
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Languages className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
            <Link href={pathWithoutLocale} locale="en">English</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
            <Link href={pathWithoutLocale} locale="es">Español</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
                <Logo />
                <div className="flex items-center gap-2">
                    <LanguageToggle />
                    <ThemeToggle />
                    <SidebarTrigger className="md:hidden" />
                </div>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <SidebarMenuButton
                        as="a"
                        isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                        tooltip={item.label}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="hidden md:flex md:flex-col p-2 mt-auto">
             <div className="flex items-center justify-end gap-2">
                <LanguageToggle />
                <ThemeToggle />
            </div>
        </div>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
