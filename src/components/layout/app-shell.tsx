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
} from "lucide-react";

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

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
            <div className="flex items-center justify-between">
                <Logo />
                <SidebarTrigger className="md:hidden" />
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior={false}>
                      <SidebarMenuButton
                        as="a"
                        href={item.href}
                        isActive={pathname === item.href}
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
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
