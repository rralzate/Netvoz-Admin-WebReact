# Netvoz Admin - Módulo Administrativo de Suscripciones

Aplicación web React para la gestión administrativa de suscripciones de Netvoz.

## Características

- ✅ React 19 con TypeScript
- ✅ Vite como build tool
- ✅ Tailwind CSS + Vanilla Extract para estilos
- ✅ shadcn/ui para componentes UI
- ✅ React Router para navegación
- ✅ TanStack Query para gestión de estado del servidor
- ✅ Zustand para estado global
- ✅ i18next para internacionalización
- ✅ Tema claro/oscuro
- ✅ Arquitectura limpia (Clean Architecture)

## Estructura del Proyecto

```
src/
├── core/              # Funcionalidades core de la aplicación
│   ├── api/          # Clientes API
│   ├── layouts/      # Layouts de la aplicación
│   ├── locales/      # Configuración de i18n
│   ├── routes/      # Configuración de rutas
│   ├── store/       # Estado global (Zustand)
│   ├── theme/        # Sistema de temas
│   └── utils/        # Utilidades
├── features/         # Módulos de funcionalidades
│   └── subscriptions/ # Módulo de suscripciones
│       ├── data/     # Capa de datos
│       ├── domain/   # Lógica de negocio
│       └── presentation/ # Capa de presentación
├── components/       # Componentes reutilizables
└── ui/              # Componentes UI base (shadcn/ui)
```

## Instalación

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Construir para producción
pnpm build

# Vista previa de producción
pnpm preview
```

## Configuración

Copia `.env.example` a `.env` y configura las variables de entorno:

```env
VITE_APP_DEFAULT_ROUTE=/subscriptions
VITE_APP_PUBLIC_PATH=/
VITE_APP_API_BASE_URL=https://netvozposapitest-fdhfeaekhthge8eh.eastus-01.azurewebsites.net
VITE_APP_ROUTER_MODE=frontend
```

## Tecnologías

- **React 19**: Framework UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool
- **Tailwind CSS**: Framework CSS
- **shadcn/ui**: Componentes UI
- **React Router**: Enrutamiento
- **TanStack Query**: Gestión de estado del servidor
- **Zustand**: Estado global
- **i18next**: Internacionalización

## Desarrollo

La aplicación está estructurada siguiendo principios de Clean Architecture, separando las responsabilidades en capas:

- **Presentation**: Componentes React y hooks
- **Domain**: Entidades y casos de uso
- **Data**: Repositorios y fuentes de datos

## Licencia

Propietario - Netvoz
