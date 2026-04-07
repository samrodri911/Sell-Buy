"use client";

import { useState, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
import { subscribeToMessages, sendMessage as sendMessageService } from "@/services/chat.service";
import { useAuth } from "@/hooks/useAuth";

export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { firebaseUser } = useAuth();

  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!firebaseUser) {
        setError("Debes estar logueado para enviar mensajes.");
        return;
      }
      if (!conversationId) {
        setError("No hay una conversación activa.");
        return;
      }

      setError(null);
      try {
        await sendMessageService(conversationId, text, firebaseUser.uid);
      } catch (err: any) {
        console.error("Error enviando mensaje:", err);
        setError("Error al enviar el mensaje. Inténtalo de nuevo.");
      }
    },
    [conversationId, firebaseUser]
  );

  return { messages, loading, error, sendMessage };
}
