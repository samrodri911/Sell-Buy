import { Timestamp } from "firebase/firestore";

export interface Conversation {
  id: string;
  productId: string;
  participants: [string, string]; // [userId1, userId2]
  lastMessage: string;
  updatedAt: Timestamp;
  createdAt: Timestamp;
  // Campos enriquecidos (no almacenados en Firestore, poblados en el frontend)
  productTitle?: string;
  productImage?: string;
  otherUserName?: string;
  otherUserPhoto?: string;
  unreadCount?: Record<string, number>;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Timestamp;
}
