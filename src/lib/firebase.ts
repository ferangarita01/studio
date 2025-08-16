// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB91nCmcG55VdS4GGjlU9oNuVJHZsUn8Bg",
  authDomain: "wastewise-hdbhk.firebaseapp.com",
  databaseURL: "https://wastewise-hdbhk-default-rtdb.firebaseio.com",
  projectId: "wastewise-hdbhk",
  storageBucket: "wastewise-hdbhk.appspot.com",
  messagingSenderId: "154394820622",
  appId: "1:154394820622:web:eb39d54328bc9d0fb67c5f",
  measurementId: "G-V5C9N24E44"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Increase the maximum time for retrying uploads to 10 minutes (600,000 milliseconds)
(storage as any).maxUploadRetryTime = 600000;

// Google Sign-in functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific errors
    if (error.code === 'auth/popup-blocked') {
      // Fallback to redirect method
      return signInWithGoogleRedirect();
    }
    
    throw error;
  }
};

// Alternative method using redirect (useful for mobile or popup-blocked scenarios)
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Error with redirect sign-in:', error);
    throw error;
  }
};

// Handle redirect result (call this on app initialization)
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    console.error('Error handling redirect result:', error);
    return null;
  }
};

export { db, auth, app, storage, googleProvider };