# Bundle Analysis en Next.js

Guía sobre las herramientas disponibles para analizar y optimizar los bundles de la aplicación.

---

## Objetivo

Next.js ofrece dos herramientas distintas para inspeccionar los bundles generados:

| Herramienta | Bundler | Estado |
|---|---|---|
| `next experimental-analyze` | Turbopack | Experimental (v16.1+) |
| `@next/bundle-analyzer` | Webpack | Estable |

Ambas permiten detectar dependencias pesadas. Permiten observar el tamaño de los módulos e identificar oportunidades de optimización. La elección depende del bundler que se esté utilizando.

---

## Comandos disponibles

Los siguientes scripts están definidos en `package.json`:

```json
{
  "scripts": {
    "analyze:webpack": "ANALYZE=true yarn build --webpack",
    "analyze": "next experimental-analyze",
    "analyze:export": "next experimental-analyze --output"
  }
}
```

| Script | Descripción |
|---|---|
| `analyze:webpack` | Genera el reporte visual de Webpack vía `@next/bundle-analyzer` |
| `analyze` | Abre el analizador interactivo de Turbopack en el navegador |
| `analyze:export` | Guarda el análisis como archivo estático en `.next/diagnostics/analyze` |

---

## next experimental-analyze (Turbopack)

> Disponible desde Next.js v16.1. Estado: **experimental**.

El Bundle Analyzer de Next.js está integrado directamente con Turbopack. Permite inspeccionar módulos de servidor y cliente con trazado preciso de imports, facilitando la detección de dependencias pesadas.

### Uso interactivo

```bash
yarn analyze
# equivale a: next experimental-analyze
```

Esto arranca el servidor de análisis y abre automáticamente una vista interactiva en el navegador con un treemap del grafo de módulos.

#### Funcionalidades de la UI

- **Filtrar por ruta**: enfoca el análisis en una página o layout específico.
- **Filtrar por entorno**: distingue módulos de `client` vs `server`.
- **Filtrar por tipo**: JavaScript, CSS, JSON.
- **Ver cadena de imports**: al hacer clic en un módulo se despliega su árbol completo de importaciones y los puntos de uso dentro de la aplicación.
- **Tamaño visual**: cada módulo se representa como un rectángulo cuya área es proporcional a su tamaño en el bundle.

### Exportar resultado a disco

```bash
yarn analyze:export
# equivale a: next experimental-analyze --output
```

En lugar de abrir la vista interactiva, este comando escribe el resultado como archivos estáticos en:

```
.next/diagnostics/analyze/
```

Esto es útil para:

- **Compartir** el análisis con el equipo sin necesidad de hacer el build localmente.
- **Comparar** el estado del bundle antes y después de una refactorización.

#### Ejemplo de comparación

```bash
# Guardar estado antes de los cambios
yarn analyze:export
cp -r .next/diagnostics/analyze ./analyze-before-refactor

# Hacer cambios en el código...

# Guardar estado después de los cambios
yarn analyze:export
cp -r .next/diagnostics/analyze ./analyze-after-refactor
```

---

## @next/bundle-analyzer (Webpack)

Plugin para Webpack que genera un reporte visual con el tamaño de cada paquete y sus dependencias. Útil cuando se trabaja con el bundler de Webpack (`--webpack`) o en proyectos que aún no migraron a Turbopack.

### Configuración

La configuración en `next.config.ts` envuelve la config existente con `withBundleAnalyzer`:

```ts
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

El analizador solo se activa cuando la variable de entorno `ANALYZE=true` está presente, por lo que no tiene impacto en los builds normales.

### Uso

```bash
yarn analyze:webpack
# equivale a: ANALYZE=true yarn build --webpack
```

Al finalizar el build, abre automáticamente **tres tabs** en el navegador con los reportes de:

- Bundle del **cliente**
- Bundle del **servidor**
- Bundle del **Edge runtime** (si aplica)

---

## Referencias

- [Next.js Docs — Package Bundling](https://nextjs.org/docs/app/guides/package-bundling)