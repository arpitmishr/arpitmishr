// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  apiKey: "AIzaSyDXUopiFCRN7XhlTyHqpKkz0YYso5ztQUs",
  authDomain: "tenantmanagementapp-18ff4.firebaseapp.com",
  projectId: "tenantmanagementapp-18ff4",
  storageBucket: "tenantmanagementapp-18ff4.firebasestorage.app",
  messagingSenderId: "428092125206",
  appId: "1:428092125206:web:3361181c8a64e462328537"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

















