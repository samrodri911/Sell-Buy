import { Timestamp } from "firebase/firestore";

export interface Comment {
  id: string; // The user ID writing the comment
  userId: string;
  userName: string;
  userPhoto: string | null;
  text: string;
  rating: number; // 1-5
  createdAt: Timestamp;
}
