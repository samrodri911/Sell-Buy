import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { toggleFavoriteService } from "@/services/favorites.service";

export function useFavorites() {
  const { userProfile, updateLocalProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!userProfile) {
        // You could redirect to login here or show a toast
        return false;
      }

      const favorites = userProfile.favoriteProducts || [];
      const isFavorite = favorites.includes(productId);

      // Optimistic Update
      const newFavorites = isFavorite
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId];

      updateLocalProfile({ favoriteProducts: newFavorites });

      try {
        setIsLoading(true);
        await toggleFavoriteService(userProfile.uid, productId, isFavorite);
        return true;
      } catch (error) {
        // Revert optimistic update on failure
        console.error("Failed to toggle favorite, reverting...", error);
        updateLocalProfile({ favoriteProducts: favorites });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile, updateLocalProfile]
  );

  return {
    toggleFavorite,
    isLoading,
    favoriteProducts: userProfile?.favoriteProducts || [],
    isFavorite: (productId: string) =>
      (userProfile?.favoriteProducts || []).includes(productId),
  };
}
