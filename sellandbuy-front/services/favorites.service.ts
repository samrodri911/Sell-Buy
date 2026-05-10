import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase/firestore";

/**
 * Toggles a product in the user's favorites array in Firestore.
 * @param userId The ID of the current user
 * @param productId The ID of the product to toggle
 * @param isCurrentlyFavorite Whether the product is currently a favorite
 * @returns Promise that resolves when the update is complete
 */
export async function toggleFavoriteService(
  userId: string,
  productId: string,
  isCurrentlyFavorite: boolean
): Promise<void> {
  if (!userId || !productId) return;

  const userRef = doc(db, "users", userId);

  try {
    await updateDoc(userRef, {
      favoriteProducts: isCurrentlyFavorite
        ? arrayRemove(productId)
        : arrayUnion(productId),
    });
  } catch (error) {
    console.error("Error updating favorite status:", error);
    throw error;
  }
}
