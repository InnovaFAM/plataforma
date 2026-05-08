# Frontend

Aplicación web de Innovafam construida con **Next.js**, **React**, **TypeScript** y componentes UI reutilizables. Esta capa concentra la experiencia de usuario del sistema: autenticación, navegación, vistas operacionales, formularios, dashboards, reportes y consumo de APIs del backend.

## Stack principal

- **Next.js 16**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **NextAuth**
- **TanStack React Query**
- **TanStack Table**
- **Zustand**
- **Axios**
- **ApexCharts**
- **next-intl**

## Requisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js compatible con la versión usada por el proyecto.
- npm, yarn o el gestor definido por el equipo.
- Acceso a las variables de entorno necesarias para autenticación y consumo de APIs.

## Instalación

Desde la carpeta `frontend`:

```bash
npm install
```

o, si el proyecto se trabaja con Yarn:

```bash
yarn install
```

## Ejecución local

```bash
npm run dev
```

o:

```bash
yarn dev
```

La aplicación quedará disponible normalmente en:

```txt
http://localhost:3000
```

## Scripts disponibles

```bash
npm run dev
```

Ejecuta la aplicación en modo desarrollo usando Turbopack.

```bash
npm run build
```

Genera el build productivo de Next.js.

```bash
npm run start
```

Levanta la aplicación usando el build productivo.

```bash
npm run lint
```

Ejecuta las validaciones de lint configuradas para el proyecto.

```bash
npm run prettier
```

Verifica el formato de los archivos dentro de `src`.

```bash
npm run prettier:fix
```

Aplica formato automático usando Prettier.

```bash
npm run analyze
```

Ejecuta análisis experimental del bundle.

```bash
npm run analyze:webpack
```

Ejecuta el build con análisis de bundle usando Webpack.

## Variables de entorno

Crear un archivo `.env.local` en la carpeta `frontend` con las variables necesarias para ejecutar el proyecto localmente.

Ejemplo referencial:

```env
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

NEXT_PUBLIC_API_BASE_URL=
```

Las variables reales pueden variar según el ambiente y la configuración de autenticación/API.

## Estructura sugerida

```txt
frontend/
├── public/              # Assets públicos
├── src/                 # Código fuente de la aplicación
│   ├── app/             # App Router de Next.js
│   ├── components/      # Componentes reutilizables
│   ├── configs/         # Configuraciones globales
│   ├── services/        # Clientes HTTP y servicios de API
│   ├── store/           # Estados globales
│   ├── utils/           # Utilidades y hooks compartidos
│   └── views/           # Vistas y módulos funcionales
├── next.config.ts       # Configuración de Next.js
├── package.json         # Dependencias y scripts
└── README.md
```

## Convenciones de desarrollo

- Mantener los componentes reutilizables dentro de `components`.
- Encapsular llamadas HTTP en servicios dedicados.
- Usar React Query para estados derivados de consultas remotas.
- Usar Zustand para estados globales de UI o flujos compartidos.
- Mantener tipado explícito en contratos de API y estructuras de datos.
- Evitar lógica de negocio compleja directamente dentro de componentes visuales.
- Preferir componentes pequeños, composables y fáciles de testear.

## Build productivo

```bash
npm run build
npm run start
```

## Notas

Esta carpeta contiene exclusivamente la capa frontend. La infraestructura AWS se gestiona desde `infra` y la lógica serverless/API desde `backend`.
