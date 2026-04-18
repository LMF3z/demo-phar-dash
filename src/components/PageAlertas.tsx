import { Badge } from "./ui/badge"
import { Card, CardContent } from "./ui/card"
import { COLORS, fmt } from "./constants"
import type { DataState } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

export function PageAlertas({ data }: Props) {
  const { selectedFarmaciaId, getFarmaciaNombre } = useFilter()
  const { farmacias, alertas } = data
  const currentFarmacia = getFarmaciaNombre()

  const alertasFiltradas =
    selectedFarmaciaId === null
      ? alertas
      : alertas.filter((a) => a.farmaciaId === selectedFarmaciaId)

  const nivelColor: Record<string, string> = {
    alto: COLORS.danger,
    medio: COLORS.warn,
    bajo: COLORS.success,
  }
  const nivelLabel: Record<string, string> = {
    alto: "Alto",
    medio: "Medio",
    bajo: "Bajo",
  }

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">
        🔔 Alertas de Baja Rotación
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Productos con rotación lenta - {currentFarmacia}
      </p>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {(["alto", "medio", "bajo"] as const).map((n) => (
          <Card
            key={n}
            className="border-l-3"
            style={{ borderLeftColor: nivelColor[n] }}
          >
            <CardContent className="p-2">
              <p className="text-xs font-medium text-muted-foreground">
                {nivelLabel[n]}
              </p>
              <p
                className="text-xl font-bold"
                style={{ color: nivelColor[n] }}
              >
                {alertasFiltradas.filter((a) => a.nivel === n).length}
              </p>
              <p className="text-xs text-muted-foreground">prod.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                {["Producto", "Farmacia", "Stock", "Días rotación", "Nivel"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-left font-bold text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {alertasFiltradas.map((a) => {
                const farm = farmacias.find((f) => f.id === a.farmaciaId)
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium">
                      {a.producto}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {farm?.nombre || "N/A"}
                    </td>
                    <td className="px-3 py-2.5">{fmt(a.stock)} uds</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 overflow-hidden rounded bg-muted">
                          <div
                            className="h-2 rounded"
                            style={{
                              width: `${Math.min(a.diasRotacion, 100)}%`,
                              background: nivelColor[a.nivel],
                            }}
                          />
                        </div>
                        <span className="font-bold min-w-[32px]">{a.diasRotacion}d</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        style={{
                          backgroundColor: `${nivelColor[a.nivel]}20`,
                          color: nivelColor[a.nivel],
                        }}
                      >
                        {nivelLabel[a.nivel]}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {alertasFiltradas.length === 0 && (
            <p className="py-5 text-center text-muted-foreground">
              No hay alertas para esta farmacia
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}