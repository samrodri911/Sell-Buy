import React from 'react';
import { ProductForm } from '../../../components/products/ProductForm';
import { MainLayout } from '@/components/layout/MainLayout';

export default function CreateProductPage() {
  return (
    <MainLayout hideBottomNav={true}>
      <ProductForm />
    </MainLayout>
  );
}
