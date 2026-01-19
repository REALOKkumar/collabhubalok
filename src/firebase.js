// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwV8d4NoFd6drDfIMJb9YoRy2t4k4WN44",
  authDomain: "collabhub-61ec4.firebaseapp.com",
  projectId: "collabhub-61ec4",
  storageBucket: "collabhub-61ec4.firebasestorage.app",
  messagingSenderId: "513710049308",
  appId: "1:513710049308:web:83382de49363275be037d9",
  measurementId: "G-RLFB9XR9GG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;