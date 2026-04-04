"use client"
import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useProductActions } from '../../hooks/useProducts';
import { CreateProductInput, ProductCondition } from '../../types/product';
import { UploadCloud, X, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProductForm() {
  const { firebaseUser, loading: authLoading } = useAuth();
  const { createNewProduct, loading, error } = useProductActions();
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'COP',
    category: 'Electronics',
    condition: 'new' as ProductCondition,
    city: '',
    country: 'Colombia'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      addFiles(newFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Limit to 5 images max
    if (images.length + newFiles.length > 5) {
      alert("Puedes subir un máximo de 5 imágenes.");
      return;
    }
    
    setImages(prev => [...prev, ...newFiles]);
    
    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      // Revoke URL to avoid memory leaks
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    
    if (images.length === 0) {
      alert("Por favor añade al menos 1 imagen");
      return;
    }

    const payload: CreateProductInput = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      currency: formData.currency,
      category: formData.category,
      condition: formData.condition,
      location: {
        city: formData.city,
        country: formData.country,
      },
      tags: [], // Implementation of tags could be added later
      images: images, 
    };

    const newProduct = await createNewProduct(payload, firebaseUser.uid, firebaseUser.displayName || 'Seller', firebaseUser.photoURL);

    if (newProduct) {
      router.push(`/products/${newProduct.id}`);
    }
  };

  if (authLoading) {
    return <div className="p-8 text-center text-neutral-500">Cargando...</div>;
  }

  if (!firebaseUser) {
    return <div className="p-8 text-center bg-amber-50 text-amber-800 rounded-xl">Por favor, inicia sesión para publicar un producto.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-neutral-100">
      <div className="bg-neutral-900 p-8 text-white">
        <h2 className="text-3xl font-black mb-2 tracking-tight">Publicar Producto</h2>
        <p className="text-neutral-400">Detalla lo que vas a vender para atraer más compradores.</p>
      </div>

      <div className="p-8 space-y-8">
        
        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 border border-red-100">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Section: Images */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-neutral-800 border-b pb-2">Fotos del Producto</h3>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-neutral-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-neutral-50 hover:border-amber-400 transition-colors bg-white min-h-[200px]"
          >
            <UploadCloud size={40} className="text-neutral-400 mb-3" />
            <p className="font-semibold text-neutral-700">Haz clic para subir imágenes</p>
            <p className="text-sm text-neutral-400 mt-1">Soporta JPG, PNG (Max 5 imágenes)</p>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          {/* Previews */}
          {imagePreviews.length > 0 && (
            <div className="flex gap-4 overflow-x-auto py-2">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-sm group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700">Título del Anuncio</label>
            <input 
              type="text" 
              required 
              maxLength={70}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none"
              placeholder="Ej. iPhone 13 Pro Max 256GB"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Precio</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-medium">$</span>
              <input 
                type="number" 
                required 
                min="0"
                className="w-full p-3 pl-8 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none"
                placeholder="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Moneda</label>
            <select 
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.currency}
              onChange={e => setFormData({...formData, currency: e.target.value})}
            >
              <option value="COP">Pesos Colombianos (COP)</option>
              <option value="USD">Dólares (USD)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Categoría</label>
            <select 
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="Electronics">Electrónica y Tecnología</option>
              <option value="Vehicles">Vehículos</option>
              <option value="Real Estate">Inmuebles</option>
              <option value="Home">Hogar y Muebles</option>
              <option value="Fashion">Moda</option>
              <option value="Other">Otros</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">Condición</label>
            <div className="flex gap-4">
              <label className={`flex-1 p-3 border rounded-xl flex justify-center items-center cursor-pointer transition-colors ${formData.condition === 'new' ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' : 'bg-neutral-50 border-neutral-200 text-neutral-600'}`}>
                <input type="radio" name="condition" className="hidden" checked={formData.condition === 'new'} onChange={() => setFormData({...formData, condition: 'new'})} />
                Nuevo
              </label>
              <label className={`flex-1 p-3 border rounded-xl flex justify-center items-center cursor-pointer transition-colors ${formData.condition === 'used' ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' : 'bg-neutral-50 border-neutral-200 text-neutral-600'}`}>
                <input type="radio" name="condition" className="hidden" checked={formData.condition === 'used'} onChange={() => setFormData({...formData, condition: 'used'})} />
                Usado
              </label>
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700">Ciudad</label>
            <input 
              type="text" 
              required 
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Ej. Bogotá"
              value={formData.city}
              onChange={e => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-neutral-700">Descripción Detallada</label>
            <textarea 
              required 
              rows={5}
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-shadow outline-none resize-none"
              placeholder="Describe el producto, estado, detalles importantes..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-neutral-900/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                 <Loader2 size={24} className="animate-spin" />
                 Publicando Producto...
              </>
            ) : (
               'Publicar Producto'
            )}
           
          </button>
        </div>

      </div>
    </form>
  );
}
