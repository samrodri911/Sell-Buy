# Sell&Buy — Marketplace Moderno

Plataforma de compra y venta desarrollada con **Next.js 16** y **Firebase**, diseñada para facilitar transacciones seguras entre compradores y vendedores con una experiencia de usuario moderna y escalable.

---

## Descripción

Sell&Buy es un marketplace full-stack que permite a los usuarios publicar productos, explorar catálogos, contactar vendedores y gestionar compras/ventas. La aplicación integra funcionalidades de IA para asistencia en la creación de publicaciones y utiliza Firebase como backend completo (autenticación, base de datos y almacenamiento).

---

## Características

- **Autenticación dual**: Google OAuth y email/contraseña
- **Marketplace público**: Catálogo de productos con filtros por categoría y ordenamiento
- **Gestión de productos**: CRUD completo con subida y compresión automática de imágenes
- **Sistema de mensajería**: Chat en tiempo real entre compradores y vendedores
- **Asistente de IA**: Generación asistida de títulos, descripciones y precios usando Google Gemini
- **Perfiles de usuario**: Dashboard de vendedor con estadísticas y productos publicados
- **Sistema de valoraciones**: Calificaciones y comentarios en productos
- **Diseño responsive**: Mobile-first con Tailwind CSS
- **Optimización de imágenes**: Compresión automática antes de subir a Firebase Storage

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript 5 |
| **Frontend UI** | React 19 + Tailwind CSS 4 |
| **Backend** | Firebase (Firestore, Auth, Storage) |
| **IA** | Google Generative AI (Gemini 2.5 Flash) |
| **Iconos** | Material Symbols + Lucide React |
| **Utilidades** | date-fns, browser-image-compression |

---

## Arquitectura

```
Sell-Buy/
├── sellandbuy-front/
│   ├── app/                      # Next.js App Router
│   │   ├── (protected)/          # Rutas autenticadas
│   │   ├── (auth)/               # Rutas de autenticación
│   │   ├── api/                  # API Routes (IA, webhooks)
│   │   ├── products/             # Páginas de productos
│   │   ├── messages/             # Sistema de mensajería
│   │   ├── dashboard/            # Panel de usuario
│   │   └── layout.tsx            # Layout raíz con providers
│   ├── components/
│   │   ├── ui/                   # Componentes base (Button, Input...)
│   │   ├── features/             # Componentes por feature
│   │   ├── chat/                 # Sistema de mensajería
│   │   └── layout/               # Navbar, MainLayout
│   ├── hooks/                    # Custom hooks (useAuth, useChat...)
│   ├── lib/                      # Configuraciones y utilidades
│   │   └── firebase/             # Firebase config y helpers
│   ├── services/                 # Capa de acceso a datos
│   ├── types/                    # Tipos TypeScript
│   ├── contexts/                 # React Context providers
│   └── public/                   # Assets estáticos
└── README.md
```

### Flujo de Datos

```
Componentes → Hooks → Services → Firebase / API Routes
```

- **Server Components**: Fetch de datos y SEO
- **Client Components**: Interactividad y estado local
- **API Routes**: Llamadas a IA (server-side para proteger API keys)

---

## Instalación

### Requisitos previos

- Node.js 20+
- npm, yarn, pnpm o bun
- Cuenta de Firebase con proyecto configurado
- API Key de Google Gemini (opcional, para IA)

### Pasos

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-repositorio/sell-and-buy.git
   cd sell-and-buy/sellandbuy-front
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   # o
   pnpm install
   # o
   bun install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env.local` en la raíz del frontend:

   ```env
   # Firebase Config
   NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-bucket.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=tu-app-id

   # Google Gemini AI (opcional)
   GEMINI_API_KEY=tu-gemini-api-key
   ```

4. **Configurar Firebase**

   - Habilita **Authentication** (Google + Email/Password)
   - Crea una base de datos **Firestore** en modo producción
   - Configura **Storage** para almacenamiento de imágenes
   - Copia las reglas de seguridad desde `firestore.rules` y `storage.rules`

5. **Iniciar servidor de desarrollo**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en `http://localhost:3000`

---

## Uso

### Para compradores

1. Explora el marketplace sin necesidad de cuenta
2. Filtra por categorías (Electrónica, Vehículos, Inmuebles, Hogar, Moda, Otros)
3. Ordena por precio o fecha de publicación
4. Contacta vendedores mediante el sistema de mensajería (requiere autenticación)

### Para vendedores

1. Inicia sesión o crea una cuenta
2. Accede al dashboard desde el menú de usuario
3. Crea productos con el asistente de IA opcional
4. Gestiona tus publicaciones (editar, pausar, vender)
5. Responde mensajes de compradores

### Comandos disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Ejecutar ESLint
```

---

## Estructura del Proyecto

### Directorios principales

| Directorio | Propósito |
|------------|-----------|
| `app/` | Rutas y páginas de la aplicación (App Router) |
| `components/` | Componentes React reutilizables |
| `hooks/` | Custom hooks para lógica compartida |
| `lib/` | Configuraciones, Firebase y utilidades |
| `services/` | Capa de acceso a Firestore y Storage |
| `types/` | Definiciones de tipos TypeScript |
| `contexts/` | Providers de React Context |

### Tipos de datos principales

- **Product**: Productos del marketplace con estado, precio, imágenes
- **User**: Perfiles de usuario con datos de Firebase Auth
- **Chat/Message**: Sistema de mensajería en tiempo real
- **Comment**: Comentarios y valoraciones en productos

---

## Uso de IA en el Desarrollo

Este proyecto fue desarrollado con la asistencia de herramientas de IA avanzadas:

- **Claude Code** (Anthropic): Refactorización UI/UX, implementación de features complejas
- **Agentes de IA especializados**: Documentación, testing y optimización de código
- **Antigravity**: Asistencia en desarrollo y debugging

### IA integrada en la aplicación

La plataforma incluye un asistente de IA para vendedores:

- **Generación de descripciones**: Títulos y textos persuasivos basados en imágenes
- **Sugerencia de precios**: Análisis de mercado local usando productos similares
- **Clasificación automática**: Detección de categoría y condición del producto
- **Keywords optimizadas**: Palabras clave para mejorar visibilidad

> **Nota**: La IA se ejecuta server-side mediante Route Handlers para proteger las API keys.

---

## Contribución

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Convenciones de commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `refactor:` Refactorización de código
- `style:` Cambios de estilo/UI
- `chore:` Tareas de mantenimiento
- `docs:` Documentación

---

## Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## Seguridad

- **Variables sensibles**: Todas las API keys están en `.env.local` (nunca commitear)
- **API Routes**: Las llamadas a IA se ejecutan server-side
- **Firebase Rules**: Reglas de seguridad configuradas en `firestore.rules` y `storage.rules`
- **Validación**: Inputs validados con TypeScript y validación en servidor

---

## Contacto

Para soporte o preguntas, abre un issue en el repositorio o contacta al equipo de desarrollo.
