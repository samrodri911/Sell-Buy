"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => Promise<void>;
  loading?: boolean;
}

export function ChatInput({ onSendMessage, loading = false }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending || loading) return;

    try {
      setIsSending(true);
      await onSendMessage(trimmed);
      setText("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isButtonDisabled = !text.trim() || isSending || loading;

  return (
    <form 
      onSubmit={handleSubmit}
      className="p-4 bg-white border-t border-neutral-100 flex items-end gap-2 isolate"
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        className="flex-1 bg-neutral-50 border border-neutral-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none overflow-y-auto min-h-[44px] max-h-[120px]"
        rows={1}
        disabled={isSending || loading}
      />
      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`p-3 rounded-full flex flex-shrink-0 items-center justify-center transition-all ${
          isButtonDisabled 
            ? "bg-neutral-100 text-neutral-400 cursor-not-allowed" 
            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md hover:shadow-indigo-600/20"
        }`}
      >
        <SendHorizontal size={20} className={isSending ? "animate-pulse" : ""} />
      </button>
    </form>
  );
}
