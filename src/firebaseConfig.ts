import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName],
);

if (missingEnvVars.length > 0) {
  if (isDemoMode) {
    console.warn(
      `[Demo Mode] Missing Firebase env vars: ${missingEnvVars.join(
        ", ",
      )}. Using non-secure demo defaults.`,
    );
  } else {
    throw new Error(
      `Configuration error: Missing required environment variables: ${missingEnvVars.join(
        ", ",
      )}. Please check your .env file.`,
    );
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "demo-auth.local",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "demo-storage-bucket",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "demo-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "demo-app-id",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
