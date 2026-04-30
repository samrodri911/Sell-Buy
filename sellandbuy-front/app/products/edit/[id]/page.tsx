"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductForm } from '../../../../components/products/ProductForm';
import { getProductById } from '../../../../services/product.service';
import { Product } from '../../../../types/product';
import { MainLayout } from '@/components/layout/MainLayout';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getProductById(id);
        if (data) setProduct(data);
        else router.push('/products');
      } catch (error) {
        console.error(error);
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id, router]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideBottomNav={true}>
      <ProductForm initialData={product || undefined} />
    </MainLayout>
  );
}
