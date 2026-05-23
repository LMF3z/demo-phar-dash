# PharDash — AI Agent Guide

## Project Overview
Dashboard analítico para dueños de farmacias. React 19 + TypeScript + Vite + Tailwind CSS 4 + shadcn/ui.
Demo app con datos mock (json-server).

## Tech Stack
| Capa       | Tecnología                                    |
| ---------- | --------------------------------------------- |
| UI         | React 19, TypeScript, Tailwind CSS 4          |
| Components | shadcn/ui (radix primitives)                  |
| Charts     | Recharts                                      |
| Icons      | Lucide React                                  |
| Data       | json-server (puerto 3001, fallback a db.json) |
| Build      | Vite 7                                        |
| Package    | pnpm                                          |

## Commands
```bash
pnpm dev          # Vite dev server (frontend)
pnpm server       # json-server (backend mock, puerto 3001)
pnpm dev:all      # Ambos simultáneamente
pnpm build        # tsc -b && vite build
pnpm lint         # ESLint
pnpm typecheck    # tsc --noEmit
pnpm format       # Prettier
```

## Project Structure
```
src/
├── App.tsx              # Layout principal, auth, data fetching, routing
├── main.tsx             # Entry point
├── index.css            # Tema shadcn, variables CSS, Tailwind
├── lib/utils.ts         # cn() utility
├── hooks/use-mobile.ts   # Mobile detection
└── components/
    ├── ui/              # shadcn components (button, card, input, etc.)
    ├── FilterContext.tsx # Tipos globales + contexto de filtro por farmacia
    ├── constants.ts     # Colores, formateadores (fmt, fmtM), meses
    ├── MetricCard.tsx   # Tarjeta reutilizable de métrica
    ├── Login.tsx        # Pantalla de login (demo/demo)
    ├── theme-provider.tsx
    ├── PageResumen.tsx
    ├── PageMarcas.tsx
    ├── PageAlertas.tsx
    ├── PageSugeridos.tsx
    ├── PageFarmacias.tsx
    └── PageProveedores.tsx  # (nuevo)
db.json                  # Datos mock (json-server)
```

## Coding Conventions

### Language
- **Code** (variables, functions, types, file names, component props, hooks): **English**
- **Documentation** (AGENTS.md, specs, comments): **Spanish**
- **UI text** (labels, titles, descriptions visible to user): **Spanish** (es-CO)
- Ej: `MetricCard` component, `formatCurrency()` function, `getFarmaciaNombre()` method, UI shows "Total unidades"

### TypeScript
- Tipos definidos en `FilterContext.tsx` (exportados)
- Cada componente define `type Props = { ... }` localmente
- NO usar `any` o `as` casts innecesarios
- Preferir `interface` solo para objetos públicos; `type` para props y uniones

### Components
- Functional components con arrow functions: `export function MiComp({ ... }: Props)`
- Nombres PascalCase para componentes, camelCase para hooks/utils
- Props desestructuradas en la firma
- NO usar default exports excepto en App.tsx

### Styling
- Tailwind CSS v4 con clases utilitarias
- NO escribir CSS modules o archivos .css separados para componentes
- Usar `style` prop solo para colores dinámicos (ej: desde COLORS constant)
- Preferir gap sobre margin para espaciado entre elementos
- Layout responsivo con `grid-cols-*` y `md:` breakpoints

### Colors & Constants
- Importar de `@/components/constants`:
  - `COLORS` (primary, accent, success, danger, warn, muted, border)
  - `PIE_COLORS`, `STORE_COLORS`
  - `MONTHS` (meses abreviados: "Ene", "Feb"...)
  - `fmt(n)` → formatear número con separadores
  - `fmtM(n)` → formato monetario ($1.5M, $500K)
- NO hardcodear colores hex en clases Tailwind

### Data Fetching
- `App.tsx` hace fetch a `VITE_API_URL` y cae a `db.json` importado
- Páginas reciben `data: DataState` como prop
- `refetch` callback disponible para páginas que modifican datos
- Contexto de filtro via `useFilter()`: `selectedFarmaciaId`, `getFarmaciaNombre()`

### Charts (Recharts)
- Importar componentes de recharts en cada página
- CustomTooltip inline con tipado de props: `active?: boolean, payload?: Array<{value, name}>, label?: string`
- ResponsiveContainer con width="100%" y height numérico
- Colores de chart desde `PIE_COLORS` o `STORE_COLORS`

### Forms
- shadcn/ui Input, Label, Button, Select, Dialog
- Validación manual en handler (sin librería)
- Estados de loading y error locales

## AGENTS.md
Este archivo debe mantenerse actualizado con cada cambio significativo en convenciones o arquitectura.
