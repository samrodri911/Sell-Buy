"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createOrGetConversation } from "@/services/chat.service";
import { MessageCircle, Loader2 } from "lucide-react";

interface ContactSellerButtonProps {
  productId: string;
  sellerId: string;
}

export function ContactSellerButton({ productId, sellerId }: ContactSellerButtonProps) {
  const { firebaseUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // If the current user is the seller, don't show the button
  if (firebaseUser?.uid === sellerId) {
    return null;
  }

  const handleContactClick = async () => {
    if (!firebaseUser) {
      // Should redirect to login or show modal, for now redirect to home/login
      router.push("/");
      return;
    }

    setLoading(true);
    try {
      const conversationId = await createOrGetConversation(
        productId,
        firebaseUser.uid,
        sellerId
      );
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      // Ideally show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleContactClick}
      disabled={loading}
      className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-neutral-900/20 flex items-center justify-center gap-2 disabled:bg-neutral-400 disabled:shadow-none"
    >
      {loading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <MessageCircle size={20} />
      )}
      {loading ? "Abriendo chat..." : "Contactar Vendedor"}
    </button>
  );
}
