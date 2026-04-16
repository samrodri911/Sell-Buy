import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, FileText, X, Loader2 } from 'lucide-react';
import { useAIGenerator, AIProductData } from '@/hooks/useAIGenerator';
import { AIUnavailableBanner } from './AIUnavailableBanner';
import { AIImageUploader } from './AIImageUploader';
import { AI_ENABLED } from '@/lib/constants/ai';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AIProductData) => void;
}

export function AIHelperModal({ isOpen, onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<'text' | 'vision'>('text');
  const [promptTexto, setPromptTexto] = useState('');
  const [dynamicQuestions, setDynamicQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Just locally store imageURL if needed for retries
  const [visionImageUrl, setVisionImageUrl] = useState<string | null>(null);

  const { generateProductData, isGenerating } = useAIGenerator();

  if (!isOpen) return null;

  const handleGenerateText = async () => {
    if (!promptTexto) return;
    const data = await generateProductData({ nombre: promptTexto });
    if (data && !data.error) {
      onSuccess(data);
      onClose();
    }
  };

  const handleImageUploaded = async (url: string) => {
    setVisionImageUrl(url);
    const data = await generateProductData({ imageUrl: url });
    
    if (data && !data.error) {
      if (data.confidencia === 'baja' && data.preguntas_dinamicas && data.preguntas_dinamicas.length > 0) {
        setDynamicQuestions(data.preguntas_dinamicas);
      } else {
        onSuccess(data);
        onClose();
      }
    }
  };

  const handleAnswersSubmit = async () => {
    // Collect answers into a string
    const targetAudience = dynamicQuestions.map((q, i) => `Q: ${q} A: ${answers[i] || 'No sé'}`).join(' | ');
    const data = await generateProductData({ imageUrl: visionImageUrl || undefined, targetAudience });
    
    if (data && !data.error) {
      onSuccess(data);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="bg-neutral-900 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="text-indigo-400" size={20} />
            Asistente IA
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 h-[400px] overflow-y-auto w-[100%] max-w-[100vw]">
          
          {!AI_ENABLED ? (
            <div className="mb-4">
              <AIUnavailableBanner />
              <div className="mt-6 opacity-40 pointer-events-none filter select-none">
                {/* Mock UI para mostrar q hay debajo */}
                <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl mb-6">
                  <button className="flex-1 py-2 font-medium bg-white shadow-sm rounded-lg text-indigo-700">✍️ Describir</button>
                  <button className="flex-1 py-2 font-medium text-neutral-500">📸 Usar Foto</button>
                </div>
                <div className="h-32 border-2 border-dashed border-neutral-300 rounded-xl"></div>
              </div>
            </div>
          ) : (
            <>
              {dynamicQuestions.length > 0 ? (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-neutral-800">Casi listos...</h3>
                  <p className="text-sm text-neutral-600">La imagen no es completamente clara. Responde brevemente para mayor precisión:</p>
                  
                  {dynamicQuestions.map((q, i) => (
                    <div key={i} className="space-y-1">
                      <label className="text-sm font-semibold text-neutral-700">{q}</label>
                      <input 
                        type="text"
                        className="w-full p-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={answers[i] || ''}
                        onChange={(e) => setAnswers({...answers, [i]: e.target.value})}
                      />
                    </div>
                  ))}

                  <button 
                    onClick={handleAnswersSubmit}
                    disabled={isGenerating}
                    className="w-full mt-4 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 flex justify-center gap-2"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                    Generar 
                  </button>
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div className="flex gap-2 p-1 bg-neutral-100 rounded-xl mb-6">
                    <button 
                      onClick={() => setTab('text')}
                      className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'text' ? 'bg-white text-indigo-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'}`}
                    >
                      <FileText size={16} /> Describe
                    </button>
                    <button 
                      onClick={() => setTab('vision')}
                      className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'vision' ? 'bg-white text-indigo-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'}`}
                    >
                      <ImageIcon size={16} /> Foto (IA)
                    </button>
                  </div>

                  {tab === 'text' && (
                    <div className="space-y-4 animate-fade-in">
                      <label className="block text-sm font-semibold text-neutral-700">
                        Describe tu producto
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Ej. Consola PS5 en caja casi nueva con 2 controles y un juego de regalo..."
                        className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        value={promptTexto}
                        onChange={e => setPromptTexto(e.target.value)}
                        disabled={isGenerating}
                      />
                      <p className="text-xs text-neutral-500">Hint: Incluye marca, estado, uso, accesorios, detalles importantes.</p>
                      
                      <button 
                        onClick={handleGenerateText}
                        disabled={!promptTexto || isGenerating}
                        className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                        Generar con IA
                      </button>
                    </div>
                  )}

                  {tab === 'vision' && (
                    <div className="animate-fade-in relative">
                      <AIImageUploader onImageReady={handleImageUploaded} disabled={isGenerating} />
                      {isGenerating && (
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 rounded-xl">
                          <Loader2 className="animate-spin text-indigo-600 mb-2" size={40} />
                          <p className="font-bold text-indigo-900">Analizando Imagen...</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
}
