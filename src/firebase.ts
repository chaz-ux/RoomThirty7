import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration 
// to enable Online Multiplayer syncing.
// See: https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "API_KEY",
    authDomain: "roomthirty7-baefb.firebaseapp.com",
    databaseURL: "https://roomthirty7-baefb.firebaseio.com",
    projectId: "roomthirty7-baefb",
    storageBucket: "roomthirty7-baefb.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};

// We wrap initialization in a try-catch so the app doesn't crash 
// if the config is left as default (API_KEY) during local testing.
let app: FirebaseApp | undefined;
let database: Database | undefined;
let auth: Auth | undefined;

try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
} catch (e) {
    console.warn("Firebase config is incomplete. Online multiplayer won't sync until you provide your config credentials in firebase.ts!");
}

export { app, database, auth };
export default app;
