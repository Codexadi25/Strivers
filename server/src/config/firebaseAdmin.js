const admin = require('firebase-admin');

const formatPrivateKey = (key) => {
  if (!key) return undefined;
  
  // 1. Remove wrapping quotes if they were passed into the string
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }

  // 2. Replace escaped literal \n with real newline characters
  return cleaned.replace(/\\n/g, '\n');
};

const rawKey = process.env.FIREBASE_PRIVATE_KEY;
const isPlaceholderKey = !rawKey || rawKey.includes('...') || rawKey.length < 50;

if (!admin.apps.length) {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    !isPlaceholderKey
  ) {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(rawKey),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('[Firebase Admin] Successfully initialized with service account.');
    } catch (err) {
      console.warn(`[Firebase Admin Warning] Could not initialize credentials: ${err.message}. Running in local development fallback mode.`);
    }
  } else {
    console.log('[Firebase Admin] Running in local development mode (no valid production private key provided).');
  }
}

module.exports = admin;