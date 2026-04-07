import { db } from "@/lib/firebase/firestore";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  addDoc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  Unsubscribe
} from "firebase/firestore";
import { Conversation, Message } from "@/types/chat";
import { getProductById } from "./product.service";
import { getUserProfile } from "@/lib/services/user.service";

const CONVERSATIONS_COLLECTION = "conversations";

export async function createOrGetConversation(
  productId: string,
  buyerId: string,
  sellerId: string
): Promise<string> {
  // 1. Check if conversation already exists
  const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
  const q = query(
    conversationsRef,
    where("participants", "array-contains", buyerId)
  );

  const snapshot = await getDocs(q);
  
  const existingConversation = snapshot.docs.find(doc => {
    const data = doc.data();
    return data.productId === productId && data.participants.includes(sellerId);
  });

  if (existingConversation) {
    return existingConversation.id;
  }

  // 2. Create new conversation
  const newConversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
  
  const now = serverTimestamp();
  await setDoc(newConversationRef, {
    id: newConversationRef.id,
    productId,
    participants: [buyerId, sellerId],
    lastMessage: "",
    createdAt: now,
    updatedAt: now
  });

  return newConversationRef.id;
}

export async function sendMessage(
  conversationId: string,
  text: string,
  senderId: string
): Promise<void> {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`);
  const now = serverTimestamp();
  
  // 1. Add message
  await addDoc(messagesRef, {
    text: trimmedText,
    senderId,
    createdAt: now
  });

  // 2. Update conversation
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: trimmedText,
    updatedAt: now
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const messagesRef = collection(db, `${CONVERSATIONS_COLLECTION}/${conversationId}/messages`);
  const q = query(messagesRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        createdAt: data.createdAt || Timestamp.now() // Handle pending writes
      } as Message;
    });
    callback(messages);
  });
}

export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe {
  const conversationsRef = collection(db, CONVERSATIONS_COLLECTION);
  const q = query(
    conversationsRef,
    where("participants", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const promises = snapshot.docs.map(async (connDoc) => {
      const data = connDoc.data();
      const conversation = {
        id: connDoc.id,
        productId: data.productId,
        participants: data.participants,
        lastMessage: data.lastMessage,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
      } as Conversation;
      
      return await enrichConversation(conversation, userId);
    });

    const conversations = await Promise.all(promises);
    callback(conversations);
  });
}

export async function enrichConversation(
  conversation: Conversation,
  currentUserId: string
): Promise<Conversation> {
  const enriched = { ...conversation };
  const otherUserId = conversation.participants.find(id => id !== currentUserId);

  if (otherUserId) {
    try {
      const otherUser = await getUserProfile(otherUserId);
      enriched.otherUserName = otherUser.displayName;
      enriched.otherUserPhoto = otherUser.photoURL;
    } catch (error) {
      console.error("Error fetching other user profile:", error);
      enriched.otherUserName = "Usuario eliminado";
      enriched.otherUserPhoto = ""; // Default avatar will be handled by UI
    }
  }

  try {
    const product = await getProductById(conversation.productId);
    if (product) {
      enriched.productTitle = product.title;
      enriched.productImage = product.images?.[0] || "";
    } else {
       // Product doesn't exist anymore
       enriched.productTitle = "Producto no disponible";
       enriched.productImage = "";
    }
  } catch (error) {
     console.error("Error fetching product data:", error);
     enriched.productTitle = "Producto no disponible";
     enriched.productImage = "";
  }

  return enriched;
}
