"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ConversationList } from "@/components/chat/ConversationList";
import { MainLayout } from "@/components/layout/MainLayout";

export default function MessagesPage() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/");
    }
  }, [firebaseUser, loading, router]);

  if (loading || !firebaseUser) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[--color-primary] border-t-transparent"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideBottomNav={true}> {/* We might want bottom nav, but messages is an app-like view */}
      <div className="flex flex-col h-[calc(100vh-140px)] max-h-[800px] mt-2 sm:mt-6 bg-[var(--color-surface)] rounded-t-[32px] sm:rounded-[32px] shadow-sm border border-[var(--color-outline-variant)] overflow-hidden">
        
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List container - full width on mobile, side panel on desktop */}
          <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface)]">
            <ConversationList />
          </div>

          {/* Chat placeholder - hidden on mobile, visible on desktop */}
          <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[var(--color-surface-container-lowest)]">
             <div className="text-center p-8 max-w-sm">
                <div className="w-24 h-24 bg-[var(--color-surface)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-[var(--color-outline-variant)]">
                   <span className="material-symbols-outlined text-[48px] text-[var(--color-outline)]">forum</span>
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-2">Tus mensajes</h2>
                <p className="text-[var(--color-on-surface-variant)]">
                   Selecciona un chat de la lista lateral para ver la conversación completa o iniciar un nuevo trato.
                </p>
             </div>
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
