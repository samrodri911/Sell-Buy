"use client";

import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const timeString = message.createdAt?.toDate 
    ? message.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex w-full mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
      <div 
        className={`max-w-[75%] px-4 py-3 rounded-2xl flex flex-col gap-1 shadow-sm ${
          isCurrentUser 
            ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-br-sm" 
            : "bg-[var(--color-surface)] text-[var(--color-on-surface)] border border-[var(--color-outline-variant)] rounded-bl-sm"
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        {timeString && (
          <span 
            className={`text-[10px] self-end mt-1 ${
              isCurrentUser ? "text-[var(--color-on-primary)]/70" : "text-[var(--color-on-surface-variant)]"
            }`}
          >
            {timeString}
          </span>
        )}
      </div>
    </div>
  );
}
