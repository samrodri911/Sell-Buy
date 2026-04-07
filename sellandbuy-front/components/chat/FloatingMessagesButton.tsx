"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname } from "next/navigation";

export function FloatingMessagesButton() {
  const { firebaseUser, loading } = useAuth();
  const pathname = usePathname();

  // No mostrar en la vista de mensajes ni si no está logueado
  if (loading || !firebaseUser || pathname?.startsWith("/messages")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link 
        href="/messages"
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group"
      >
        <MessageSquare size={24} />
      </Link>
    </div>
  );
}
