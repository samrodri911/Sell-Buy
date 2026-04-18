interface SellerInsightsCardProps {
  responseRate?: number;   // 0-100
  avgShippingDays?: number;
  memberSince?: number;    // full year e.g. 2021
}

/**
 * Seller Insights sidebar card — purely presentational.
 */
export function SellerInsightsCard({
  responseRate = 0,
  avgShippingDays,
  memberSince,
}: SellerInsightsCardProps) {
  return (
    <div className="bg-[--color-surface-container-low] p-6 rounded-3xl">
      <h4 className="font-bold mb-4 flex items-center gap-2 text-[--color-on-surface]">
        <span className="material-symbols-outlined text-[--color-primary]">insights</span>
        Estadísticas del vendedor
      </h4>

      <div className="space-y-4">
        {/* Response rate */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-[--color-on-surface-variant]">Tasa de respuesta</span>
            <span className="text-sm font-bold text-[--color-primary]">{responseRate}%</span>
          </div>
          <div className="w-full bg-[--color-surface-container-high] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[--color-primary] h-full rounded-full transition-all duration-500"
              style={{ width: `${responseRate}%` }}
            />
          </div>
        </div>

        {/* Avg shipping */}
        {avgShippingDays !== undefined && (
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-[--color-on-surface-variant]">Envío promedio</span>
            <span className="text-sm font-bold text-[--color-primary]">
              {avgShippingDays} {avgShippingDays === 1 ? "día" : "días"}
            </span>
          </div>
        )}

        {/* Member since */}
        {memberSince && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-[--color-on-surface-variant]">Miembro desde</span>
            <span className="text-sm font-bold text-[--color-on-surface]">{memberSince}</span>
          </div>
        )}
      </div>
    </div>
  );
}
