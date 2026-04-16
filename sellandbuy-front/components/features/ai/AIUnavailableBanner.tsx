import React from "react";
import { AlertCircle } from "lucide-react";

export function AIUnavailableBanner() {
  return (
    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
      <AlertCircle className="text-orange-500 mt-0.5 shrink-0" size={20} />
      <div>
        <h4 className="font-bold text-orange-800">IA no disponible temporalmente</h4>
        <p className="text-sm text-orange-700 mt-1 leading-relaxed">
          La función de IA no está disponible en esta versión beta por costos operativos. 
          Pronto será habilitada. Puedes seguir creando productos manualmente.
        </p>
      </div>
    </div>
  );
}
