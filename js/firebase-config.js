// js/firebase-config.js

// 1. Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDXUopiFCRN7XhlTyHqpKkz0YYso5ztQUs",
  authDomain: "tenantmanagementapp-18ff4.firebaseapp.com",
  projectId: "tenantmanagementapp-18ff4",
  storageBucket: "tenantmanagementapp-18ff4.firebasestorage.app",
  messagingSenderId: "428092125206",
  appId: "1:428092125206:web:3361181c8a64e462328537"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 4. Export services so other files can use them
export { db, auth };
