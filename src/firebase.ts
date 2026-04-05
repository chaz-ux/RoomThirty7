import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";  // ← new

// TODO: Replace with your actual Firebase project configuration 
// to enable Online Multiplayer syncing.
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// We wrap initialization in a try-catch so the app doesn't crash 
// if the config is left as default (API_KEY) during local testing.
let app: FirebaseApp | undefined;
let database: Database | undefined;
let auth: Auth | undefined;
let firestore: Firestore | undefined;  // ← new

try {
    app = initializeApp(firebaseConfig);
    database  = getDatabase(app);
    auth      = getAuth(app);
    firestore = getFirestore(app);  // ← new — used by feedback system
    console.log('✅ Firebase initialized successfully');
} catch (e) {
    console.error("❌ Firebase initialization failed:", e);
    console.warn("Firebase config is incomplete. Online multiplayer won't sync until you provide your config credentials in firebase.ts!");
}

export { app, database, auth, firestore };
export default app;