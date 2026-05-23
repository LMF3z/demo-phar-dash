# PharDash — Especificación General

## Visión General
Dashboard analítico para dueños de farmacias. Permite visualizar ventas, alertas de rotación, sugerencias de compra, rendimiento por marca y administración de proveedores. App demo con datos mock.

## Tech Stack
| Capa         | Tecnología                           |
| ------------ | ------------------------------------ |
| UI           | React 19 + TypeScript                |
| Styling      | Tailwind CSS 4                       |
| Components   | shadcn/ui (Radix primitives)         |
| Charts       | Recharts                             |
| Icons        | Lucide React                         |
| Data         | json-server (db.json, puerto 3001)   |
| Build        | Vite 7                               |
| Package Mgmt | pnpm                                 |

## Arquitectura

```
App.tsx (layout, auth, fetch, routing)
├── Login.tsx
└── DashboardLayout
    ├── Sidebar (nav, logout)
    ├── Header (filter por farmacia, status indicator)
    └── Pages
        ├── PageResumen
        ├── PageMarcas
        ├── PageAlertas
        ├── PageSugeridos
        ├── PageFarmacias
        └── PageProveedores
```

### Data Fetching
- `App.tsx` fetch a `VITE_API_URL` (json-server)
- Fallback a `db.json` importado si API no responde
- `refetch` callback expuesto a páginas que modifican datos (CRUD)

### Filter Context
- `useFilter()` hook expone: `selectedFarmaciaId`, `setSelectedFarmaciaId`, `getFarmaciaNombre()`, `farmacias`
- Filtra datos en cada página según la farmacia seleccionada
- `null` = Global (todas las farmacias)

## UI Conventions

### Layout & Spacing
- Contenedor principal: `flex min-h-screen w-full bg-background`
- Sidebar: `w-56` (open) / `w-16` (collapsed), bg-primary
- Header: `flex items-center justify-between border-b px-6 py-3 bg-card`
- Content: `flex-1 overflow-auto p-6`
- Espaciado vertical: `gap-2` (cards), `gap-4` (secciones), `mb-4`/`mb-5` (títulos)
- Grid responsivo base: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

### Colors (constants.ts)
- `COLORS.primary` (#1447e6) — azul principal
- `COLORS.accent` (#2b7fff) — azul claro
- `COLORS.success` (#27AE60) — verde
- `COLORS.danger` (#E74C3C) — rojo
- `COLORS.warn` (#F39C12) — amarillo/naranja
- `COLORS.muted` (#6B8299) — gris
- `COLORS.border` (#D0DFF0) — borde
- `PIE_COLORS` — array de 6 colores para charts
- `STORE_COLORS` — Record<string, string> mapea nombre farmacia → color

### Formatters (constants.ts)
- `fmt(n: number)` → `Intl.NumberFormat("es-CO")`
- `fmtM(n: number)` → $1.5M / $500K / $1.2B
- `MONTHS` → ["Ene","Feb",...,"Dic"]

### Component Patterns
- Functional components: `export function MiComp({ ... }: Props)`
- Props type: `type Props = { ... }` local en cada archivo
- NO default exports (excepto App.tsx)
- NO CSS modules — solo Tailwind utility classes
- `style` prop solo para colores dinámicos desde constantes

### Charts (Recharts)
- `ResponsiveContainer width="100%" height={n}`
- `CustomTooltip` inline con tipado: `active?: boolean; payload?: Array<{value, name}>; label?: string`
- Colores desde `PIE_COLORS` o `STORE_COLORS`

### Formularios
- shadcn Input, Label, Button, Select, Dialog
- Validación manual (objeto `errors: Record<string, string>`)
- Estados loading/error locales con useState

## Data Model — Shared Types

Definidos en `FilterContext.tsx`:

```typescript
type Farmacia = {
  id: number; nombre: string; ciudad: string; barrio?: string
  nit?: string; tel?: string; vendedor?: string; activa: boolean
}
type Venta = { id: number; farmaciaId: number; mes: string; unidades: number; valor: number }
type Grupo = { id: number; farmaciaId: number | null; grupo: string; peso: number }
type TopArticulo = { id: number; farmaciaId: number | null; articulo: string; unidades: number; valor: number }
type Marca = { id: number; nombre: string }
type MarcaData = { id: number; marcaId: number; farmaciaId: number | null; mensual: {mes:string;unidades:number}[]; porFarmacia: {farmacia:string;unidades:number}[] }
type Alerta = { id: number; farmaciaId: number; producto: string; stock: number; diasRotacion: number; nivel: string }
type SkuData = { farmaciaId: number; total: number }
type Sugerido = { id: number; farmaciaId: number; codigo: string; producto: string; marca: string; precio: number; ventas3m: number; stock: number; sugerido: number; transito: number; urgente: boolean }
```

## Module Index

| Módulo      | Archivo             | Spec                       |
| ----------- | ------------------- | -------------------------- |
| Resumen     | PageResumen.tsx     | specs/resumen.md           |
| Marcas      | PageMarcas.tsx      | specs/marcas.md            |
| Alertas     | PageAlertas.tsx     | specs/alertas.md           |
| Sugeridos   | PageSugeridos.tsx   | specs/sugeridos.md         |
| Farmacias   | PageFarmacias.tsx   | specs/farmacias.md         |
| Proveedores | PageProveedores.tsx | specs/proveedores.md       |
