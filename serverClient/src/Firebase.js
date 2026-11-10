import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const readEnv = (key, fallback = '') => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY', 'AIzaSyBW60vy1YVo2KGyyNjRq4J8K0li61_Ilvg'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN', 'externalstrivers.firebaseapp.com'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID', 'externalstrivers'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET', 'externalstrivers.firebasestorage.app'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '366596677271'),
  appId: readEnv('VITE_FIREBASE_APP_ID', '1:366596677271:web:bee8fc8f2ff28f4e74d3d2'),
  measurementId: readEnv('VITE_FIREBASE_MEASUREMENT_ID', 'G-JSNQH1RZ9C'),
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
let analytics = null;

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

export { app, analytics, firebaseConfig };
export default app;
