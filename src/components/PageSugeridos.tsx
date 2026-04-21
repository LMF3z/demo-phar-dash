import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { COLORS, fmt, fmtM } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

export function PageSugeridos({ data }: Props) {
  const { selectedFarmaciaId, getFarmaciaNombre } = useFilter()
  const { farmacias, sugeridos } = data
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
                        Sugerido
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Estado
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
                        Sugerido
                      </th>
                      <th className="px-3 py-2 text-right font-bold text-muted-foreground">
                        Valor
                      </th>
                      <th className="px-3 py-2 text-center font-bold text-muted-foreground">
                        Estado
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
