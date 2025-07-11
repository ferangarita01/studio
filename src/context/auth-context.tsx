
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A key for storing the auth state in session storage
const AUTH_STORAGE_KEY = "eco-circle-auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const lang = pathname.split('/')[1] || 'en';

  useEffect(() => {
    // Check session storage for auth state on initial load
    try {
      const storedAuth = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch (error) {
        console.error("Could not access session storage:", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const login = useCallback(() => {
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
    } catch (error) {
       console.error("Could not access session storage:", error);
    }
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    try {
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
        console.error("Could not access session storage:", error);
    }
    setIsAuthenticated(false);
    // Redirect to login page on logout
    router.push(`/${lang}/login`);
  }, [router, lang]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
