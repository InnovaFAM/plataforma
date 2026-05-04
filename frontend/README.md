## README

Plataforma de Gestión de Personas de FAM

cambios por stage

Aplicación web para la gestión de personas en FAM, incluyendo funcionalidades como:

- Gestión de certificaciones
- Gestión de faenas
- Gestión de roles
- Gestión de clientes
- Gestión de servicios
- Vista de colaboradores
- Analítica: horas hombre
- Analítica: gestión de servicios
- Gestión de usuarios y permisos (admin)
- Perfil de usuario y configuración

## Tecnologías utilizadas:

- Next.js
- TypeScript
- Tailwind CSS
- ApexCharts
- React-hook-form
- Tanstack
- Zod
- Zustand

## Scripts disponibles:

```json
{
    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
    }
}
```

## Estructura del proyecto

- `public/`: Archivos estáticos (imágenes, fuentes, etc.)
- `messages/`: Archivos de traducción i18n
- `src/`: Código fuente de la aplicación
    - `auth/`: Lógica de autenticación y autorización
    - `middleware/`: Middlewares de Next.js para autenticación, redirecciones, etc.
    - `components/`: Componentes reutilizables
    - `configs/`: Configuraciones de navegación, iconos, etc.
    - `constants/`: Constantes globales
    - `i18n/`: Funciones y hooks para internacionalización
    - `mock/`: Datos de prueba y mocks
    - `server/`: Código relacionado con la API y lógica de backend
    - `services/`: Lógica de fetching client y llamadas a APIs
    - `tanstack/`: Configuraciones y hooks relacionados con Tanstack Query
    - `utils/`: Funciones utilitarias
    - `app/`: Rutas y páginas de la aplicación
        - `layout.tsx`: Layout principal de la aplicación
        - `page.tsx`: Página de inicio
        - `not-found.tsx`: Página 404
        - `api/`: Rutas de API (Next.js API Routes)
        - `(auth-pages)/`: Rutas de autenticación (login, registro, etc.)
        - `(protected-pages)/`: Rutas que requieren autenticación
            - `analytics/`: Vistas de analítica
            - `backoffice/`: Vistas de administración
            - `certifications/`: Vistas relacionadas con certificaciones
            - `collaborators/`: Vistas relacionadas con colaboradores
            - `home/`: Vista principal después del login
            - `roles-users/`: Vistas relacionadas con roles y usuarios
            - `services/`: Vistas relacionadas con servicios
            - `user-profile/`: Vistas relacionadas con el perfil de usuario
            - `example/`: Estructura de ejemplo para nuevas secciones
                - `page.tsx`: Página principal de la sección
                - `layout.tsx`: Layout específico para esta sección (opcional)
                - `types.ts`: Tipos específicos de esta sección (opcional)
                - `_components/`: Componentes específicos de esta sección
                - `_store/`: Zustand store específico de esta sección (opcional)
                - `_utils/`: Funciones utilitarias específicas de esta sección (opcional)
                - `[slug]/`: Rutas dinámicas para esta sección (opcional)
                    - `page.tsx`: Página para la ruta dinámica
                    - `layout.tsx`: Layout para la ruta dinámica (opcional)
- `next.config.js`: Configuración de Next.js
- `README.md`: Documentación del proyecto
- `BUNDLE-ANALYSIS.md`: Documentación sobre cómo analizar el bundle de la aplicación
- `package.json`: Dependencias y scripts del proyecto
- `tailwind.config.js`: Configuración de Tailwind CSS
- `tsconfig.json`: Configuración de TypeScript

```
