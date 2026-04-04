import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { firebaseApp } from "./config";

/**
 * Single Auth instance shared across the app.
 * Never call getAuth() directly elsewhere — import from here.
 */
export const auth = getAuth(firebaseApp);

/**
 * Pre-configured Google provider.
 * Add scopes here if you need additional Google API access in the future.
 */
export const googleProvider = new GoogleAuthProvider();
