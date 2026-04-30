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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4 border border-neutral-100">
          <MessageSquare className="text-neutral-400" size={24} />
        </div>
        <h3 className="font-semibold text-neutral-800 mb-1">No tienes mensajes</h3>
        <p className="text-sm text-neutral-500">
          Cuando contactes a un vendedor o un comprador te escriba, aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white border-r border-neutral-100">
      <div className="p-4 border-b border-neutral-100/80 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Mensajes</h2>
      </div>
      
      <div className="divide-y divide-neutral-100">
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
              className={`block hover:bg-neutral-50/80 transition-colors ${isActive ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : ''}`}
            >
              <div className="p-4 flex gap-4 items-center">
                
                {/* Avatar with fallback */}
                <div className="relative flex-shrink-0">
                  {conv.otherUserPhoto ? (
                    <img 
                      src={conv.otherUserPhoto} 
                      alt={conv.otherUserName || "Usuario"} 
                      className="w-12 h-12 rounded-full object-cover border border-neutral-100"
                      onError={(e) => {
                         // Fallback on error
                         (e.target as HTMLImageElement).style.display = 'none';
                         (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border border-neutral-100
                    ${!conv.otherUserPhoto ? "bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700" : "hidden bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500"}
                  `}>
                    {conv.otherUserName ? conv.otherUserName.charAt(0).toUpperCase() : '?'}
                  </div>
                  {/* Subtle indicator for product image */}
                  {conv.productImage && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white bg-white overflow-hidden shadow-sm">
                      <img src={conv.productImage} className="w-full h-full object-cover" />
                    </div>
                  )}
                  {/* Mock Online Indicator (UX requirement) */}
                  <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`font-semibold truncate pr-2 ${isActive ? 'text-indigo-900' : 'text-neutral-900'}`}>
                      {conv.otherUserName}
                    </h3>
                    <span className="text-[11px] text-neutral-400 flex-shrink-0 whitespace-nowrap">
                      {timeAgo}
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <p className={`text-xs truncate ${isActive ? 'text-indigo-700/80' : 'text-neutral-500'}`}>
                      {conv.productTitle}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate ${isActive ? 'text-neutral-800' : 'text-neutral-500'} ${unreads > 0 ? 'font-bold text-neutral-900' : ''}`}>
                      {conv.lastMessage || <span className="italic text-neutral-400">Nuevo chat...</span>}
                    </p>
                    {unreads > 0 && !isActive && (
                      <span className="bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">
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
