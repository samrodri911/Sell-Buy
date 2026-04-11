import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { db } from "@/lib/firebase/firestore";
import { UserProfile, UserRole } from "@/types/user";

// ─── In-memory cache ───────────────────────────────────────────
// Prevents redundant Firestore reads within the same session.
// Invalidated on logout or explicit refresh.
let profileCache: Map<string, UserProfile> = new Map();

export function clearProfileCache(): void {
  profileCache.clear();
}

// ─── Create or update user on login ────────────────────────────
/**
 * Syncs the Firebase Auth user to Firestore.
 *
 * Uses `setDoc` with `merge: true` — a single atomic write that:
 *   - Creates the document if it doesn't exist (with all default fields)
 *   - Updates only the provided fields if it already exists
 *
 * This replaces the old getDoc + setDoc pattern (2 operations → 1).
 */
export async function syncUserToFirestore(
  firebaseUser: FirebaseUser
): Promise<UserProfile> {
  const userRef = doc(db, "users", firebaseUser.uid);

  // Fields to always sync from the Auth provider (Google may update them)
  const syncData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    displayName: firebaseUser.displayName ?? "",
    photoURL: firebaseUser.photoURL ?? "",
    updatedAt: serverTimestamp(),
  };

  // Default fields only set on first creation (merge won't overwrite existing)
  const defaults = {
    role: UserRole.BUYER,
    isVerified: false,
    reputation: 0,
    createdAt: serverTimestamp(),
  };

  // Check if user already exists to decide whether to include defaults
  const existingDoc = await getDoc(userRef);

  if (existingDoc.exists()) {
    // User exists — only update sync fields
    await updateDoc(userRef, syncData);
  } else {
    // New user — set all fields
    await setDoc(userRef, { ...defaults, ...syncData });
  }

  // Read back the full profile to get server-resolved timestamps
  return getUserProfile(firebaseUser.uid, true);
}

// ─── Read user profile ─────────────────────────────────────────
/**
 * Gets a user profile from Firestore.
 * Returns from cache if available, unless `forceRefresh` is true.
 */
export async function getUserProfile(
  uid: string,
  forceRefresh = false
): Promise<UserProfile> {
  if (!forceRefresh && profileCache.has(uid)) {
    return profileCache.get(uid)!;
  }

  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    throw new Error(`User profile not found for uid: ${uid}`);
  }

  const profile = { ...snap.data() } as UserProfile;
  profileCache.set(uid, profile);
  return profile;
}

// ─── Update user profile ───────────────────────────────────────
/**
 * Partial update of user-writable fields.
 * Automatically sets `updatedAt`.
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, "displayName" | "photoURL" | "bio">>
): Promise<UserProfile> {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  // Invalidate cache and return fresh data
  profileCache.delete(uid);
  return getUserProfile(uid, true);
}
