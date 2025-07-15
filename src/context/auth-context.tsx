
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Company } from "@/lib/types";
import { getCompanies, addCompany } from "@/services/waste-data-service";


export type UserRole = "admin" | "client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  companyId: string | null;
  login: (email:string, pass:string) => Promise<any>;
  logout: () => void;
  signUp: (email:string, pass:string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = "eco-circle-role";
const COMPANY_ID_STORAGE_KEY = "eco-circle-company-id";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const lang = pathname.split('/')[1] || 'en';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // This is a simplified role management. 
        // In a real app, you'd get this from a database (e.g., Firestore) using the user.uid
        const storedRole = sessionStorage.getItem(ROLE_STORAGE_KEY) as UserRole;
        if (storedRole === 'admin') {
            setRole('admin');
            sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
            setCompanyId(null);
        } else {
            setRole('client');
            // For a client, find their associated company.
            // This demo assumes one company per client user for simplicity.
            const userCompanies = await getCompanies(user.uid);
            if(userCompanies.length > 0) {
              const clientCompanyId = userCompanies[0].id;
              setCompanyId(clientCompanyId);
              sessionStorage.setItem(COMPANY_ID_STORAGE_KEY, clientCompanyId);
            } else {
              // If client has no company yet, one can be created for them.
              // For now, clear companyId.
               setCompanyId(null);
               sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
            }
        }
      } else {
        setRole(null);
        setCompanyId(null);
        sessionStorage.removeItem(ROLE_STORAGE_KEY);
        sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string):Promise<any> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Simplified role detection for demo.
    const roleToSet = email.includes('admin') ? 'admin' : 'client';
    sessionStorage.setItem(ROLE_STORAGE_KEY, roleToSet);
    setRole(roleToSet);
    return userCredential;
  };

  const signUp = async (email: string, password: string):Promise<any> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // All sign-ups are clients in this demo.
    sessionStorage.setItem(ROLE_STORAGE_KEY, 'client');
    setRole('client');
    
    // Create a default company for the new client user.
    await addCompany(`Company of ${email.split('@')[0]}`, userCredential.user.uid);

    return userCredential;
  };

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setRole(null);
    setCompanyId(null);
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    sessionStorage.removeItem(COMPANY_ID_STORAGE_KEY);
    router.push(`/${lang}/login`);
  }, [router, lang]);

  return (
    <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout, 
        signUp,
        role, 
        companyId 
    }}>
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
