import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate that all required env vars are present
if (typeof window !== "undefined") {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error(
      `[Firebase] Missing environment variables: ${missing.join(", ")}. ` +
        `Check your .env.local file.`
    );
  }
}

/**
 * Initialize Firebase App — safe to call multiple times.
 * Uses getApps() to prevent duplicate initialization (common in Next.js
 * due to hot-module-reload in dev and React strict mode double-mounting).
 */
export const firebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
