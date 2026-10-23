// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBKt6depgUnIqec4o88PAKN2djKQZOEjAU",
  authDomain: "strivers-47db5.firebaseapp.com",
  projectId: "strivers-47db5",
  storageBucket: "strivers-47db5.firebasestorage.app",
  messagingSenderId: "36094052070",
  appId: "1:36094052070:web:8b3f3f61afcbd41f5e9d27",
  measurementId: "G-NJ1MQXBD20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);