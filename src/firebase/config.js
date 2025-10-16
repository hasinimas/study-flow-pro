// Import Firebase functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, push, onValue, set } from "firebase/database";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAZof82duX8zONCVn3rqG8M1Ray1o8tJu0",
  authDomain: "studyflowpro-51673.firebaseapp.com",
  projectId: "studyflowpro-51673",
  storageBucket: "studyflowpro-51673.firebasestorage.app",
  messagingSenderId: "432103376765",
  appId: "1:432103376765:web:9778f6390295023c236e14",
  databaseURL: "https://studyflowpro-51673-default-rtdb.firebaseio.com" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const realtimeDB = getDatabase(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export helper Firebase functions
export { signInWithPopup, signOut, ref, push, onValue, set };
