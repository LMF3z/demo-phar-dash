import { useState } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { MetricCard } from "./MetricCard"
import { COLORS, STORE_COLORS, PIE_COLORS, MONTHS, fmt, fmtM } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"
import { getCurrentYear } from "./constants"

type Props = {
  data: DataState
}

const CustomTooltip = ({
  active,
  payload,
  label,
  tipo,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
  tipo: "unidades" | "valor"
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-sm font-bold" style={{ color: COLORS.primary }}>
          {tipo === "unidades"
            ? fmt(payload[0].value)
            : fmtM(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export function PageResumen({ data }: Props) {
  const { selectedFarmaciaId, getFarmaciaNombre } = useFilter()
  const { farmacias, ventas, alertas, grupos, top10 } = data
  const [selectedMes, setSelectedMes] = useState<string | null>(null)
  const [tipo, setTipo] = useState<"unidades" | "valor">("unidades")
  const [tipoTop10] = useState<"unidades" | "valor">("unidades")

  const filteredVentas =
    selectedFarmaciaId === null
      ? ventas
      : ventas.filter((v) => v.farmaciaId === selectedFarmaciaId)

  const filteredVentasPorMes = selectedMes
    ? filteredVentas.filter((v) => v.mes === selectedMes)
    : filteredVentas

  const filteredAlertas =
    selectedFarmaciaId === null
      ? alertas
      : alertas.filter((a) => a.farmaciaId === selectedFarmaciaId)

  const totalUnidades = filteredVentasPorMes.reduce(
    (a, b) => a + b.unidades,
    0,
  )
  const totalValor = filteredVentasPorMes.reduce((a, b) => a + b.valor, 0)
  const totalFarmacias = selectedFarmaciaId === null ? farmacias.length : 1

  const ventasPorMes = MONTHS.map((mes) => ({
    mes,
    unidades: filteredVentasPorMes
      .filter((v) => v.mes === mes)
      .reduce((a, b) => a + b.unidades, 0),
    valor: filteredVentasPorMes
      .filter((v) => v.mes === mes)
      .reduce((a, b) => a + b.valor, 0),
  }))

  const ventasPorFarmacia = farmacias.map((f) => {
    const farmVentas = ventas.filter(
      (v) => Number(v.farmaciaId) === Number(f.id),
    )
    const skuBase = 8 + Number(f.id) * 3
    const randomSkus = skuBase + Math.floor(Math.random() * 5)
    return {
      ...f,
      total: farmVentas.reduce((a, b) => a + b.unidades, 0),
      valor: farmVentas.reduce((a, b) => a + b.valor, 0),
      skus: randomSkus,
    }
  })

  const globalSkus = ventasPorFarmacia.reduce((a, b) => a + b.skus, 0)

  const gruposFiltrados = grupos.filter((g) =>
    selectedFarmaciaId === null
      ? g.farmaciaId !== null
      : g.farmaciaId === selectedFarmaciaId,
  )

  const gruposConDatos = gruposFiltrados.map((g) => ({
    ...g,
    valor: Math.round(totalValor * (g.peso / 100)),
    unidades: Math.round(totalUnidades * (g.peso / 100)),
  }))

  const gruposParaGrafico =
    tipo === "unidades"
      ? gruposConDatos.map((g) => ({
          ...g,
          mostrar: g.unidades,
          label: `${g.unidades.toLocaleString()}`,
        }))
      : gruposConDatos.map((g) => ({
          ...g,
          mostrar: g.valor,
          label: fmtM(g.valor),
        }))

  const currentFarmacia = getFarmaciaNombre()

  const top10Filtrado =
    selectedFarmaciaId === null
      ? top10
      : top10.filter((t) => t.farmaciaId === selectedFarmaciaId)
  const sorted = [...top10Filtrado].sort((a, b) => {
    const aVal = tipoTop10 === "unidades" ? a.unidades : a.valor
    const bVal = tipoTop10 === "unidades" ? b.unidades : b.valor
    return bVal - aVal
  })

  return (
    <div className="flex min-h-[calc(100vh-200px)] flex-col">
      <div>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {currentFarmacia === "Global"
              ? `Resumen General ${getCurrentYear()}`
              : `Resumen - ${currentFarmacia}`}
          </h2>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {(["unidades", "valor"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTipo(t)}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  tipo === t
                    ? "bg-background shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t === "unidades" ? "Unidades" : "Valor"}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-2 grid grid-cols-2 gap-2 md:grid-cols-5">
          <MetricCard
            icon="🏪"
            label="Farmacias"
            value={totalFarmacias}
            sub={selectedFarmaciaId ? getFarmaciaNombre() : "Todas activas"}
          />
          <MetricCard
            icon="📦"
            label={tipo === "unidades" ? "Total unidades" : "Total valor"}
            value={tipo === "unidades" ? fmt(totalUnidades) : fmtM(totalValor)}
            sub={currentFarmacia}
            color={COLORS.success}
          />
          <MetricCard
            icon="💰"
            label="Total ventas"
            value={fmtM(totalValor)}
            sub={currentFarmacia}
            color={COLORS.accent}
          />
          <MetricCard
            icon="🔔"
            label="Alertas activas"
            value={filteredAlertas.length}
            sub={currentFarmacia}
            color={COLORS.danger}
          />
          <MetricCard
            icon="📋"
            label="SKUs activos"
            value={globalSkus}
            sub={currentFarmacia}
            color={COLORS.warn}
          />
        </div>

        {selectedFarmaciaId === null && (
          <Card className="mb-2">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-bold">
                Ventas por farmacia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
                {ventasPorFarmacia.map((f) => (
                  <div
                    key={f.id}
                    className="rounded-md border-l-2 bg-muted px-2 py-1.5"
                    style={{ borderLeftColor: STORE_COLORS[f.nombre] }}
                  >
                    <p
                      className="text-xs font-bold"
                      style={{ color: STORE_COLORS[f.nombre] }}
                    >
                      {f.nombre}
                    </p>
                    <p className="text-lg font-bold">{fmt(f.total)}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtM(f.valor)}
                    </p>
                    <p className="text-xs" style={{ color: COLORS.warn }}>
                      {f.skus} SKUs
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">
                Tendencia de ventas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={ventasPorMes}>
                  <defs>
                    <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={COLORS.primary}
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS.primary}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={
                      tipo === "valor" ? (v: number) => fmtM(v) : undefined
                    }
                  />
                  <Tooltip content={<CustomTooltip tipo={tipo} />} />
                  <Area
                    type="monotone"
                    dataKey={tipo}
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#gu)"
                    name={tipo === "unidades" ? "Unidades" : "Valor"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">
                  Peso por Grupo
                </CardTitle>
                <Select
                  value={selectedMes || "all"}
                  onValueChange={(v) => setSelectedMes(v === "all" ? null : v)}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Año completo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Año completo</SelectItem>
                    {MONTHS.map((mes) => (
                      <SelectItem key={mes} value={mes}>
                        {mes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={gruposParaGrafico}
                        dataKey="mostrar"
                        nameKey="grupo"
                        cx="50%"
                        cy="50%"
                        outerRadius={85}
                        innerRadius={45}
                        paddingAngle={2}
                        stroke="none"
                        label={({
                          cx,
                          cy,
                          midAngle = 0,
                          innerRadius,
                          outerRadius,
                          percent = 0,
                        }) => {
                          const r =
                            innerRadius + (outerRadius - innerRadius) * 0.5
                          const rad = (midAngle * Math.PI) / 180
                          const x = cx + r * Math.cos(-rad)
                          const y = cy + r * Math.sin(-rad)
                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#fff"
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={12}
                              fontWeight={700}
                            >
                              {`${Math.round(percent * 100)}%`}
                            </text>
                          )
                        }}
                      >
                        {gruposConDatos.map((_, i) => (
                          <Cell
                            key={i}
                            fill={PIE_COLORS[i % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => {
                          if (name === "peso") return [`${v}%`, "Peso"]
                          return [v, name]
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col justify-center">
                  {gruposParaGrafico.slice(0, 5).map((g, i) => (
                    <div key={g.id} className="mb-2.5">
                      <div className="mb-1 flex justify-between">
                        <span className="text-sm font-medium">{g.grupo}</span>
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        >
                          {tipo === "unidades"
                            ? g.unidades.toLocaleString()
                            : fmtM(g.valor)}
                        </span>
                      </div>
                      <div className="overflow-hidden rounded bg-muted">
                        <div
                          className="h-1.5 rounded"
                          style={{
                            width: `${g.peso}%`,
                            background: PIE_COLORS[i % PIE_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

<Card className="mb-3">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold">
              Tendencia de ventas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasPorMes} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => (tipo === "valor" ? fmtM(v) : fmt(v))}
                  tick={{ fontSize: 11 }}
                  width={70}
                />
                <Tooltip content={<CustomTooltip tipo={tipo} />} />
                <Bar
                  dataKey={tipo}
                  fill={COLORS.primary}
                  radius={[4, 4, 0, 0]}
                  name={tipo === "unidades" ? "Unidades" : "Valor"}
                >
                  {ventasPorMes.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i % 2 === 0 ? COLORS.primary : COLORS.accent}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

<Card className="mb-3">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold">
              Peso por Grupo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                      Mes
                    </th>
                    <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                      Unidades
                    </th>
                    <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ventasPorMes.map((r, i) => (
                    <tr
                      key={i}
                      className="border-t border-border"
                    >
                      <td className="px-3 py-2 font-medium">{r.mes}</td>
                      <td className="px-3 py-2 text-right">
                        {fmt(r.unidades as number)}
                      </td>
                      <td
                        className="px-3 py-2 text-right font-medium"
                        style={{ color: COLORS.success }}
                      >
                        {fmtM(r.valor as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

<Card className="mb-3">
          <CardHeader className="pb-1">
            <CardTitle className="text-sm font-bold">
              Ventas por Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                layout="vertical"
                data={sorted}
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={COLORS.border}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    tipoTop10 === "valor" ? fmtM(v) : fmt(v)
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="articulo"
                  width={160}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip tipo={tipoTop10} />} />
                <Bar
                  dataKey={tipoTop10}
                  radius={[0, 6, 6, 0]}
                  name={tipoTop10 === "unidades" ? "Unidades" : "Valor"}
                >
                  {sorted.map((_, i) => (
                    <Cell
                      key={i}
                      fill={`hsl(210,70%,${45 + i * 2}%)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                    Pos
                  </th>
                  <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                    Artículo
                  </th>
                  <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                    Unidades
                  </th>
                  <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr
                    key={r.id}
                    className="border-t border-border"
                    style={{
                      background: i === 0 ? `${COLORS.accent}10` : "transparent",
                    }}
                  >
                    <td className="px-3 py-2">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          background:
                            i < 3
                              ? `${PIE_COLORS[i]}20`
                              : COLORS.border,
                          color: i < 3 ? PIE_COLORS[i] : COLORS.muted,
                        }}
                      >
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">{r.articulo}</td>
                    <td className="px-3 py-2 text-right">{fmt(r.unidades)}</td>
                    <td
                      className="px-3 py-2 text-right font-medium"
                      style={{ color: COLORS.success }}
                    >
                      {fmtM(r.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}