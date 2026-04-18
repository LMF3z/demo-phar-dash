import { useState, useEffect } from "react"
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
import { COLORS, STORE_COLORS, fmt } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
        <p className="text-xs font-medium">{label}</p>
        <p className="text-sm font-bold" style={{ color: COLORS.primary }}>
          {fmt(payload[0].value)} uds
        </p>
      </div>
    )
  }
  return null
}

export function PageMarcas({ data }: Props) {
  const { selectedFarmaciaId, getFarmaciaNombre } = useFilter()
  const [marca, setMarca] = useState("Bayer")
  const { marcas, marcasData, farmacias } = data
  const currentFarmacia = getFarmaciaNombre()

  const [marcaData, setMarcaData] = useState<{
    mensual: { mes: string; unidades: number }[]
    porFarmacia: { farmacia: string; unidades: number }[]
  } | null>(null)

  useEffect(() => {
    const marcaId = Number(marcas.find((ma) => ma.nombre === marca)?.id)
    const found = marcasData.find((m) => m.marcaId === marcaId)
    if (found) {
      if (selectedFarmaciaId === null) {
        setMarcaData({ mensual: found.mensual, porFarmacia: found.porFarmacia })
      } else {
        const farm = farmacias.find((f) => f.id === selectedFarmaciaId)
        if (farm) {
          const farmData = found.porFarmacia.find(
            (p) => p.farmacia === farm.nombre,
          )
          const totalPorFarmacia = found.porFarmacia.reduce(
            (a, b) => a + b.unidades,
            0,
          )
          const mensual =
            farmData && totalPorFarmacia > 0
              ? found.mensual.map((m) => ({
                  mes: m.mes,
                  unidades: Math.round(
                    (m.unidades * farmData.unidades) / totalPorFarmacia,
                  ),
                }))
              : found.mensual
          setMarcaData({
            mensual,
            porFarmacia: farmData
              ? [{ farmacia: farm.nombre, unidades: farmData.unidades }]
              : [],
          })
        }
      }
    }
  }, [selectedFarmaciaId, marca, marcasData, marcas, farmacias])

  const ventasPorMes = marcaData?.mensual || []
  const porFarmacia = marcaData?.porFarmacia || []
  const totalMarca = ventasPorMes.reduce((a, b) => a + b.unidades, 0)

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold">
        🔖 Ventas por Marca - {currentFarmacia}
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Selecciona una marca para ver el desglose mensual
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {marcas.map((m) => (
          <Button
            key={m.id}
            variant={marca === m.nombre ? "default" : "outline"}
            size="sm"
            onClick={() => setMarca(m.nombre)}
          >
            {m.nombre}
          </Button>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-center gap-4 p-3">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Marca
            </p>
            <p className="text-base font-bold" style={{ color: COLORS.primary }}>
              {marca}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Total
            </p>
            <p className="text-base font-bold">
              {fmt(totalMarca)}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Prom.
            </p>
            <p className="text-base font-bold">
              {fmt(Math.round(totalMarca / 12))}{" "}
              <span className="text-sm font-medium text-muted-foreground">
                uds
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Venta mensual – {marca}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ventasPorMes}>
                <defs>
                  <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="unidades"
                  stroke={COLORS.primary}
                  strokeWidth={2.5}
                  fill="url(#gm)"
                  name="Unidades"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">
              Por farmacia – {marca}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={porFarmacia} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="farmacia" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="unidades" name="Unidades" radius={[6, 6, 0, 0]}>
                  {porFarmacia.map((d, i) => (
                    <Cell
                      key={i}
                      fill={STORE_COLORS[d.farmacia] || COLORS.primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}