"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ConversationList } from "@/components/chat/ConversationList";
import Link from "next/link";
import { Home } from "lucide-react";

export default function MessagesPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/");
    }
  }, [firebaseUser, loading, router]);

  if (loading || !firebaseUser) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col pt-4 sm:pt-8 md:p-8">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden">
        
        {/* Simple Header */}
        <div className="bg-white border-b border-neutral-100 p-4 flex items-center gap-4">
           <Link href="/dashboard" className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-neutral-900">
             <Home size={20} />
           </Link>
           <h1 className="font-bold text-neutral-900">Mis Mensajes</h1>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List container - full width on mobile, side panel on desktop */}
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-neutral-100 bg-white">
            <ConversationList />
          </div>

          {/* Chat placeholder - hidden on mobile, visible on desktop */}
          <div className="hidden md:flex flex-1 items-center justify-center bg-neutral-50">
             <div className="text-center p-8">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <span className="text-3xl">💬</span>
                </div>
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Tus conversaciones</h2>
                <p className="text-neutral-500 max-w-sm mx-auto">
                   Selecciona un chat de la lista para ver los mensajes.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
