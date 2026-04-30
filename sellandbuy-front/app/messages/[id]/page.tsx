"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ConversationList } from "@/components/chat/ConversationList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Package } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";

export default function ChatPage() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const { conversations, loading: convsLoading } = useConversations();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.replace("/");
    }
  }, [firebaseUser, authLoading, router]);

  // Authorization check
  useEffect(() => {
    if (convsLoading || !firebaseUser || !id) return;
    
    // Si ya cargaron las conversaciones, verificar si el ID actual está en la lista
    // La suscripción de firebase ya filtra por participantes
    const exists = conversations.some(c => c.id === id);
    setIsAuthorized(exists);
    
    if (!exists && conversations.length > 0) {
      // Si cargó, hay conversaciones y esta no está = no autorizado
      router.replace("/messages");
    }
  }, [conversations, convsLoading, firebaseUser, id, router]);

  if (authLoading || !firebaseUser) {
    return null;
  }

  // Find current conversation metadata for header
  const currentConv = conversations.find(c => c.id === id);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col sm:pt-8 sm:p-2 md:p-8">
      <div className="max-w-6xl w-full mx-auto flex-1 flex flex-col bg-white rounded-t-3xl sm:rounded-3xl shadow-sm border border-neutral-200 overflow-hidden relative">
        
        <div className="flex-1 flex overflow-hidden">
          {/* Conversation List container - hidden on mobile when in chat, side panel on desktop */}
          <div className="hidden md:flex w-80 lg:w-96 flex-shrink-0 flex-col border-r border-neutral-100 bg-white">
            <ConversationList />
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-neutral-50 relative min-w-0">
             
             {/* Chat Header */}
             <div className="bg-white/80 backdrop-blur-md border-b border-neutral-100 p-4 sticky top-0 z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                   <Link href="/messages" className="md:hidden flex items-center gap-1 p-2 -ml-2 mr-1 hover:bg-neutral-100 rounded-xl transition-colors text-indigo-600 font-medium text-sm">
                     <ArrowLeft size={20} />
                     <span className="hidden sm:inline">Volver</span>
                   </Link>
                   
                   {currentConv ? (
                     <div className="flex items-center gap-3 min-w-0 border-l border-neutral-200/60 pl-2 sm:pl-0 sm:border-0">
                        <div className="relative flex-shrink-0">
                           {currentConv.otherUserPhoto ? (
                             <img 
                               src={currentConv.otherUserPhoto} 
                               alt={currentConv.otherUserName || "Usuario"} 
                               className="w-10 h-10 rounded-full object-cover border border-neutral-100"
                             />
                           ) : (
                             <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                               {currentConv.otherUserName?.[0]?.toUpperCase() || '?'}
                             </div>
                           )}
                        </div>
                        <div className="min-w-0 pr-2">
                           <h2 className="font-bold text-neutral-900 truncate">
                             {currentConv.otherUserName || "Usuario eliminado"}
                           </h2>
                           <Link 
                             href={`/products/${currentConv.productId}`}
                             className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group truncate"
                           >
                              <Package size={12} className="flex-shrink-0" />
                              <span className="truncate">{currentConv.productTitle}</span>
                              <ExternalLink size={10} className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all flex-shrink-0" />
                           </Link>
                        </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 animate-pulse" />
                        <div>
                           <div className="w-24 h-4 bg-neutral-100 animate-pulse rounded mb-1" />
                           <div className="w-32 h-3 bg-neutral-100 animate-pulse rounded" />
                        </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Chat messages instance */}
             {isAuthorized !== false ? (
               <ChatWindow conversationId={id} />
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
                 <p className="text-neutral-500 mb-4">No tienes acceso a esta conversación.</p>
                 <Link href="/messages" className="text-indigo-600 font-medium">Volver a mensajes</Link>
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
