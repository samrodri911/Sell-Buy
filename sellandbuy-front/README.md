

# Sell&Buy

Sell&Buy es una plataforma de compra y venta moderna, diseñada para facilitar las transacciones entre compradores y
vendedores. El proyecto fue desarrollado con un enfoque en la escalabilidad y la experiencia del usuario.

## Características


- **Interfaz Moderna**: Diseño limpio y fácil de usar.

- **Backend Escalable**: Arquitectura robusta para manejar alta carga.

- **Integración de IA**: Opcional uso de inteligencia artificial para mejorar la experiencia del usuario.


## Tecnologías


- **Frontend**: Next.js, React

- **Backend**: Node.js, Firebase

- **Base de Datos**: Firestore

- **Autenticación**: Firebase Auth

- **Subida de Archivos**: Firebase Storage


## Arquitectura


La arquitectura del proyecto está dividida en dos partes principales: el frontend y el backend.


### Frontend


El frontend se desarrolla con Next.js, lo que permite una aplicación universal y un excelente rendimiento. El proyecto
utiliza componentes reutilizables y hooks personalizados para gestionar la lógica de negocio.


### Backend


El backend está basado en Node.js y utiliza Firebase para el manejo de autenticación, almacenamiento de datos y subida
de archivos. La arquitectura es escalable y puede ser fácilmente extendida.


## Instalación


Para instalar y ejecutar el proyecto localmente, sigue estos pasos:


1. Clona el repositorio:
   ```bash
   git clone https://github.com/tu-repositorio/sell-and-buy.git
   cd sell-and-buy

 2 Instala las dependencias:


   npm install

   # o

   yarn install

   # o

   pnpm install

   # o

   bun install

 3 Configura las variables de entorno en un archivo .env.local basado en el ejemplo .env.example.
 4 Inicia el servidor de desarrollo:


   npm run dev

   # o

   yarn dev

   # o

   pnpm dev

   # o

   bun dev



Uso

Para usar la plataforma, sigue estos pasos:

 1 Abre http://localhost:3000 en tu navegador.
 2 Inicia sesión con Google o crea una cuenta nueva.


Estructura del Proyecto

La estructura del proyecto está organizada de la siguiente manera:

 • app/: Contiene los componentes y páginas principales de la aplicación.
 • components/: Componentes reutilizables para la interfaz de usuario.
 • hooks/: Hooks personalizados para gestionar lógica de negocio.
 • lib/: Servicios y funciones auxiliares.
 • services/: Servicios para interactuar con Firebase y otras APIs.
 • types/: Tipos de datos utilizados en el proyecto.


Uso de IA en el Desarrollo

El proyecto incluye la opción de integrar inteligencia artificial para mejorar la experiencia del usuario. La IA se
utiliza en funciones como la generación de productos y sugerencias de precios.