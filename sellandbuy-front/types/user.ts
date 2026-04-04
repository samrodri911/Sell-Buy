import { Timestamp } from "firebase/firestore";

// ─── User Roles ────────────────────────────────────────────────
// Extensible enum for RBAC. Only Cloud Functions can change roles.
export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  ADMIN = "admin",
}

// ─── Firestore User Document (/users/{uid}) ────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  isVerified: boolean;
  reputation: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Fields that the client is allowed to write on create/update
export type UserWritableFields = Pick<
  UserProfile,
  "displayName" | "photoURL" | "email"
>;

// ─── Auth Context State ────────────────────────────────────────
export interface AuthState {
  /** Firebase Auth user object (null = not authenticated) */
  firebaseUser: import("firebase/auth").User | null;
  /** Firestore profile (null = not loaded yet or not authenticated) */
  userProfile: UserProfile | null;
  /** True while the initial auth check is in progress */
  loading: boolean;
  /** Last auth-related error message */
  error: string | null;
}

// ─── Auth Context Actions ──────────────────────────────────────
export interface AuthActions {
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  /** Re-fetch the user profile from Firestore */
  refreshProfile: () => Promise<void>;
  /** Clear the error state */
  clearError: () => void;
}

export type AuthContextValue = AuthState & AuthActions;
