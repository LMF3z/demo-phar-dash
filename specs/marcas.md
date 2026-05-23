# Módulo Marcas — Especificación

## Estado Actual
- Selector de marca única (botones variant `default`/`outline`)
- Gráfico de área mensual para la marca seleccionada
- BarChart "Por farmacia" para la marca seleccionada

## Cambios Requeridos

### 1. Multi-selección de marcas (chips toggle)
**UI**: Reemplazar botones de selección única por chips toggle.
- Cada marca es un `Button` con `variant={selected ? "default" : "outline"}`
- Múltiples marcas pueden estar seleccionadas simultáneamente
- Chips seleccionados muestran checkmark (✓) antes del nombre
- Almacenar selección en `Set<number>` (marcaIds)

**Colores**: Las marcas seleccionadas usan su color del ranking. Si no hay color definido, usar `COLORS.primary`.

### 2. Ranking de Marcas (barra horizontal)
**Data**: Nueva colección `marcasRanking` en db.json. Array con:
```typescript
type MarcaRanking = {
  id: number
  marcaId: number
  nombre: string
  unidades: number
  valor: number
}
```

**UI**: Card con `ResponsiveContainer` + `BarChart` layout vertical (barras horizontales).
- Eje Y: nombre de marca
- Eje X: unidades (o valor según toggle)
- Cada barra coloreada según la marca
- Las marcas seleccionadas se resaltan con mayor opacidad/borde
- Toggle Unidades/Valor como en Resumen
- Tooltip muestra unidades y valor

### 3. Top 10 productos por marca
**Data**: Nueva colección `marcaTopProductos` en db.json. Array con:
```typescript
type MarcaTopProducto = {
  id: number
  marcaId: number
  producto: string
  unidades: number
  valor: number
  participacion: number  // porcentaje de ventas de este producto dentro de la marca
}
```

**UI**: Por cada marca seleccionada, mostrar una Card con tabla de sus top productos.
- Columnas: #, Producto, Unidades, Valor, Participación (%)
- Si no hay marcas seleccionadas, mostrar mensaje "Selecciona una o más marcas"
- Las cards se muestran en grid responsivo

### 4. Comparación superpuesta (2+ marcas seleccionadas)
**Data**: Usar `marcasData.mensual` existente, filtrado por marcaId seleccionado.

**UI**: Card con `ResponsiveContainer` + `AreaChart` superpuesto.
- Un `<Area>` por marca seleccionada
- Cada área con su color correspondiente (definir `BRAND_COLORS` en constants)
- Tooltip personalizado que muestra todas las marcas con sus valores y colores
- Leyenda con colores de cada marca
- Si solo 1 marca seleccionada, mostrar el área chart simple (como actual)

### 5. Resumen de marcas seleccionadas
**UI**: Cards de métrica arriba, dinámicas según selección:
- "Marcas seleccionadas: N"
- "Total unidades" (suma de seleccionadas)
- "Total valor" (suma de seleccionadas)

## Layout de la Página (orden vertical)

```
┌────────────────────────────────────────────┐
│ Título + selector Unidades/Valor           │
├────────────────────────────────────────────┤
│ Chips de marcas (multi-select)             │
├────────────────────────────────────────────┤
│ MetricCards: seleccionadas, total uds,     │
│ total valor                                │
├────────────────────────────────────────────┤
│ Gráfico superpuesto (comparación)          │
│ (si 2+ seleccionadas)                     │
├────────────────────────────────────────────┤
│ Ranking de Marcas (barra horizontal)       │
├────────────────────────────────────────────┤
│ Top productos (grid de cards, una          │
│ por marca seleccionada)                    │
└────────────────────────────────────────────┘
```

## Data — db.json

### marcaTopProductos (30+ items)
Distribuir productos de `top10` entre marcas. Ejemplo:
- Genfar: Acetaminofén, Metformina, Omeprazol, Amoxicilina
- Bayer: Ibuprofeno, Diclofenaco
- Tecnoquímicas: Loratadina, Salbutamol
- Novartis: Atorvastatina, Clonazepam
- MK: Losartán, Amlodipino, Enalapril
- Abbott: Vitamina D3, Vitamina C
- Reckitt: Paracetamol, Bismutol
- Sanofi: Ambroxol, Metoclopramida

Participación: % del producto dentro de la marca (suma = 100% por marca).

### marcasRanking (10 items, uno por marca)
- Ordenar por unidades totales descendente
- Genfar 1°, Bayer 2°, etc.

## States
- **Loading**: Skeleton cards mientras carga data
- **Empty**: "No hay datos disponibles" si no hay marcas
- **No selection**: "Selecciona una o más marcas para ver productos"
- **Error**: Mensaje en card si falla carga de datos de marca específica
