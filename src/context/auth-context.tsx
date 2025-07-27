
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
import { getUserProfile, createUserProfile } from "@/services/waste-data-service";


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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const lang = pathname.split('/')[1] || 'en';
  
  const refreshUserProfile = useCallback(async () => {
    if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
         if (user.email === 'prueba2@admin.co') {
          setRole('admin');
        } else if (profile) {
          setRole(profile.role);
        } else {
          setRole(null);
        }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      setUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);

        // Explicitly set the role for the admin account
        if (user.email === 'prueba2@admin.co') {
          setRole('admin');
        } else if (profile) {
          setRole(profile.role);
        } else {
          setRole(null);
        }

      } else {
        setUserProfile(null);
        setRole(null);
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
          // Create a user profile in the database with the 'client' role
          await createUserProfile(newUser.uid, { 
            email: newUser.email!, 
            role: 'client',
            ...profileData,
            plan: 'Free'
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
    setUser(null);
    setUserProfile(null);
    setRole(null);
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
        userProfile,
        refreshUserProfile
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
