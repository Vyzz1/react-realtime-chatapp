// Import the functions you need from the SDKs you need
import * as firebase from "firebase/app";
import { GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "react-chat-app-4f7a1.firebaseapp.com",
  projectId: "react-chat-app-4f7a1",
  storageBucket: "react-chat-app-4f7a1.appspot.com",
  messagingSenderId: "254425886333",
  appId: "1:254425886333:web:313852d88ede34c2ae0b14",
};

// Initialize Firebase

export const app = firebase.initializeApp(firebaseConfig);

// create a db
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const storage = getStorage();
