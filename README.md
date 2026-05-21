# Sigmabuilder - Frontend

<div align="center">

<img src="./public/white-icon.svg" alt="SigmaBuilder Logo" width="250"/>

**Aplicación Cliente y Panel de Control para la plataforma SigmaBuilder**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

</div>

<br/>

<div align="center">

[Despliegue en Producción](#produccion) • [Stack Tecnológico](#stack) • [Instalación y Entorno Local](#instalacion) • [Testing Automático](#testing) • [Documentación Adicional](#documentacion) • [Arquitectura del Proyecto](#arquitectura) • [Contribuciones y Flujo de Trabajo](#contribuciones)

</div>

---

## 🚀 Descripción

El cliente de **SigmaBuilder** es la interfaz principal donde los usuarios interactúan con la plataforma. Proporciona el panel de control (Dashboard) para la gestión de proyectos y sitios, un sistema avanzado de arrastrar y soltar, editores de código integrados, y gestión de contenido modular (como blogs y portafolios). Está diseñado para ser rápido, reactivo y ofrecer una experiencia de usuario (UX) premium.

<a name="produccion"></a>
## 🌍 Despliegue en Producción

El proyecto está optimizado para desplegarse fácilmente en servicios de alojamiento de contenido estático o plataformas Serverless.
- **Build de Producción:** Ejecutando `npm run build` se generará la carpeta `dist` con los assets minificados y optimizados mediante Vite y TypeScript.
- **Hosting:** Esta carpeta `dist` puede ser desplegada de inmediato en plataformas como Vercel, Netlify, AWS S3 + CloudFront o GitHub Pages.
- **Variables de Entorno:** Durante el build en producción, asegúrate de configurar las variables apuntando a la URL del backend real.

<a name="stack"></a>
## 🛠 Stack Tecnológico

El frontend está construido utilizando los estándares modernos más robustos de desarrollo web:

- **Librería Principal:** React 19
- **Lenguaje:** TypeScript estricto para seguridad de tipos
- **Bundler y Servidor Local:** Vite (extremadamente rápido y ligero)
- **Estilos:** Tailwind CSS v4 para diseño dinámico, responsivo y mantenible
- **Componentes UI:** Shadcn UI (Radix UI + Tailwind), ofreciendo accesibilidad y componentes sin estilos preconcebidos
- **Iconografía:** Lucide React
- **Enrutamiento:** React Router DOM (v7)
- **Editores Avanzados:** Monaco Editor (para código fuente) y TipTap / Slate (para editores de texto enriquecido)
- **Peticiones HTTP:** Fetch nativo interactuando con utilidades compartidas en `src/lib/api.ts`

<a name="instalacion"></a>
## ⚙️ Instalación y Entorno Local

1. **Clonar el repositorio y acceder a la carpeta del cliente:**
   ```bash
   git clone https://github.com/SigmaBuilder/Client.git
   cd Client
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**
   Crea un archivo `.env.local` en la raíz (usualmente requieres apuntar al servidor backend local):
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Arrancar Servidor de Desarrollo:**
   ```bash
   npm run dev
   ```
   El servidor arrancará (normalmente en `http://localhost:5173`) con Hot Module Replacement (HMR) habilitado.

<a name="testing"></a>
## 🧪 Testing Automático

El código cliente hace un uso extensivo del sistema de tipos estricto de TypeScript como primera línea de defensa contra errores.

- **Type Checking:** Ejecuta `npm run build` (que invoca `tsc` internamente) para validar que no existan inconsistencias de tipos en toda la aplicación antes del empaquetado final.
- *(Nota: En futuras iteraciones se integrarán pruebas unitarias de componentes con Jest/Vitest y pruebas E2E con Cypress o Playwright).*

<a name="documentacion"></a>
## 📄 Documentación Adicional

- En el directorio `src/types/` se encuentran todas las interfaces (ej. `project.ts`, `auth.ts`, `api.ts`), las cuales definen de forma estricta los contratos que debe cumplir el backend.
- La aplicación implementa Dark Mode de forma nativa a través de `next-themes` y las variables de Tailwind configuradas en `src/styles/global.css`.

<a name="arquitectura"></a>
## 📂 Arquitectura del Proyecto

El código fuente sigue un patrón modular dentro de `src`, separando UI, lógica y servicios:

```text
Client/
├── public/                 # Assets públicos estáticos (íconos, imágenes)
├── src/
│   ├── components/         # Bloques de construcción visual de la aplicación
│   │   ├── account/        # Componentes para la gestión de la cuenta y perfil de usuario
│   │   ├── auth/           # Formularios de login, signup y headers de autenticación
│   │   ├── landing/        # Componentes de la página de inicio/presentación
│   │   ├── project/        # Interfaces del entorno de edición y creación de proyectos
│   │   ├── shared/         # Componentes transversales usados en toda la app
│   │   ├── site/           # Componentes específicos para el renderizado del sitio
│   │   ├── ui/             # Sistema de diseño central (componentes de Shadcn UI)
│   │   └── upload/         # Interfaces para subida y manejo de archivos/media
│   ├── hooks/              # Custom hooks de React (manejo de estado global, auth, móvil)
│   ├── layouts/            # Plantillas maestras de diseño estructural
│   │   ├── GlobalLayout.tsx    # Layout general raíz
│   │   ├── DashboardLayout.tsx # Layout del panel de usuario
│   │   ├── ProjectLayout.tsx   # Envoltorio para un proyecto individual
│   │   └── SiteLayout.tsx      # Envoltorio de un sitio específico
│   ├── lib/                # Utilidades, configuración de API HTTP y utilitarios de auth
│   ├── pages/              # Vistas completas de la aplicación ruteadas en la URL
│   │   ├── dashboard/      # Vistas internas tras hacer login
│   │   └── login, signup...# Vistas principales de sesión e inicio
│   ├── router/             # Definición y configuración de rutas (React Router)
│   ├── styles/             # CSS Global, configuración de fuentes e inicialización de Tailwind
│   ├── types/              # Definiciones de interfaces TypeScript (.ts)
│   ├── main.tsx            # Punto de entrada de la aplicación React
│   └── vite-env.d.ts       # Tipado de entorno de Vite
├── vite.config.ts          # Configuración del bundler y plugins
├── tsconfig.json           # Configuración del compilador TypeScript
└── package.json            # Dependencias del proyecto
```

<a name="contribuciones"></a>
## 🤝 Contribuciones y Flujo de Trabajo

Para mantener el código estable y organizado en el frontend:
1. **Ramas (Branches):** Trabaja siempre en ramas descriptivas a partir de `dev` (ej. `feat/nueva-interfaz`, `fix/boton-roto`).
2. **Componentes Reutilizables:** Antes de crear un componente genérico nuevo, revisa si puede construirse utilizando las primitivas de `src/components/ui` y Shadcn.
3. **Pull Requests (PR):** Cuando acabes, abre un PR hacia `dev`. Asegúrate de no tener advertencias de tipado TypeScript ni errores en consola.
4. **Clean Code:** Mantén los componentes funcionales e idealmente por debajo de las 200 líneas, delegando lógica pesada en `hooks/` o archivos en `lib/`.

---
**Autores:** Rubén Morales & Diego Puértolas