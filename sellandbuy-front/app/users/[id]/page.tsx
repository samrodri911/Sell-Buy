"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile, updateUserProfile } from '@/lib/services/user.service';
import { getProducts } from '@/services/product.service';
import { UserProfile } from '@/types/user';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/products/ProductCard';
import { Loader2, Edit3, X, Check, PackageOpen, Star, MapPin } from 'lucide-react';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { firebaseUser, refreshProfile } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwner = firebaseUser?.uid === userId;

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const [userProf, prodResult] = await Promise.all([
          getUserProfile(userId),
          getProducts({ sellerId: userId }) // Excludes disabled natively
        ]);
        setProfile(userProf);
        setEditName(userProf.displayName);
        setEditBio(userProf.bio || '');
        setProducts(prodResult.products);
      } catch (err: any) {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile(userId, { 
        displayName: editName, 
        bio: editBio 
      });
      setProfile(updated);
      setIsEditing(false);
      if (isOwner) await refreshProfile();
    } catch (err) {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !profile) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
         <h2 className="text-2xl font-bold text-neutral-800">Usuario no encontrado</h2>
       </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Header Profile */}
      <div className="bg-white border-b border-neutral-100 py-12 px-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start md:items-center">
          <img 
            src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName}&background=random`} 
            alt={profile.displayName} 
            className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4 max-w-lg">
                <input 
                  type="text" 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full text-2xl font-bold p-2 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-neutral-50"
                  placeholder="Nombre visible"
                />
                <textarea 
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full p-2 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-neutral-50 resize-none"
                  rows={3}
                  placeholder="Escribe algo sobre ti..."
                />
                <div className="flex gap-2">
                   <button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                     {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Guardar
                   </button>
                   <button onClick={() => setIsEditing(false)} disabled={saving} className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                     <X size={16} /> Cancelar
                   </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center sm:items-start flex-1 gap-2">
                  <h1 className="text-3xl font-black text-neutral-900 flex items-center gap-3">
                    {profile.displayName}
                    {isOwner && (
                      <button onClick={() => setIsEditing(true)} className="text-neutral-400 hover:text-indigo-600 transition-colors bg-neutral-100 p-2 rounded-full">
                         <Edit3 size={16} />
                      </button>
                    )}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm font-medium text-neutral-500">
                     <div className="flex items-center gap-1.5 text-amber-500">
                        <Star fill="currentColor" size={16} />
                        <span className="font-bold text-amber-600">{profile.sellerRating ? profile.sellerRating.toFixed(1) : 'Nuevo'}</span>
                        <span className="text-neutral-400">({profile.sellerRatingCount || 0} reseñas)</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <MapPin size={16} /> 
                       Miembro desde {profile.createdAt?.toDate?.()?.getFullYear?.() || new Date().getFullYear()}
                     </div>
                  </div>
                </div>
                <p className="text-neutral-500 mt-4 max-w-2xl whitespace-pre-wrap leading-relaxed">
                  {profile.bio || "Este usuario aún no tiene una biografía."}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User's Products */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-neutral-900 mb-8 border-b pb-4">
          Publicaciones de {profile.displayName.split(' ')[0]} ({products.length})
        </h2>
        
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm flex flex-col items-center">
            <PackageOpen size={48} className="text-neutral-300 mb-4" />
            <p className="text-neutral-500 text-lg">Aún no hay productos publicados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
