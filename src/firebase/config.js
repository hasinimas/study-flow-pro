// src/firebase/config.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { getDatabase, ref, push, set, onValue, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAZof82duX8zONCVn3rqG8M1Ray1o8tJu0",
  authDomain: "studyflowpro-51673.firebaseapp.com",
  projectId: "studyflowpro-51673",
  storageBucket: "studyflowpro-51673.firebasestorage.app",
  messagingSenderId: "432103376765",
  appId: "1:432103376765:web:9778f6390295023c236e14",
  databaseURL: "https://studyflowpro-51673-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// Realtime DB
export const realtimeDB = getDatabase(app);

// DB helpers (re-export for convenience)
export { ref, push, set, onValue, remove };

// Auth helpers
export { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged };
