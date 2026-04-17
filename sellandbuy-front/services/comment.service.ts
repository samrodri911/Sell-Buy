import { db } from "@/lib/firebase/firestore";
import { 
  collection, 
  doc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  runTransaction,
  Timestamp,
  startAfter,
  DocumentSnapshot
} from "firebase/firestore";
import { Comment } from "@/types/comment";

export async function addCommentAndUpdateRatings(
  productId: string, 
  sellerId: string, 
  userId: string,
  userName: string,
  userPhoto: string | null,
  text: string, 
  rating: number
): Promise<void> {
  const commentRef = doc(db, "products", productId, "comments", userId);
  const productRef = doc(db, "products", productId);
  const sellerRef = doc(db, "users", sellerId);

  await runTransaction(db, async (transaction) => {
    // 1. Read Product and Seller
    const productSnap = await transaction.get(productRef);
    const sellerSnap = await transaction.get(sellerRef);

    if (!productSnap.exists()) throw new Error("Product not found");
    if (!sellerSnap.exists()) throw new Error("Seller not found");

    const productData = productSnap.data();
    const sellerData = sellerSnap.data();

    // Prevent submitting more than 1 rating
    const commentSnap = await transaction.get(commentRef);
    if (commentSnap.exists()) throw new Error("Ya has comentado este producto.");

    // Calculate new Product Rating
    const currentProductRating = productData.rating || 0;
    const currentProductCount = productData.ratingCount || 0;
    const newProductCount = currentProductCount + 1;
    const newProductRating = ((currentProductRating * currentProductCount) + rating) / newProductCount;

    // Calculate new Seller Rating
    const currentSellerRating = sellerData.sellerRating || 0;
    const currentSellerCount = sellerData.sellerRatingCount || 0;
    const newSellerCount = currentSellerCount + 1;
    const newSellerRating = ((currentSellerRating * currentSellerCount) + rating) / newSellerCount;

    // 2. Perform writes
    transaction.set(commentRef, {
      userId,
      userName,
      userPhoto,
      text,
      rating,
      createdAt: Timestamp.now()
    });

    transaction.update(productRef, {
      rating: newProductRating,
      ratingCount: newProductCount
    });

    transaction.update(sellerRef, {
      sellerRating: newSellerRating,
      sellerRatingCount: newSellerCount
    });
  });
}

export async function getProductComments(productId: string, limitNumber = 10, lastDoc?: DocumentSnapshot) {
  let q = query(
    collection(db, "products", productId, "comments"),
    orderBy("createdAt", "desc"),
    limit(limitNumber)
  );

  // If using pagination
  if (lastDoc) {
    q = query(
      collection(db, "products", productId, "comments"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(limitNumber)
    );
  }

  const snapshot = await getDocs(q);
  const comments = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];

  const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  return { comments, lastDoc: newLastDoc };
}
