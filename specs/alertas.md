# Módulo Alertas — Especificación

## Descripción

Lista de productos con baja rotación. Ayuda a identificar inventario lento para tomar decisiones de descuento, devolución o suspensión de compra.

## Data Utilizada

- `alertas`: array de productos con nivel de rotación
- `farmacias`: para resolver nombre de farmacia por ID

## Layout de la Página

```
┌──────────────────────────────────────────────┐
│ Título "🔔 Alertas de Baja Rotación"         │
│ Subtítulo: "Productos con rotación lenta - X"│
├──────────────────────────────────────────────┤
│ Grid: 3 cards de resumen por nivel           │
│  ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ Alto │ │ Medio│ │ Bajo │                  │
│  │   3  │ │   4  │ │   3  │                  │
│  │ prod │ │ prod │ │ prod │                  │
│  └──────┘ └──────┘ └──────┘                  │
├──────────────────────────────────────────────┤
│ Tabla de alertas                              │
│ ┌─────────┬──────────┬───────┬────────┬─────┐│
│ │Producto │ Farmacia │ Stock │ Rotac. │Nivel││
│ ├─────────┼──────────┼───────┼────────┼─────┤│
│ │Cetiriz. │Farm 1    │ 145   │ ███ 92d│ ⚠   ││
│ └─────────┴──────────┴───────┴────────┴─────┘│
└──────────────────────────────────────────────┘
```

## Componentes

### Cards de Resumen por Nivel

Tres cards con borde izquierdo coloreado:

- **Alto** (`COLORS.danger`): productos con rotación muy lenta (> 75 días)
- **Medio** (`COLORS.warn`): rotación moderada (50-75 días)
- **Bajo** (`COLORS.success`): rotación aceptable pero monitoreada (< 50 días)

Cada card muestra: label, conteo de productos, y "prod."

### Tabla de Alertas

Columnas:
| Columna | Descripción |
| ------------- | ---------------------------------------- |
| Producto | Nombre del producto, font-medium |
| Farmacia | Nombre de farmacia resuelto, muted |
| Stock | Unidades en inventario, formato fmt |
| Días rotación | Barra de progreso + número de días |
| Nivel | Badge coloreado (Alto/Medio/Bajo) |

### Barra de Días de Rotación

```tsx
<div className="flex items-center gap-2">
  <div className="flex-1 overflow-hidden rounded bg-muted">
    <div
      className="h-2 rounded"
      style={{
        width: `${Math.min(diasRotacion, 100)}%`,
        background: nivelColor[nivel],
      }}
    />
  </div>
  <span className="font-bold min-w-8">{diasRotacion}d</span>
</div>
```

### Badge de Nivel

```tsx
<Badge style={{ backgroundColor: `${nivelColor[nivel]}20`, color: nivelColor[nivel] }}>
  {nivelLabel[nivel]}
</Badge>
```

## Filtro por Farmacia

- Via contexto global (`selectedFarmaciaId`)
- Filtra alertas por `farmaciaId`
- Cards de resumen se actualizan con conteos filtrados
- Subtítulo cambia según farmacia seleccionada

## Estados

- **Empty**: "No hay alertas para esta farmacia" con padding vertical
- **Filtrado**: Al seleccionar farmacia específica, solo muestra sus alertas
- **Global**: Muestra alertas de todas las farmacias

## Notas

- Módulo de solo lectura
- No hay acciones sobre las alertas (sin marcar como resueltas, sin eliminar)
- Los niveles (alto/medio/bajo) son strings, no se calculan dinámicamente
