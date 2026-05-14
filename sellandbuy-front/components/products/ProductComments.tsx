"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addCommentAndUpdateRatings, getProductComments } from '@/services/comment.service';
import { Comment } from '@/types/comment';
import { Loader2, Star, Send } from 'lucide-react';

interface ProductCommentsProps {
  productId: string;
  sellerId: string;
}

export function ProductComments({ productId, sellerId }: ProductCommentsProps) {
  const { firebaseUser } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newText, setNewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      const { comments: fetched } = await getProductComments(productId, 15);
      setComments(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firebaseUser) return;
    if (newText.trim().length === 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await addCommentAndUpdateRatings(
        productId,
        sellerId,
        firebaseUser.uid,
        firebaseUser.displayName || 'Usuario',
        firebaseUser.photoURL,
        newText.trim(),
        newRating
      );
      setNewText('');
      setNewRating(5);
      loadComments();
    } catch (e: any) {
      setError(e.message || "Error al enviar comentario");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate if the current user already commented
  const hasCommented = comments.some(c => c.userId === firebaseUser?.uid);

  return (
    <div className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-outline-variant)] p-8 shadow-sm">
      <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-6">Comentarios y Reseñas</h3>

      {/* Review Form - Only if logged in, not the seller, and hasn't commented yet */}
      {firebaseUser && firebaseUser.uid !== sellerId && !hasCommented && (
        <form onSubmit={handleSubmit} className="mb-8 bg-[var(--color-surface-container)] p-6 rounded-2xl border border-[var(--color-outline-variant)]">
          <h4 className="font-semibold text-[var(--color-on-surface)] mb-3">Establecer calificación</h4>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewRating(star)}
                className={`transition-colors ${newRating >= star ? 'text-amber-400' : 'text-[var(--color-outline)]'}`}
              >
                <Star fill={newRating >= star ? "currentColor" : "none"} size={32} />
              </button>
            ))}
          </div>

          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="¿Qué te pareció este producto?"
            className="w-full p-4 bg-[var(--color-surface-container-highest)] border border-[var(--color-outline-variant)] rounded-xl focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-3 text-[var(--color-on-surface)] placeholder-[var(--color-outline)]"
            rows={3}
            required
          />

          {error && <div className="text-red-500 text-sm font-semibold mb-3">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting || newText.trim().length === 0}
            className="flex items-center justify-center gap-2 bg-[var(--color-inverse-surface)] hover:opacity-90 text-[var(--color-inverse-on-surface)] font-bold py-3 px-6 rounded-xl transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            Enviar Reseña
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {loading ? (
          <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
        ) : comments.length === 0 ? (
          <p className="text-[var(--color-on-surface-variant)] text-center py-4">Aún no hay reseñas para este producto. ¡Sé el primero!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 border-b border-[var(--color-outline-variant)] pb-6 last:border-0 last:pb-0">
              <div className="flex-shrink-0">
                {comment.userPhoto ? (
                  <img src={comment.userPhoto} alt={comment.userName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-on-primary-container)] font-bold">
                    {comment.userName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-[var(--color-on-surface)]">{comment.userName}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={14} fill={comment.rating >= s ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-[var(--color-outline)] mb-2">
                  {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString('es-CO') : 'Reciente'}
                </div>
                <p className="text-[var(--color-on-surface-variant)] leading-relaxed text-sm">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
