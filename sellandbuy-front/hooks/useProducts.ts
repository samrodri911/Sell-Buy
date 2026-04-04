import { useState } from "react";
import { createProduct as createProductService, updateProduct as updateProductService, deleteProduct as deleteProductService } from "../services/product.service";
import { CreateProductInput, Product, UpdateProductInput } from "../types/product";

export function useProductActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNewProduct = async (
    data: CreateProductInput,
    userId: string,
    userName: string,
    userPhoto: string | null
  ): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const newProduct = await createProductService(data, userId, userName, userPhoto);
      setLoading(false);
      return newProduct;
    } catch (err: any) {
      setError(err.message || "Failed to create product");
      setLoading(false);
      return null;
    }
  };

  const editProduct = async (productId: string, data: UpdateProductInput): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await updateProductService(productId, data);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update product");
      setLoading(false);
      return false;
    }
  };

  const removeProduct = async (productId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await deleteProductService(productId);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to delete product");
      setLoading(false);
      return false;
    }
  }

  return { createNewProduct, editProduct, removeProduct, loading, error };
}
