import { db } from "@/lib/firebase/firestore";
import { storage } from "@/lib/firebase/storage";
import { auth } from "@/lib/firebase/auth";
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
  deleteDoc,
  QueryConstraint,
  limit,
  Timestamp,
  startAfter,
  DocumentSnapshot
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import imageCompression from "browser-image-compression";
import { Product, CreateProductInput, UpdateProductInput } from "../types/product";

const COLLECTION_NAME = "products";

// Convert Firestore representation to Frontend typed representation
const mapDocToProduct = (docId: string, data: any): Product => {
  return {
    id: docId,
    ...data,
    // Safely parse timestamps into numbers
    createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
    updatedAt: data.updatedAt?.toMillis ? data.updatedAt.toMillis() : (data.updatedAt || Date.now()),
  } as Product;
};

/**
 * Uploads media files to Firebase Storage with compression for images.
 */
async function uploadMediaFiles(files: File[], userId: string, productId: string): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    let fileToUpload = file;
    // Compress image if it's an image file
    if (file.type.startsWith("image/")) {
      const options = {
        maxSizeMB: 1, // 1MB max target
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      try {
        fileToUpload = await imageCompression(file, options);
      } catch (error) {
        console.warn("Image compression failed, using original file:", error);
      }
    }

    const extension = fileToUpload.name.split('.').pop();
    const filePath = `products/${userId}/${productId}/image-${index}-${Date.now()}.${extension}`;
    const storageRef = ref(storage, filePath);
    
    // Direct upload for simplicity. In a more complex scenario, you'd use progress observers.
    const snapshot = await uploadBytesResumable(storageRef, fileToUpload);
    return await getDownloadURL(snapshot.ref);
  });

  return Promise.all(uploadPromises);
}

/**
 * Creates a new product, handles image uploading and compression automatically.
 */
export async function createProduct(
  data: CreateProductInput, 
  userId: string, 
  userName: string, 
  userPhoto: string | null
): Promise<Product> {
  // 🔒 Backend guard: only verified users can publish products
  const currentUser = auth.currentUser;
  if (!currentUser?.emailVerified) {
    throw new Error("EMAIL_NOT_VERIFIED");
  }

  try {
    const productRef = doc(collection(db, COLLECTION_NAME));
    const productId = productRef.id;

    // 1. Upload Images
    const imageUrls = await uploadMediaFiles(data.images, userId, productId);

    // 2. Build Document Payload
    const now = Timestamp.now();
    const productPayload = {
      ...data,
      images: imageUrls,
      sellerId: userId,
      sellerName: userName,
      sellerPhoto: userPhoto,
      status: "active",
      views: 0,
      likes: 0,
      rating: 0,
      ratingCount: 0,
      quantity: data.quantity ?? 1,
      // 🔍 Enables case-insensitive prefix search in Firestore
      title_lowercase: (data.title ?? "").toLowerCase().trim(),
      createdAt: now,
      updatedAt: now,
    };
    
    // remove purely frontend properties
    delete (productPayload as any).imagesForm; 

    // 3. Save to Firestore
    await setDoc(productRef, productPayload);
    
    return mapDocToProduct(productId, productPayload);
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create product");
  }
}

/**
 * Fetches a product by its ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return mapDocToProduct(docSnap.id, docSnap.data());
    }
    return null;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw new Error("Failed to fetch product");
  }
}

interface FetchProductsResult {
  products: Product[];
  lastDocs: DocumentSnapshot | null;
}

/**
 * List active products with optional filters, optimized for Firestore (no joins).
 */
export async function getProducts(
  constraints: { category?: string; status?: string; sellerId?: string; limitNumber?: number } = {},
  lastDocSnap?: DocumentSnapshot
): Promise<FetchProductsResult> {
  try {
    const queries: QueryConstraint[] = [];
    
    if (constraints.sellerId) {
      queries.push(where("sellerId", "==", constraints.sellerId));
    }

    if (constraints.status) {
      queries.push(where("status", "==", constraints.status));
    } else if (!constraints.sellerId) {
      queries.push(where("status", "==", "active"));
    } else {
      // Si buscamos por seller sin estado específico, ignorar los borrados
      queries.push(where("status", "in", ["active", "sold", "paused"]));
    }

    if (constraints.category) {
      queries.push(where("category", "==", constraints.category));
    }

    // Always sort by creation time descending inside this scope
    queries.push(orderBy("createdAt", "desc"));

    if (constraints.limitNumber) {
      queries.push(limit(constraints.limitNumber));
    } else {
      queries.push(limit(20)); // Default limit
    }

    if (lastDocSnap) {
      queries.push(startAfter(lastDocSnap));
    }

    const q = query(collection(db, COLLECTION_NAME), ...queries);
    const snapshot = await getDocs(q);
    
    const products = snapshot.docs.map(doc => mapDocToProduct(doc.id, doc.data()));
    const lastDocs = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

    return { products, lastDocs };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}

export async function updateProduct(productId: string, data: UpdateProductInput, sellerId?: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    
    // Handle image deletion from storage
    if (data.imagesToDelete && data.imagesToDelete.length > 0) {
      const deletePromises = data.imagesToDelete.map(async (url) => {
        try {
          const fileRef = ref(storage, url);
          await deleteObject(fileRef);
        } catch (e) {
          console.warn("Could not delete image from storage:", url, e);
        }
      });
      await Promise.all(deletePromises);
    }

    // Handle new images upload
    let newUrls: string[] = [];
    if (data.newImages && data.newImages.length > 0 && sellerId) {
      newUrls = await uploadMediaFiles(data.newImages, sellerId, productId);
    }

    // Prepare final payload
    const finalUpdate: any = { ...data, updatedAt: Timestamp.now() };
    delete finalUpdate.imagesToDelete;
    delete finalUpdate.newImages;

    if (newUrls.length > 0) {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentImages = docSnap.data().images || [];
        // Extract surviving existing images (excluding imagesToDelete if the UI didn't already exclude them from the update payload)
        // Actually, the UI should send the updated `images` string array in `data.images`.
        // We just append newUrls to `data.images`
        finalUpdate.images = [...(data.images || currentImages), ...newUrls];
      }
    }

    // Keep title_lowercase in sync when title changes
    if (data.title !== undefined) {
      finalUpdate.title_lowercase = data.title.toLowerCase().trim();
    }

    await updateDoc(docRef, finalUpdate);
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
}

/**
 * Deletes a product (Hard delete)
 * Alternatively, change status to 'paused' using updateProduct.
 */
export async function deleteProduct(productId: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, productId);
    await deleteDoc(docRef);
    // Note: To fully clean up, you should ideally also delete the images from Storage here or via Cloud Functions.
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
}

/**
 * Case-insensitive substring search on product titles and descriptions.
 * Fetches recent active products and filters in memory to support
 * matching any part of the text (Firebase limitation workaround).
 */
export async function searchProducts(
  term: string,
  limitNumber = 50
): Promise<Product[]> {
  if (!term.trim()) return [];

  const normalizedTerms = term.toLowerCase().trim().split(/\s+/);

  // Firestore no soporta búsquedas por substring (LIKE %term%) de forma nativa.
  // Para lograr que busque "por cada letra" (substring) en cualquier parte del texto, 
  // obtenemos los productos activos más recientes y los filtramos en memoria.
  const q = query(
    collection(db, COLLECTION_NAME),
    where("status", "==", "active"),
    orderBy("createdAt", "desc"),
    limit(200) // Espacio de búsqueda: los 200 productos activos más recientes
  );

  const snapshot = await getDocs(q);
  const products = snapshot.docs.map((d) => mapDocToProduct(d.id, d.data()));

  const filtered = products.filter((p) => {
    const title = (p.title || "").toLowerCase();
    const desc = (p.description || "").toLowerCase();
    
    // El producto debe coincidir con todos los términos de búsqueda tipeados
    return normalizedTerms.every(
      word => title.includes(word) || desc.includes(word)
    );
  });

  return filtered.slice(0, limitNumber);
}
