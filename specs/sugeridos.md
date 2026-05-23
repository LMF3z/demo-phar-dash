# Módulo Sugeridos — Especificación

## Estado Actual
- Tabla de productos sugeridos para reorden
- Dividido en secciones: Urgentes y Normales
- KPIs: Urgentes, Total Productos, Unidades Sugeridas, Valor Estimado
- Filtro por farmacia via contexto global

## Cambios Requeridos

### 1. Presupuesto Mensual por Farmacia

**Data**: Nueva colección `presupuestos` en db.json:
```typescript
type Presupuesto = {
  farmaciaId: number
  monto: number
}
```

| Farmacia    | Presupuesto Mensual |
| ----------- | ------------------- |
| Farmacia 1  | $15,000,000         |
| Farmacia 2  | $8,000,000          |
| Farmacia 3  | $3,000,000          |

- Si `selectedFarmaciaId === null` (Global), sumar presupuestos de todas las farmacias
- Si `selectedFarmaciaId === N`, usar presupuesto de esa farmacia

### 2. Banner de Presupuesto (arriba de todo)

```
┌──────────────────────────────────────────────────────────┐
│  💰 Presupuesto del Mes            📍 [farmacia nombre] │
│                                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ $15.0M  │  │ $8.5M   │  │ $6.5M   │                    │
│  │ Total   │  │ Gastado │  │ Restante │                    │
│  └─────────┘  └─────────┘  └─────────┘                    │
│                                                            │
│  ━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░  57%                     │
│  ████████████████░░░░░░░░░░░░░░░░                         │
│  Verde (<60%) | Amarillo (60-85%) | Rojo (>85%)            │
└──────────────────────────────────────────────────────────┘
```

Tres MetricCards en fila:
- **Presupuesto Total**: `fmtM(presupuesto)`, color `COLORS.primary`
- **Gasto Estimado**: `fmtM(suma de sugerido * precio)`, color `COLORS.warn`
- **Saldo Disponible**: `fmtM(presupuesto - gasto)`, color:
  - `COLORS.success` si saldo > 40% del presupuesto
  - `COLORS.warn` si saldo entre 15-40%
  - `COLORS.danger` si saldo < 15%

Barra de progreso debajo de las cards:
```tsx
<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
  <div
    className="h-full rounded-full transition-all duration-500"
    style={{
      width: `${Math.min((gasto / presupuesto) * 100, 100)}%`,
      background: ratio < 0.6 ? COLORS.success : ratio < 0.85 ? COLORS.warn : COLORS.danger,
    }}
  />
</div>
<p className="text-xs text-muted-foreground mt-1">
  {fmtM(gasto)} de {fmtM(presupuesto)} ({Math.round((gasto / presupuesto) * 100)}%)
</p>
```

### 3. Columna "Cubre Presupuesto" en tabla sugeridos

Agregar columna en ambas tablas (Urgentes y Normales):

| Estado       | Indicador                           |
| ------------ | ----------------------------------- |
| ✅ Cubre     | `COLORS.success`, check verde       |
| ⚠ Excede     | `COLORS.danger`, alerta roja        |

**Lógica de cálculo**:
- Iterar productos en orden: primero Urgentes (por ID), luego Normales (por ID)
- Acumulador `gastoAcumulado` comienza en 0
- Para cada producto: si `gastoAcumulado + (sugerido * precio) <= presupuesto` → ✅, y se suma al acumulador
- Si excede → ⚠, y NO se suma (el producto no se puede comprar con el presupuesto restante)

Esto simula una priorización: los urgentes tienen prioridad y se descuentan primero.

### 4. Tooltip/Info en columna presupuesto
- Al hacer hover sobre el indicador ✅/⚠, mostrar tooltip simple (title attr o tooltip de shadcn):
  - ✅: "Cubre dentro del presupuesto disponible"
  - ⚠: "Excede el presupuesto restante. Reduce cantidad o prioriza urgentes."

## Layout Final de la Página

```
┌──────────────────────────────────────────────┐
│ Título + descripción                         │
├──────────────────────────────────────────────┤
│ Banner de Presupuesto (MetricCards + barra)  │
├──────────────────────────────────────────────┤
│ KPIs actuales (Urgentes, Total, etc.)        │
├──────────────────────────────────────────────┤
│ Tabla: REORDEN URGENTE                       │
│ (con columna adicional "Cubre Presupuesto")  │
├──────────────────────────────────────────────┤
│ Tabla: REORDEN NORMAL                        │
│ (con columna adicional "Cubre Presupuesto")  │
└──────────────────────────────────────────────┘
```

## Estados
- **Loading**: Skeleton del banner + skeleton de tablas
- **Sin presupuesto**: Si no hay presupuesto para la farmacia actual, mostrar card con mensaje "No hay presupuesto configurado para esta farmacia"
- **Presupuesto agotado**: Si el gasto >= presupuesto, la barra se pone roja y muestra "Presupuesto agotado"
- **Sin sugeridos**: Mensaje actual "No hay productos por reordenar" se mantiene

## Notas de Implementación
- No modificar la estructura actual de sugeridos ni su lógica de filtrado
- El presupuesto es solo informativo (no bloquea la compra, solo advierte)
- Los valores monetarios usan `fmtM()` para mostrar
- La barra de progreso tiene transición suave (transition-all duration-500)
