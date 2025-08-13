

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import { getUserProfile, createUserProfile, addCompany as addCompanyService, updateUserProfile } from "@/services/waste-data-service";
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
  signUp: (email:string, pass:string, profileData: Partial<UserProfile>) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  lang: Locale;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();

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

  const handleUser = useCallback(async (user: User | null) => {
    if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        setRole(profile?.role || null);
    } else {
        setUser(null);
        setUserProfile(null);
        setRole(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [handleUser]);


  const login = async (email: string, password: string):Promise<any> => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>):Promise<any> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;
    
    await createUserProfile(newUser.uid, { 
      email: newUser.email!,
      role: 'client',
      fullName: profileData.fullName || newUser.displayName || "New User",
      plan: 'Free',
    });

    return userCredential;
  };
  
  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user exists in our DB, if not, create them
    const profile = await getUserProfile(user.uid);
    if (!profile) {
        await createUserProfile(user.uid, {
            email: user.email!,
            role: 'client',
            fullName: user.displayName || 'Google User',
            plan: 'Free',
        });
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error("User not authenticated");
    await updateUserProfile(user.uid, data);
    await refreshUserProfile(); // Refresh local state
  };

  const logout = useCallback(async () => {
    await signOut(auth);
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
        signInWithGoogle,
        resetPassword,
        updateProfile,
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

    