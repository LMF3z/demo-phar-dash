# Módulo Resumen — Especificación

## Descripción
Página principal del dashboard. Muestra KPIs globales, tendencia de ventas, distribución por grupo, tabla mensual, y top 10 artículos. Vista general del negocio.

## Data Utilizada
- `ventas`: ventas mensuales por farmacia (unidades + valor)
- `farmacias`: catálogo de farmacias
- `alertas`: alertas de baja rotación
- `grupos`: peso porcentual de cada grupo de productos
- `top10`: top artículos más vendidos por farmacia

## Layout de la Página (orden vertical)

```
┌──────────────────────────────────────────────┐
│ Título dinámico + toggle Unidades/Valor      │
│  "Resumen General 2026" / "Resumen - Farm N"│
├──────────────────────────────────────────────┤
│ Grid: 5 MetricCards                          │
│  🏪 Farmacias  📦 Total uds  💰 Ventas      │
│  🔔 Alertas    📋 SKUs activos              │
├──────────────────────────────────────────────┤
│ [Global only] Ventas por farmacia            │
│ Grid de mini-cards con color por farmacia    │
├──────────────────────────────────────────────┤
│ Grid 2 columnas:                             │
│  ┌─ Tendencia (AreaChart) ─┐                │
│  └─────────────────────────┘                │
│  ┌─ Peso por Grupo (PieChart + lista) ─┐    │
│  └──────────────────────────────────────┘    │
├──────────────────────────────────────────────┤
│ BarChart: Tendencia de ventas mensual        │
├──────────────────────────────────────────────┤
│ Tabla: Ventas por Mes (mes, unidades, valor) │
├──────────────────────────────────────────────┤
│ BarChart horizontal: Top 10 Artículos        │
├──────────────────────────────────────────────┤
│ Tabla: Top 10 con posiciones #1, #2, #3      │
└──────────────────────────────────────────────┘
```

## Componentes

### MetricCard (reutilizable)
```tsx
<MetricCard icon="🏪" label="Farmacias" value={n} sub="Todas activas" />
```
Props: `icon`, `label`, `value`, `sub?`, `color?`

### Toggle Unidades/Valor
Toggle button group afecta charts principales y cards.
```tsx
<button onClick={() => setTipo("unidades")}>Unidades</button>
<button onClick={() => setTipo("valor")}>Valor</button>
```
- `tipo` estado controla qué dataKey se muestra en charts
- Chart de tendencia: `dataKey={tipo}`
- Pie de grupos: muestra unidades o valor según toggle

### Charts

#### AreaChart — Tendencia de Ventas
- 12 meses en eje X
- Gradiente bajo la línea (linearGradient)
- CustomTooltip con formato según tipo
- Stroke: `COLORS.primary`

#### PieChart — Peso por Grupo
- Donut chart con labels de porcentaje
- Inner radius: 45, outer: 85
- 5 grupos: Genéricos, Marca, OTC, Cuidado personal, Dispositivos
- Lista lateral con barras de progreso por grupo
- Select para filtrar por mes o año completo

#### BarChart — Tendencia de Ventas (barras)
- Alterna colores pares/impares: `COLORS.primary` / `COLORS.accent`
- barSize: 32

#### BarChart horizontal — Top 10 Artículos
- layout="vertical"
- Eje Y: nombre del artículo
- Barra con color degradado `hsl(210,70%,${45 + i * 2}%)`
- Márgenes: left=10, right=30

### Tablas

#### Ventas por Mes
Columnas: Mes, Unidades, Valor (verde)

#### Top 10 Artículos
- Posiciones #1, #2, #3 con badge de color (PIE_COLORS)
- Fila #1 con fondo `{COLORS.accent}10`
- Columnas: Pos, Artículo, Unidades, Valor

## Filtro por Farmacia

- Select en header global
- `selectedFarmaciaId === null` → Global (todas las farmacias)
- Filtra `ventas`, `alertas`, `grupos`, `top10` según farmacia seleccionada
- Título cambia: "Resumen General" vs "Resumen - Farmacia N"
- Ventas por farmacia card solo se muestra en vista Global

## Lógica de Negocio

### Cálculo de SKUs (mock)
```typescript
const skuBase = 8 + Number(f.id) * 3
const randomSkus = skuBase + Math.floor(Math.random() * 5)
```
Simulados, no provienen de API real.

### Grupos
- `peso` es porcentaje del grupo
- `valor` y `unidades` se calculan como `total * (peso / 100)`
- En Global: se muestran grupos de farmacia 1 (farmaciaId !== null)
- Con farmacia específica: se filtran por farmaciaId

## Estados
- **Loading**: Pantalla completa con spinner y 💊
- **Sin datos**: Tablas vacías con mensaje "Sin datos disponibles"
- **Global vs específico**: Comportamiento condicional en cards de farmacia

## Notas
- La página no tiene interacciones de escritura (solo lectura)
- Todos los filtros son via el contexto global de farmacia
- Select de mes en el PieChart es local (no afecta otros charts)
