import { useState, useMemo } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { MetricCard } from "./MetricCard"
import { COLORS, BRAND_COLORS, MONTHS, fmt, fmtM } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

const getBrandColor = (nombre: string, i: number) =>
  BRAND_COLORS[nombre] || PIE_COLORS[i % PIE_COLORS.length]

import { PIE_COLORS } from "./constants"

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {payload.map((p, i) => (
          <p
            key={i}
            className="text-sm font-bold"
            style={{ color: p.color || COLORS.primary }}
          >
            {p.name}: {fmt(p.value)} uds
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function PageMarcas({ data }: Props) {
  const { getFarmaciaNombre } = useFilter()
  const [selectedMarcaIds, setSelectedMarcaIds] = useState<Set<number>>(
    new Set(),
  )
  const [tipo, setTipo] = useState<"unidades" | "valor">("unidades")
  const { marcas, marcasData, marcaTopProductos, marcasRanking } = data
  const currentFarmacia = getFarmaciaNombre()

  const toggleMarca = (id: number) => {
    setSelectedMarcaIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedMarcas = marcas.filter((m) => selectedMarcaIds.has(m.id))

  const topProductosPorMarca = useMemo(() => {
    const map: Record<number, typeof marcaTopProductos> = {}
    for (const item of marcaTopProductos) {
      if (!map[item.marcaId]) map[item.marcaId] = []
      map[item.marcaId].push(item)
    }
    for (const key of Object.keys(map)) {
      map[Number(key)].sort((a, b) => b.unidades - a.unidades)
    }
    return map
  }, [marcaTopProductos])

  const comparacionData = useMemo(() => {
    if (selectedMarcas.length < 2) return []
    return MONTHS.map((mes) => {
      const entry: Record<string, string | number> = { mes }
      for (const marca of selectedMarcas) {
        const md = marcasData.find((d) => d.marcaId === marca.id)
        if (md) {
          const m = md.mensual.find((m) => m.mes === mes)
          entry[marca.nombre] = m?.unidades || 0
        }
      }
      return entry
    })
  }, [selectedMarcas, marcasData])

  const totalSelectedUnidades = selectedMarcas.reduce((sum, m) => {
    const rank = marcasRanking.find((r) => r.marcaId === m.id)
    return sum + (rank?.unidades || 0)
  }, 0)

  const totalSelectedValor = selectedMarcas.reduce((sum, m) => {
    const rank = marcasRanking.find((r) => r.marcaId === m.id)
    return sum + (rank?.valor || 0)
  }, 0)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            🔖 Ventas por Marca — {currentFarmacia}
          </h2>
          <p className="text-sm text-muted-foreground">
            Selecciona una o más marcas para comparar
          </p>
        </div>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["unidades", "valor"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                tipo === t ? "bg-background shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t === "unidades" ? "Unidades" : "Valor"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {marcas.map((m, i) => {
          const selected = selectedMarcaIds.has(m.id)
          return (
            <Button
              key={m.id}
              variant={selected ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMarca(m.id)}
              style={
                selected
                  ? { backgroundColor: getBrandColor(m.nombre, i) }
                  : { borderColor: getBrandColor(m.nombre, i), color: getBrandColor(m.nombre, i) }
              }
            >
              {selected ? "✓ " : ""}
              {m.nombre}
            </Button>
          )
        })}
      </div>

      {selectedMarcas.length > 0 && (
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          <MetricCard
            icon="🏷️"
            label="Marcas seleccionadas"
            value={selectedMarcas.length}
            sub="Totales"
          />
          <MetricCard
            icon="📦"
            label="Total unidades"
            value={fmt(totalSelectedUnidades)}
            sub={currentFarmacia}
            color={COLORS.primary}
          />
          <MetricCard
            icon="💰"
            label="Total valor"
            value={fmtM(totalSelectedValor)}
            sub={currentFarmacia}
            color={COLORS.success}
          />
        </div>
      )}

      {selectedMarcas.length >= 2 && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Comparación mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={comparacionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                {selectedMarcas.map((m, i) => (
                  <Area
                    key={m.id}
                    type="monotone"
                    dataKey={m.nombre}
                    stroke={getBrandColor(m.nombre, i)}
                    fill={getBrandColor(m.nombre, i)}
                    fillOpacity={0.08}
                    strokeWidth={2.5}
                    name={m.nombre}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold">
            Ranking de Marcas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              layout="vertical"
              data={[...marcasRanking].sort((a, b) => b.unidades - a.unidades)}
              margin={{ left: 10, right: 30 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={COLORS.border}
                horizontal={false}
              />
              <XAxis
                type="number"
                tickFormatter={(v) => (tipo === "valor" ? fmtM(v) : fmt(v))}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="nombre"
                width={100}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  if (name === "valor") return fmtM(Number(value))
                  return fmt(Number(value))
                }}
              />
              <Bar dataKey={tipo} radius={[0, 6, 6, 0]} name={tipo}>
                {marcasRanking.map((r, i) => (
                  <Cell
                    key={r.id}
                    fill={
                      selectedMarcaIds.has(r.marcaId)
                        ? getBrandColor(r.nombre, i)
                        : COLORS.muted
                    }
                    opacity={selectedMarcaIds.has(r.marcaId) ? 1 : 0.4}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {selectedMarcas.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-muted-foreground">
            Top productos por marca
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {selectedMarcas.map((m, i) => {
              const productos = topProductosPorMarca[m.id] || []
              return (
                <Card key={m.id}>
                  <CardHeader
                    className="pb-1"
                    style={{ borderBottom: `3px solid ${getBrandColor(m.nombre, i)}` }}
                  >
                    <CardTitle
                      className="text-sm font-bold"
                      style={{ color: getBrandColor(m.nombre, i) }}
                    >
                      {m.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                            #
                          </th>
                          <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                            Producto
                          </th>
                          <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                            {tipo === "unidades" ? "Unidades" : "Valor"}
                          </th>
                          <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                            Part.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.slice(0, 10).map((p, j) => (
                          <tr key={p.id} className="border-t border-border">
                            <td className="px-3 py-2 text-muted-foreground">
                              {j + 1}
                            </td>
                            <td className="px-3 py-2 font-medium">
                              {p.producto}
                            </td>
                            <td className="px-3 py-2 text-right">
                              {tipo === "unidades"
                                ? fmt(p.unidades)
                                : fmtM(p.valor)}
                            </td>
                            <td
                              className="px-3 py-2 text-right font-medium"
                              style={{ color: getBrandColor(m.nombre, i) }}
                            >
                              {p.participacion}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {selectedMarcas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 text-4xl">👆</div>
            <p className="text-lg font-medium text-muted-foreground">
              Selecciona una o más marcas
            </p>
            <p className="text-sm text-muted-foreground">
              para ver ranking, top productos y comparación
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
