import { useState, useCallback } from "react";
import { AI_ENABLED } from "@/lib/constants/ai";

export interface AIProductData {
  titulo: string;
  descripcion: string;
  categoria: string;
  precio_estimado?: {
    rango: string;
    moneda: string;
    justificacion: string;
    minimo_numerico: number;
  };
  palabras_clave: string[];
  atributos: {
    color?: string;
    condicion?: string;
    [key: string]: any;
  };
  confidencia?: "alta" | "baja";
  preguntas_dinamicas?: string[];
  error?: string; // Para identificar fallbacks como AI_UNAVAILABLE
}

export function useAIGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateProductData = useCallback(async (
    params: { nombre?: string; estado?: string; color?: string; targetAudience?: string; imageUrl?: string }
  ): Promise<AIProductData | null> => {
    
    // Si la IA está deshabilitada a nivel global, abortamos instantáneamente
    if (!AI_ENABLED) {
      setError("AI_UNAVAILABLE");
      return null;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generar-producto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        let errorMsg = "Error al completar datos con IA";
        try {
          const errRes = await res.json();
          if (errRes.error) errorMsg = errRes.error;
        } catch {
          // Fallback a texto si no es JSON
        }
        throw new Error(errorMsg);
      }

      const data: AIProductData = await res.json();
      
      if (data.error === "AI_UNAVAILABLE") {
        setError("AI_UNAVAILABLE");
        return null;
      }
      
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generateProductData, isGenerating, error, setError };
}
