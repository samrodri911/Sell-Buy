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
      className="p-4 bg-[var(--color-surface)] border-t border-[var(--color-outline-variant)] flex items-end gap-2 isolate"
    >
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje..."
        className="flex-1 bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] resize-none overflow-y-auto min-h-[44px] max-h-[120px] text-[var(--color-on-surface)] placeholder-[var(--color-outline)]"
        rows={1}
        disabled={isSending || loading}
      />
      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`p-3 rounded-full flex flex-shrink-0 items-center justify-center transition-all ${
          isButtonDisabled 
            ? "bg-[var(--color-surface-container-high)] text-[var(--color-outline)] cursor-not-allowed" 
            : "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-container)] shadow-sm hover:shadow-md hover:shadow-[var(--color-primary)]/20"
        }`}
      >
        <SendHorizontal size={20} className={isSending ? "animate-pulse" : ""} />
      </button>
    </form>
  );
}
