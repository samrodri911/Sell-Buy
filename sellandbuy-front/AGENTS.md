# AGENT.md — Sell & Buy Marketplace con IA

> Documento de referencia para agentes de IA y desarrolladores que trabajen en este proyecto.
> Seguir estas reglas garantiza consistencia, mantenibilidad y calidad en todo el codebase.

---

## 📁 Estructura del Proyecto

```
Sell-Buy/
├── sellandbuy-front/          # Next.js App Router (TypeScript)
│   │   ├── app/               # Rutas (App Router)
│   │   │   ├── (auth)/        # Rutas de autenticación (route group)
│   │   │   ├── (marketplace)/ # Rutas del marketplace (route group)
│   │   │   ├── api/           # Route Handlers (API endpoints)
│   │   │   └── layout.tsx     # Layout raíz
│   │   ├── components/
│   │   │   ├── ui/            # Componentes base reutilizables (Button, Input, Modal...)
│   │   │   ├── features/      # Componentes por feature (ProductCard, AIScanner...)
│   │   │   └── layouts/       # Layouts compartidos (Navbar, Footer, Sidebar)
│   │   ├── lib/
│   │   │   ├── firebase/      # Config y helpers de Firebase
│   │   │   ├── ai/            # Integración con Claude API (scan + descripción)
│   │   │   └── utils/         # Utilidades genéricas
│   │   ├── hooks/             # Custom React hooks
│   │   ├── store/             # Estado global (Zustand o Context)
│   │   ├── types/             # Tipos TypeScript compartidos
│   │   └── constants/         # Constantes de la app
│   ├── public/
│   ├── .env.local             # Variables de entorno (NUNCA commitear)
│   ├── tailwind.config.ts
│   └── next.config.ts
└── AGENT.md
```

---

## ⚙️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Lenguaje | TypeScript (strict mode) |
| Estilos | Tailwind CSS v3 |
| Backend / DB | Firebase (Firestore, Auth, Storage) |
| IA | Anthropic Claude API (visión + texto) |
| Estado global | Zustand (preferido) o React Context |
| Formularios | React Hook Form + Zod |
| Testing | Vitest + React Testing Library |

---

## 🏗️ Arquitectura y Patrones

### Principios Generales

- **Separation of Concerns**: lógica de negocio fuera de los componentes UI. Los componentes solo renderizan.
- **Single Responsibility**: cada archivo, función y componente hace una sola cosa.
- **DRY**: antes de crear algo nuevo, buscar si ya existe en `components/ui/` o `lib/`.
- **Fail Fast**: validar inputs lo antes posible (Zod en formularios, tipos estrictos en funciones).

### Organización por Features

Cuando una feature crece, agruparla en su propia carpeta:

```
src/components/features/
├── ai-scanner/
│   ├── AIScanner.tsx          # Componente principal
│   ├── AIScanner.test.tsx     # Tests
│   ├── useAIScanner.ts        # Hook con la lógica
│   └── types.ts               # Tipos propios del feature
├── product-listing/
│   ├── ProductCard.tsx
│   ├── ProductGrid.tsx
│   └── useProducts.ts
```

### Flujo de Datos

```
UI Component → Custom Hook → lib/firebase o lib/ai → Firebase / Claude API
```

- Los componentes **nunca** llaman directamente a Firebase o a la API de Claude.
- Toda lógica async va en **custom hooks** o **Route Handlers** (`app/api/`).
- Las llamadas a Claude API deben ir siempre **server-side** (Route Handlers o Server Components) para proteger la API key.

---

## 🤖 Integración de IA (Claude API)

### Reglas Obligatorias

1. **Nunca exponer `ANTHROPIC_API_KEY` al cliente.** Toda llamada a Claude va por un Route Handler en `app/api/`.
2. Las imágenes para escaneo se suben primero a Firebase Storage, luego se pasa la URL al Route Handler.
3. Siempre manejar errores de la API (rate limits, timeouts) con mensajes amigables al usuario.

### Estructura del Route Handler de IA

```typescript
// src/app/api/ai/scan-product/route.ts
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic(); // usa ANTHROPIC_API_KEY del env

export async function POST(req: NextRequest) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl requerido" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: imageUrl },
            },
            {
              type: "text",
              text: `Eres un experto en ventas online. Analiza esta imagen de producto y genera:
1. Título atractivo (máx 60 caracteres)
2. Descripción de venta persuasiva (máx 150 palabras)
3. Categoría sugerida
4. Condición estimada (nuevo, como nuevo, usado, para reparar)
5. Rango de precio sugerido en COP

Responde en JSON con las claves: title, description, category, condition, priceRange.`,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Respuesta inesperada de Claude");

    const parsed = JSON.parse(content.text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error en scan-product:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 }
    );
  }
}
```

### Hook para consumir el scanner

```typescript
// src/hooks/useAIScanner.ts
import { useState } from "react";

interface ScanResult {
  title: string;
  description: string;
  category: string;
  condition: string;
  priceRange: string;
}

export function useAIScanner() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  const scanProduct = async (imageUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/scan-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (!res.ok) throw new Error("Error al escanear");
      const data: ScanResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return { scanProduct, isLoading, error, result };
}
```

---

## 🔥 Firebase — Reglas y Buenas Prácticas

### Estructura de Firestore

```
/users/{userId}
  - displayName: string
  - email: string
  - photoURL: string
  - createdAt: Timestamp

/products/{productId}
  - title: string
  - description: string
  - price: number
  - category: string
  - condition: string
  - images: string[]         # URLs de Firebase Storage
  - sellerId: string         # ref a /users/{userId}
  - status: "active" | "sold" | "paused"
  - createdAt: Timestamp
  - aiGenerated: boolean     # indica si la descripción fue generada por IA

/chats/{chatId}
  - participants: string[]
  - productId: string
  - lastMessage: string
  - updatedAt: Timestamp
```

### Reglas de Seguridad (Security Rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /products/{productId} {
      allow read: if true; // marketplace público
      allow create: if request.auth != null
        && request.resource.data.sellerId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.sellerId;
    }
  }
}
```

### Helpers de Firebase

```typescript
// src/lib/firebase/products.ts
import { db, storage } from "./config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadProductImage(file: File, userId: string): Promise<string> {
  const path = `products/${userId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createProduct(data: Omit<Product, "id" | "createdAt">) {
  return addDoc(collection(db, "products"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
```

---

## 🎨 UI/UX — Guía de Diseño

### Principios de Diseño

1. **Mobile-first**: diseñar primero para móvil, luego escalar a desktop.
2. **Consistencia visual**: usar siempre los tokens de color/spacing definidos en `tailwind.config.ts`.
3. **Feedback inmediato**: toda acción del usuario debe tener respuesta visual (loading, éxito, error).
4. **Accesibilidad (a11y)**: usar etiquetas semánticas, `aria-*` donde corresponda, contraste mínimo WCAG AA.

### Sistema de Colores (definir en tailwind.config.ts)

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        primary: "#6366F1",    // Indigo — acciones principales
        secondary: "#EC4899",  // Pink — destacados / badges
        success: "#10B981",    // Verde — confirmaciones
        warning: "#F59E0B",    // Amber — advertencias
        danger: "#EF4444",     // Rojo — errores / eliminar
        surface: "#F9FAFB",    // Fondo de cards
      },
    },
  },
}
```

### Componentes UI Base (src/components/ui/)

Cada componente base debe:
- Aceptar `className` para extensión externa.
- Tener variantes definidas (ej. Button: `primary | secondary | ghost | danger`).
- Ser completamente tipado con TypeScript.

```typescript
// src/components/ui/Button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  children,
  className,
  ...props
}: ButtonProps) {
  const base = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-brand-primary text-white hover:bg-indigo-700",
    secondary: "bg-white text-brand-primary border border-brand-primary hover:bg-indigo-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-brand-danger text-white hover:bg-red-600",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {isLoading ? <span className="animate-spin mr-2">⏳</span> : null}
      {children}
    </button>
  );
}
```

### UX para el AI Scanner

- Mostrar un skeleton/shimmer mientras Claude procesa la imagen.
- Si la IA genera una descripción, mostrarla en un campo editable — el usuario debe poder corregirla antes de publicar.
- Mostrar badge "✨ Generado con IA" en los productos con `aiGenerated: true`.
- Limitar el tamaño de imagen a subir (máx 5MB, formatos jpg/png/webp).

---

## 📝 Convenciones de Código

### TypeScript

```typescript
// ✅ Siempre tipar explícitamente los props de componentes
interface ProductCardProps {
  product: Product;
  onBuy?: (id: string) => void;
}

// ✅ Usar tipos en lugar de interfaces para unions/intersections
type ProductStatus = "active" | "sold" | "paused";

// ❌ Nunca usar `any`
const data: any = response; // MAL
const data: Product = response; // BIEN
```

### Nombrado

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase con `use` | `useProducts.ts` |
| Utilidades | camelCase | `formatPrice.ts` |
| Tipos/Interfaces | PascalCase | `type Product` |
| Constantes | UPPER_SNAKE_CASE | `MAX_IMAGE_SIZE` |
| Variables/funciones | camelCase | `fetchProducts()` |

### Estructura de un Componente

```typescript
// Orden estándar dentro de un componente:
// 1. Imports
// 2. Types/Interfaces locales
// 3. Constantes locales
// 4. Componente (hooks al inicio, lógica, render)
// 5. Subcomponentes pequeños del mismo archivo (si aplica)
// 6. Export

"use client"; // solo si necesita interactividad

import { useState } from "react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

const PLACEHOLDER_IMAGE = "/images/placeholder.webp";

export function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleWishlist = () => setIsWishlisted((prev) => !prev);

  return (
    <article className="...">
      {/* render */}
    </article>
  );
}
```

### Server vs Client Components

```typescript
// ✅ Por defecto: Server Component (sin "use client")
// Úsalo para: fetch de datos, acceso a Firebase Admin, SEO

// ✅ "use client" solo cuando:
// - Usas useState, useEffect, useRef
// - Manejas eventos (onClick, onChange)
// - Usas librerías que necesitan el DOM

// ❌ No poner "use client" en layouts ni en componentes de página
// si pueden ser Server Components
```

---

## 🔐 Seguridad

- Todas las variables sensibles en `.env.local` — **nunca** en el código.
- Variables públicas (accesibles en cliente): prefijo `NEXT_PUBLIC_`.
- Variables privadas (solo server): sin prefijo (ej. `ANTHROPIC_API_KEY`, `FIREBASE_ADMIN_KEY`).
- Validar con Zod **todos** los inputs de formularios y de Route Handlers.
- Sanitizar nombres de archivos antes de subir a Storage.
- Implementar rate limiting en los Route Handlers de IA para evitar abusos.

```typescript
// .env.local (ejemplo)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
ANTHROPIC_API_KEY=sk-ant-...          # NUNCA con NEXT_PUBLIC_
FIREBASE_ADMIN_PRIVATE_KEY=...        # NUNCA con NEXT_PUBLIC_
```

---

## ✅ Testing

- Cada hook y utilidad debe tener tests unitarios en Vitest.
- Los componentes críticos (AIScanner, ProductForm) deben tener tests con React Testing Library.
- Naming: `ComponentName.test.tsx` junto al archivo que prueba.
- Cobertura mínima objetivo: **70%** en `lib/` y `hooks/`.

---

## 🚀 Performance

- Usar `next/image` para todas las imágenes — nunca `<img>` directamente.
- Lazy load de componentes pesados con `dynamic(() => import(...))`.
- Paginar resultados de Firestore (`.limit(20)` + cursor).
- Memoizar con `useMemo`/`useCallback` solo donde haya evidencia de problema de rendimiento.
- Optimizar imágenes antes de subir a Storage (canvas resize client-side).

---

## 📦 Git y Commits

### Branches

```
main          → producción (protegida)
develop       → integración
feature/...   → nuevas features (ej. feature/ai-scanner)
fix/...       → corrección de bugs
```

### Commits (Conventional Commits)

```
feat: agregar escáner de productos con IA
fix: corregir carga de imágenes en mobile
refactor: extraer lógica de Firebase a lib/firebase
style: mejorar diseño de ProductCard
chore: actualizar dependencias
```

---

## 🧩 Checklist antes de hacer PR

- [ ] El código compila sin errores TypeScript (`tsc --noEmit`)
- [ ] No hay `console.log` de debug en el código
- [ ] No hay `any` types nuevos introducidos
- [ ] Las variables de entorno sensibles no están expuestas al cliente
- [ ] Los inputs de formularios están validados con Zod
- [ ] Las llamadas a Claude API van por Route Handler (no desde el cliente)
- [ ] Las imágenes usan `next/image`
- [ ] Los componentes nuevos tienen sus tipos definidos
- [ ] Tailwind: no hay estilos inline si pueden resolverse con clases