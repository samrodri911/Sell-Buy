import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  rango: string;
  justificacion: string;
}

export function AISuggestionBox({ rango, justificacion }: Props) {
  return (
    <div className="mt-2 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm transition-all shadow-sm">
      <p className="font-bold text-amber-800 flex items-center gap-1.5">
        <Sparkles size={16} className="text-amber-500" />
        Precio sugerido: <span className="font-mono bg-white px-2 py-0.5 rounded-md shadow-sm text-neutral-800 ml-1">{rango} COP</span>
      </p>
      <p className="text-amber-700/80 mt-2 text-xs leading-relaxed border-l-2 border-amber-200 pl-2">
        {justificacion}
      </p>
    </div>
  );
}
