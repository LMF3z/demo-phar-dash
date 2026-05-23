import { useMemo } from "react"
import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { MetricCard } from "./MetricCard"
import { COLORS, fmt, fmtM } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

export function PageSugeridos({ data }: Props) {
  const { selectedFarmaciaId, getFarmaciaNombre } = useFilter()
  const { farmacias, sugeridos, presupuestos } = data
  const currentFarmacia = getFarmaciaNombre()

  const sugeridosFiltrados =
    selectedFarmaciaId === null
      ? sugeridos
      : sugeridos.filter((s) => s.farmaciaId === selectedFarmaciaId)

  const urgentes = sugeridosFiltrados.filter((s) => s.urgente)
  const normales = sugeridosFiltrados.filter((s) => !s.urgente)

  const totalSugerido = sugeridosFiltrados.reduce((a, b) => a + b.sugerido, 0)
  const valorTotal = sugeridosFiltrados.reduce(
    (a, b) => a + b.sugerido * b.precio,
    0,
  )
  const totalProductos = sugeridosFiltrados.length

  const presupuesto = useMemo(() => {
    if (selectedFarmaciaId === null)
      return presupuestos.reduce((a, b) => a + b.monto, 0)
    return presupuestos.find((p) => p.farmaciaId === selectedFarmaciaId)?.monto || 0
  }, [selectedFarmaciaId, presupuestos])

  const gastoAcumulado = useMemo(() => {
    let acum = 0
    const ordenados = [...urgentes, ...normales]
    const mapa: Record<number, boolean> = {}
    for (const s of ordenados) {
      const costo = s.sugerido * s.precio
      if (acum + costo <= presupuesto) {
        acum += costo
        mapa[s.id] = true
      } else {
        mapa[s.id] = false
      }
    }
    return { acum, mapa }
  }, [urgentes, normales, presupuesto])

  const ratioPresupuesto = presupuesto > 0 ? gastoAcumulado.acum / presupuesto : 0
  const barColor =
    ratioPresupuesto < 0.6
      ? COLORS.success
      : ratioPresupuesto < 0.85
        ? COLORS.warn
        : COLORS.danger

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">
        🛒 Sugeridos de Compra
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Productos a reorderar basados en ventas de los últimos 3 meses - {currentFarmacia}
      </p>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Card className="border-l-3" style={{ borderLeftColor: COLORS.danger }}>
          <CardContent className="p-2">
            <p className="text-xs font-medium text-muted-foreground">
              Urgentes
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: COLORS.danger }}
            >
              {urgentes.length}
            </p>
            <p className="text-xs text-muted-foreground">productos</p>
          </CardContent>
        </Card>
        <Card className="border-l-3" style={{ borderLeftColor: COLORS.success }}>
          <CardContent className="p-2">
            <p className="text-xs font-medium text-muted-foreground">
              Total Productos
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: COLORS.success }}
            >
              {totalProductos}
            </p>
            <p className="text-xs text-muted-foreground">a reorderar</p>
          </CardContent>
        </Card>
        <Card className="border-l-3" style={{ borderLeftColor: COLORS.primary }}>
          <CardContent className="p-2">
            <p className="text-xs font-medium text-muted-foreground">
              Unidades Sugeridas
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: COLORS.primary }}
            >
              {fmt(totalSugerido)}
            </p>
            <p className="text-xs text-muted-foreground">total</p>
          </CardContent>
        </Card>
        <Card className="border-l-3" style={{ borderLeftColor: COLORS.warn }}>
          <CardContent className="p-2">
            <p className="text-xs font-medium text-muted-foreground">
              Valor Estimado
            </p>
            <p
              className="text-xl font-bold"
              style={{ color: COLORS.warn }}
            >
              {fmtM(valorTotal)}
            </p>
            <p className="text-xs text-muted-foreground">compra total</p>
          </CardContent>
        </Card>
      </div>

      {presupuesto > 0 && (
        <Card className="mb-4">
          <CardContent className="p-3">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-bold">💰 Presupuesto del Mes</p>
              <p className="text-xs text-muted-foreground">📍 {currentFarmacia}</p>
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <MetricCard
                icon="💰"
                label="Presupuesto total"
                value={fmtM(presupuesto)}
                color={COLORS.primary}
              />
              <MetricCard
                icon="🛒"
                label="Gasto estimado"
                value={fmtM(gastoAcumulado.acum)}
                color={COLORS.warn}
              />
              <MetricCard
                icon="📊"
                label="Saldo disponible"
                value={fmtM(presupuesto - gastoAcumulado.acum)}
                color={barColor}
              />
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(ratioPresupuesto * 100, 100)}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {fmtM(gastoAcumulado.acum)} de {fmtM(presupuesto)} (
              {Math.round(ratioPresupuesto * 100)}%)
            </p>
          </CardContent>
        </Card>
      )}

      {urgentes.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="flex size-3 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.danger }}
            />
            <h3 className="text-sm font-bold text-muted-foreground">
              REORDEN URGENTE - Stock bajo
            </h3>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Sede
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Ventas 3M
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        En tránsito
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Sugerido
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Presup.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {urgentes.map((s) => {
                      const farm = farmacias.find(
                        (f) => f.id === s.farmaciaId,
                      )
                      return (
                        <tr
                          key={s.id}
                          className="border-t border-border bg-red-50/50"
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-medium">{s.producto}</div>
                            <div className="text-xs text-muted-foreground">
                              {s.marca}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                            {s.codigo}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              style={{
                                backgroundColor: `${COLORS.primary}15`,
                                color: COLORS.primary,
                              }}
                            >
                              {farm?.nombre || "N/A"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium">
                            {fmt(s.ventas3m)}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span
                              className={`font-medium ${
                                s.stock < 10
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {fmt(s.stock)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span
                              className={`font-bold ${
                                s.transito > 0
                                  ? "text-blue-600"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {s.transito > 0 ? fmt(s.transito) : "—"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="font-bold text-green-700">
                              +{fmt(s.sugerido)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                            {fmtM(s.sugerido * s.precio)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge
                              style={{
                                backgroundColor: `${COLORS.danger}20`,
                                color: COLORS.danger,
                              }}
                            >
                              Urgente
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {gastoAcumulado.mapa[s.id] ? (
                              <span title="Cubre dentro del presupuesto disponible" style={{ color: COLORS.success, fontSize: 18 }}>✅</span>
                            ) : (
                              <span title="Excede el presupuesto restante" style={{ color: COLORS.danger, fontSize: 18 }}>⚠</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {normales.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span
              className="flex size-3 items-center justify-center rounded-full bg-green-500"
            />
            <h3 className="text-sm font-bold text-muted-foreground">
              REORDEN NORMAL - Stock OK pero bajo nivel óptimo
            </h3>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Producto
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Código
                      </th>
                      <th className="px-3 py-2 text-left font-bold text-muted-foreground">
                        Sede
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Ventas 3M
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Stock
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        En tránsito
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Sugerido
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Estado
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Presup.
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {normales.map((s) => {
                      const farm = farmacias.find(
                        (f) => f.id === s.farmaciaId,
                      )
                      return (
                        <tr
                          key={s.id}
                          className="border-t border-border"
                        >
                          <td className="px-3 py-2.5">
                            <div className="font-medium">{s.producto}</div>
                            <div className="text-xs text-muted-foreground">
                              {s.marca}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                            {s.codigo}
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              style={{
                                backgroundColor: `${COLORS.primary}15`,
                                color: COLORS.primary,
                              }}
                            >
                              {farm?.nombre || "N/A"}
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium">
                            {fmt(s.ventas3m)}
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="font-medium">
                              {fmt(s.stock)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className={`font-bold ${s.transito > 0 ? "text-blue-600" : "text-muted-foreground"}`}>
                              {s.transito > 0 ? fmt(s.transito) : "—"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <span className="font-bold text-green-700">
                              +{fmt(s.sugerido)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-muted-foreground">
                            {fmtM(s.sugerido * s.precio)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <Badge
                              style={{
                                backgroundColor: `${COLORS.success}15`,
                                color: COLORS.success,
                              }}
                            >
                              Normal
                            </Badge>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {gastoAcumulado.mapa[s.id] ? (
                              <span title="Cubre dentro del presupuesto disponible" style={{ color: COLORS.success, fontSize: 18 }}>✅</span>
                            ) : (
                              <span title="Excede el presupuesto restante" style={{ color: COLORS.danger, fontSize: 18 }}>⚠</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {sugeridosFiltrados.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="mb-3 text-4xl">✅</div>
            <p className="text-lg font-medium text-muted-foreground">
              No hay productos por reorder
            </p>
            <p className="text-sm text-muted-foreground">
              El inventario está bien balanceado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
