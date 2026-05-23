# Módulo Proveedores — Especificación

## Descripción
Módulo nuevo para gestionar proveedores y rastrear órdenes de compra. Simula el seguimiento de entregas: días transcurridosvs. días estimados de flete.

## Data Model — db.json

### proveedores
```typescript
type Proveedor = {
  id: number
  nombre: string
  nit: string
  telefono: string
  email: string
  contacto: string
  diasFlete: number
  activo: boolean
}
```

Data mock sugerida (6 proveedores):
| Proveedor                     | NIT              | Contacto       | Días Flete |
| ----------------------------- | ---------------- | -------------- | ---------- |
| Distribuidora ABC             | 900.123.456-7    | María López    | 5          |
| Farmacéutica Nacional         | 900.234.567-8    | Carlos Gómez   | 3          |
| Laboratorios Genfar           | 800.345.678-9    | Ana Martínez   | 7          |
| Droguería Mayorista Med Plus  | 900.456.789-0    | Pedro Ramírez  | 4          |
| Proveedora Farmacéutica del Sur | 800.567.890-1  | Luisa Fernández | 10         |
| Distribuidora de Insumos Médicos | 900.678.901-2 | Diego Rojas    | 6          |

### ordenesCompra
```typescript
type OrdenCompraItem = {
  producto: string
  cantidad: number
  precioUnit: number
}

type OrdenCompra = {
  id: number
  proveedorId: number
  farmaciaId: number
  fechaPedido: string   // ISO date "YYYY-MM-DD"
  items: OrdenCompraItem[]
  total: number
  estado: "pendiente" | "en_transito" | "recibido" | "retrasado"
}
```

Data mock sugerida: 8-10 órdenes distribuidas entre farmacias y proveedores. Variar estados y fechas para que el tracking se vea diferente:
- Órdenes recientes (hace 1-2 días) → "pendiente"
- Órdenes a mitad del flete → "en_transito"
- Órdenes vencidas → "retrasado"
- Órdenes completadas → "recibido"

## Cálculo de Tracking

```typescript
function calcularEstado(orden: OrdenCompra, proveedor: Proveedor): { estado: string; progreso: number; diasRestantes: number } {
  const hoy = new Date()
  const pedido = new Date(orden.fechaPedido)
  const diasTranscurridos = Math.floor((hoy.getTime() - pedido.getTime()) / (1000 * 60 * 60 * 24))
  const diasEstimados = proveedor.diasFlete
  const progreso = Math.min(Math.round((diasTranscurridos / diasEstimados) * 100), 100)
  const diasRestantes = Math.max(diasEstimados - diasTranscurridos, 0)

  let estado: string
  if (orden.estado === "recibido") {
    estado = "recibido"
  } else if (diasTranscurridos > diasEstimados) {
    estado = "retrasado"
  } else if (diasTranscurridos >= diasEstimados * 0.75) {
    estado = "en_transito"
  } else {
    estado = "pendiente"
  }

  return { estado, progreso, diasRestantes }
}
```

### Mapping estado → UI
| Estado       | Badge color          | Icono | Progreso bar          |
| ------------ | -------------------- | ----- | --------------------- |
| pendiente    | `COLORS.muted`       | 📋    | < 50%, gris           |
| en_transito  | `COLORS.warn`        | 🚚    | 50-99%, amarillo      |
| retrasado    | `COLORS.danger`      | ⚠     | > 100%, rojo, parpadeo|
| recibido     | `COLORS.success`     | ✅    | 100%, verde           |

## Layout de la Página

### Tabs (shadcn/ui o toggle buttons)
Dos tabs: "📋 Directorio" y "📦 Órdenes de Compra"

### Tab 1: Directorio
```
┌──────────────────────────────────────────────┐
│ Título + Botón "+ Registrar Proveedor"       │
├──────────────────────────────────────────────┤
│ Grid de cards (3 columnas en lg)             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ │ Proveedor│ │ Proveedor│ │ Proveedor│      │
│ │ ABC      │ │ Nacional │ │ Genfar   │      │
│ │ 5 días   │ │ 3 días   │ │ 7 días   │      │
│ │ Activo   │ │ Activo   │ │ Activo   │      │
│ └──────────┘ └──────────┘ └──────────┘      │
└──────────────────────────────────────────────┘
```

Cada card del directorio muestra:
- Icono 🏢 + Nombre
- NIT
- 📞 teléfono
- ✉ email
- 👤 Contacto
- 🚚 Días de flete: N
- Badge Activo/Inactivo

### Tab 2: Órdenes de Compra
```
┌──────────────────────────────────────────────┐
│ Título + Botón "+ Nueva Orden"              │
├──────────────────────────────────────────────┤
│ Filtro: [Select: Todos los proveedores]     │
│         [Select: Todos los estados]          │
├──────────────────────────────────────────────┤
│ Tabla de órdenes                             │
│ ┌────┬──────────┬────────┬────────┬────────┐ │
│ │ ID │Proveedor │ Fecha  │ Total  │ Estado │ │
│ ├────┼──────────┼────────┼────────┼────────┤ │
│ │ #1 │ ABC      │ 10/05  │ $850K  │ 🚚     │ │
│ │    │          │        │        │ ████░░ │ │
│ └────┴──────────┴────────┴────────┴────────┘ │
└──────────────────────────────────────────────┘
```

Cada fila de orden incluye:
- ID
- Nombre del proveedor
- Nombre de la farmacia
- Fecha del pedido
- Total (fmtM)
- Estado (Badge con icono + color según tabla arriba)
- Barra de progreso visual
- Días: "3/5 días" o "⚠ 7/5 días (retrasado 2d)"

### Expandir fila (detalle de items)
Al hacer clic en una fila, expande para mostrar items:
- Producto, Cantidad, Precio unitario, Subtotal

## Dialog: Nueva Orden de Compra

Formulario en Dialog:
1. Select: Proveedor (carga lista de proveedores activos)
2. Select: Farmacia (carga lista de farmacias)
3. Date input: Fecha del pedido (default: hoy)
4. Items dinámicos: botón "+ Agregar producto"
   - Input: nombre producto
   - Input: cantidad
   - Input: precio unitario
   - Subtotal calculado automático
   - Botón "✕" para quitar item
5. Total calculado en vivo
6. Botones: "Crear Orden" / "Cancelar"

## States
- **Loading**: Skeleton de cards / skeleton de tabla
- **Empty directorio**: "No hay proveedores registrados. Crea el primero."
- **Empty órdenes**: "No hay órdenes de compra para los filtros seleccionados."
- **Error**: "Error al cargar proveedores/órdenes. Intenta de nuevo."
- **Computed**: El estado de tracking se calcula en el frontend basado en fechaPedido + diasFlete

## Navegación
Agregar a `NAV` en App.tsx:
```typescript
{ id: "proveedores", label: "Proveedores" }
```

Icono en sidebar: 📦 o `Truck` de lucide-react (al no tener icono, se muestra primera letra en collapsed mode o emoji mientras)
