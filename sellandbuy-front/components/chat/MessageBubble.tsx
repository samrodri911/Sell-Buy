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
            ? "bg-indigo-600 text-white rounded-br-sm" 
            : "bg-white text-neutral-800 border border-neutral-100 rounded-bl-sm"
        }`}
      >
        <p className="text-sm break-words whitespace-pre-wrap">{message.text}</p>
        {timeString && (
          <span 
            className={`text-[10px] self-end mt-1 ${
              isCurrentUser ? "text-indigo-200" : "text-neutral-400"
            }`}
          >
            {timeString}
          </span>
        )}
      </div>
    </div>
  );
}
