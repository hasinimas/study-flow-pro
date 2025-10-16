import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set, onValue, push } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAZof82duX8zONCVn3rqG8M1Ray1o8tJu0",
  authDomain: "studyflowpro-51673.firebaseapp.com",
  projectId: "studyflowpro-51673",
  storageBucket: "studyflowpro-51673.firebasestorage.app",
  messagingSenderId: "432103376765",
  appId: "1:432103376765:web:9778f6390295023c236e14",
  databaseURL:
    "https://studyflowpro-51673-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const realtimeDB = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export helper Firebase functions
export {
  app,
  ref,
  onValue,
  set,
  push,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
};
