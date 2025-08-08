

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
import type { UserProfile } from "@/lib/types";
import { getUserProfile, createUserProfile, addCompany as addCompanyService } from "@/services/waste-data-service";
import type { Locale } from "@/i18n-config";


export type UserRole = "admin" | "client";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  userProfile: UserProfile | null;
  login: (email:string, pass:string) => Promise<any>;
  logout: () => void;
  signUp: (email:string, pass:string, profileData: Omit<UserProfile, 'id' | 'role' | 'email'>) => Promise<any>;
  refreshUserProfile: () => Promise<void>;
  lang: Locale;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const lang = (pathname.split('/')[1] || 'en') as Locale;
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile) {
          setRole(profile.role);
        } else {
          setRole(null);
        }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);
        
        const idToken = await user.getIdToken();
        // This is a client-side only way to "forward" the token for server components
        // A more robust solution might use cookies or a dedicated API route
        document.cookie = `firebaseIdToken=${idToken};path=/;max-age=3600`;
        
        if (user.email === 'prueba2@admin.co') {
            const profile = await getUserProfile(user.uid);
            setUserProfile({...profile, id: user.uid, email: user.email, role: 'admin' });
            setRole('admin');
        } else {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
            setRole(profile?.role || null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setRole(null);
        document.cookie = 'firebaseIdToken=;path=/;max-age=0';
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const login = async (email: string, password: string):Promise<any> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle fetching the profile and setting the role
    return userCredential;
  };

  const signUp = async (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'role' | 'email'>):Promise<any> => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        if (newUser) {
          
          let assignedCompanyId: string | undefined = undefined;

          // If the account type is company, create the company and get its ID
          if (profileData.accountType === 'company' && profileData.companyName) {
            const newCompany = await addCompanyService(profileData.companyName, newUser.uid, newUser.uid);
            assignedCompanyId = newCompany.id;
          }

          // Create a user profile in the database with the 'client' role
          await createUserProfile(newUser.uid, { 
            email: newUser.email!, 
            role: 'client',
            ...profileData,
            plan: 'Free',
            assignedCompanyId: assignedCompanyId, // Add the assigned company ID
          });
        }
        // onAuthStateChanged will handle setting the new user and profile
        return userCredential;
    } catch (err) {
        throw err;
    }
  };

  const logout = useCallback(async () => {
    await signOut(auth);
    // state will be cleared by onAuthStateChanged
    router.push(`/${lang}/landing`);
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
        userProfile,
        refreshUserProfile,
        lang
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
