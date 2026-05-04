# Referencia para Claude Code — Sell & Buy Marketplace

## 🚀 Antes de empezar, recuerda:

### 1. Nunca exponer variables sensibles al cliente
- `ANTHROPIC_API_KEY` → solo en Route Handlers (`app/api/`)
- `FIREBASE_ADMIN_PRIVATE_KEY` → server-side only
- Validar inputs con Zod siempre

### 2. Flujo de datos correcto
```
Componente UI → Hook custom → lib/* → Firebase / Claude API
```
- **Nunca** llamar directamente a Firebase desde el componente
- Imágenes → subir a Storage primero → luego URL al Route Handler de IA

### 3. Server vs Client Components
- **Por defecto**: Server Component (sin `"use client"`)
- `"use client"` solo si:
  - `useState`, `useEffect`, `useRef`
  - Manejo de eventos (`onClick`, `onChange`)
  - Librerías que necesitan el DOM

### 4. UI/UX
- **Mobile-first**
- Feedback inmediato (loading, éxito, error)
- Badge "✨ Generado con IA" para productos con `aiGenerated: true`
- Skeleton/shimmer mientras Claude procesa

### 5. Estructura de features
```
components/features/
├── ai-scanner/
│   ├── AIScanner.tsx
│   ├── useAIScanner.ts
│   └── types.ts
└── product-listing/
    └── ProductCard.tsx
```

### 6. Convenciones
- Componentes: PascalCase (`ProductCard.tsx`)
- Hooks: camelCase con `use` (`useProducts.ts`)
- Tipos: interfaces o `type` para unions
- No usar `any`

### 7. Firebase Structure
```
/users/{userId}
/products/{productId}
/chats/{chatId}
```

### 8. Colores brand
- Primary: `#6366F1` (Indigo)
- Secondary: `#EC4899` (Pink)
- Success: `#10B981`
- Danger: `#EF4444`

---

*Este archivo se actualiza con feedback durante el desarrollo.*
