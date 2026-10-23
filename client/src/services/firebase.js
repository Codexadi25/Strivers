import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'dummy_api_key_for_dev',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'localhost',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'strivers-local',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'strivers-local.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdef',
};

let app;
let auth;
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.warn('[Firebase Client Notice] Auth running in local dev mode:', error.message);
  auth = { currentUser: null };
}

export { auth };