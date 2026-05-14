"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Conversation } from "@/types/chat";
import { formatDistanceToNowStrict } from "date-fns";
import { es } from "date-fns/locale";
import { useConversations } from "@/hooks/useConversations";
import { useAuth } from "@/hooks/useAuth";
import { markConversationAsRead } from "@/services/chat.service";
import { Loader2, MessageSquare, AlertCircle } from "lucide-react";

export function ConversationList() {
  const { conversations, loading, error } = useConversations();
  const { firebaseUser } = useAuth();
  const pathname = usePathname();

  // Extract ID from /messages/[id]
  const currentConversationId = pathname?.split('/').pop();
  const currentUserId = firebaseUser?.uid || "";

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 p-8">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>Error al cargar chats</span>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface)]">
        <div className="w-16 h-16 bg-[var(--color-surface-container)] rounded-full flex items-center justify-center mb-4 border border-[var(--color-outline-variant)]">
          <MessageSquare className="text-[var(--color-outline)]" size={24} />
        </div>
        <h3 className="font-semibold text-[var(--color-on-surface)] mb-1">No tienes mensajes</h3>
        <p className="text-sm text-[var(--color-on-surface-variant)]">
          Cuando contactes a un vendedor o un comprador te escriba, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--color-surface)] border-r border-[var(--color-outline-variant)]">
      <div className="p-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold text-[var(--color-on-surface)] tracking-tight">Mensajes</h2>
      </div>
      
      <div className="divide-y divide-[var(--color-outline-variant)]">
        {conversations.map((conv) => {
          const isActive = currentConversationId === conv.id;
          const timeAgo = conv.updatedAt?.toDate 
            ? formatDistanceToNowStrict(conv.updatedAt.toDate(), { locale: es, addSuffix: true })
            : '';
            
          const unreads = conv.unreadCount?.[currentUserId] || 0;

          return (
            <Link 
              key={conv.id} 
              href={`/messages/${conv.id}`}
              onClick={() => {
                if (unreads > 0) {
                  markConversationAsRead(conv.id, currentUserId);
                }
              }}
              className={`block hover:bg-[var(--color-surface-container)] transition-colors ${isActive ? 'bg-[var(--color-surface-container-high)] hover:bg-[var(--color-surface-container-highest)]' : ''}`}
            >
              <div className="p-4 flex gap-4 items-center">
                
                {/* Avatar with fallback */}
                <div className="relative flex-shrink-0">
                  {conv.otherUserPhoto ? (
                    <img 
                      src={conv.otherUserPhoto} 
                      alt={conv.otherUserName || "Usuario"} 
                      className="w-12 h-12 rounded-full object-cover border border-[var(--color-outline-variant)]"
                      onError={(e) => {
                         // Fallback on error
                         (e.target as HTMLImageElement).style.display = 'none';
                         (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-[var(--color-outline-variant)]
                    ${!conv.otherUserPhoto ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]" : "hidden bg-[var(--color-surface-container-high)] text-[var(--color-outline)]"}
                  `}>
                    {conv.otherUserName ? conv.otherUserName.charAt(0).toUpperCase() : '?'}
                  </div>
                  {/* Subtle indicator for product image */}
                  {conv.productImage && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-[var(--color-surface)] bg-[var(--color-surface)] overflow-hidden shadow-sm">
                      <img src={conv.productImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* Mock Online Indicator (UX requirement) */}
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--color-surface)] shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold truncate pr-2 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface)]'}`}>
                      {conv.otherUserName}
                    </h3>
                    <span className="text-[11px] text-[var(--color-on-surface-variant)] flex-shrink-0 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <p className={`text-xs truncate ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)]'}`}>
                      {conv.productTitle}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate ${isActive ? 'text-[var(--color-on-surface)]' : 'text-[var(--color-on-surface-variant)]'} ${unreads > 0 ? 'font-bold text-[var(--color-on-surface)]' : ''}`}>
                      {conv.lastMessage || <span className="italic text-[var(--color-outline)]">Nuevo chat...</span>}
                    </p>
                    {unreads > 0 && !isActive && (
                      <span className="bg-[var(--color-primary)] text-[var(--color-on-primary)] text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                        {unreads}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
