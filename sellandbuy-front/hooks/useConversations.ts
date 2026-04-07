"use client";

import { useState, useEffect } from "react";
import { Conversation } from "@/types/chat";
import { subscribeToUserConversations } from "@/services/chat.service";
import { useAuth } from "@/hooks/useAuth";

export function useConversations() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      setConversations([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserConversations(
      firebaseUser.uid,
      (newConversations) => {
        setConversations(newConversations);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firebaseUser, authLoading]);

  return { conversations, loading, error };
}
