// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { setMaxUploadRetryTime } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Increase the maximum time for retrying uploads to 10 minutes (600,000 milliseconds)
storage.maxUploadRetryTime = 600000;


export { db, auth, app, storage };
