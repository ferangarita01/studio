
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

export type UserRole = "admin" | "client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  companyId: string | null; // companyId for client role
  login: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A key for storing the auth state in session storage
const AUTH_STORAGE_KEY = "eco-circle-auth";
const ROLE_STORAGE_KEY = "eco-circle-role";
const COMPANY_ID_STORAGE_KEY = "eco-circle-company-id";


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const lang = pathname.split('/')[1] || 'en';

  useEffect(() => {
    // Check session storage for auth state on initial load
    try {
      const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      const storedRole = sessionStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
      const storedCompanyId = sessionStorage.getItem(COMPANY_ID_STORAGE_KEY);

      if (storedAuth === "true" && storedRole) {
        setIsAuthenticated(true);
        setRole(storedRole);
        if (storedRole === 'client' && storedCompanyId) {
          setCompanyId(storedCompanyId);
        }
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback((role: UserRole) => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      sessionStorage.setItem(ROLE_STORAGE_KEY, role);
      if (role === 'client') {
        // For this demo, we'll assign the client to the first company.
        // In a real app, this would come from the user's profile.
        const clientCompanyId = "c1"; 
        sessionStorage.setItem(COMPANY_ID_STORAGE_KEY, clientCompanyId);
        setCompanyId(clientCompanyId);
      } else {
        sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
        setCompanyId(null);
      }
    } catch (error) {
       console.error("Could not access session storage:", error);
    }
    setIsAuthenticated(true);
    setRole(role);
  }, []);

  const logout = useCallback(() => {
    try {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    setIsAuthenticated(false);
    setRole(null);
    setCompanyId(null);
    // Redirect to login page on logout
    router.push(`/${lang}/login`);
  }, [router, lang]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, role, companyId }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
