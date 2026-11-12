// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBW60vy1YVo2KGyyNjRq4J8K0li61_Ilvg",
  authDomain: "job-strivers.firebaseapp.com",
  projectId: "job-strivers",
  storageBucket: "job-strivers.firebasestorage.app",
  messagingSenderId: "366596677271",
  appId: "1:366596677271:web:bee8fc8f2ff28f4e74d3d2",
  measurementId: "G-JSNQH1RZ9C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);