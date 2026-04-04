import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "./config";

/**
 * Single Firestore instance shared across the app.
 * Never call getFirestore() directly elsewhere — import from here.
 */
export const db = getFirestore(firebaseApp);
