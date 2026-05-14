"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { useChat } from "@/hooks/useChat";
import { Loader2 } from "lucide-react";

interface ChatWindowProps {
  conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { firebaseUser } = useAuth();
  const { messages, loading, error, sendMessage } = useChat(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface-container-lowest)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--color-surface-container-lowest)] p-6 text-center">
        <div className="bg-[var(--color-error-container)] text-[var(--color-on-error-container)] px-4 py-3 rounded-xl text-sm border border-[var(--color-error)]/20">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[var(--color-surface-container-lowest)] relative overflow-hidden h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroller">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-center">
            <div className="max-w-xs text-[var(--color-on-surface-variant)]">
              <div className="bg-[var(--color-surface)] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-[var(--color-outline-variant)]">
                <span className="text-2xl">👋</span>
              </div>
              <p className="text-sm font-medium">¡Inicia la conversación!</p>
              <p className="text-xs mt-1">Escribe un mensaje abajo para comenzar.</p>
            </div>
          </div>
        ) : (
          <div className="pb-2">
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                isCurrentUser={msg.senderId === firebaseUser?.uid} 
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSendMessage={sendMessage} />
      
      <style jsx>{`
        .scroller::-webkit-scrollbar {
          width: 6px;
        }
        .scroller::-webkit-scrollbar-track {
          background: transparent;
        }
        .scroller::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
