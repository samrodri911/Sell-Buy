import React from 'react';
import { ProductForm } from '../../../components/products/ProductForm';

export default function CreateProductPage() {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto">
        <ProductForm />
      </div>
    </div>
  );
}
