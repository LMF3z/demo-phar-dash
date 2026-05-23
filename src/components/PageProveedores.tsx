import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { COLORS, fmt, fmtM } from "./constants"
import type { DataState, Proveedor, OrdenCompra, OrdenCompraItem } from "./FilterContext"
import { useFilter } from "./FilterContext"

type Props = {
  data: DataState
}

type ProveedorForm = {
  nombre: string
  nit: string
  telefono: string
  email: string
  contacto: string
  diasFlete: string
}

type OrdenForm = {
  proveedorId: string
  farmaciaId: string
  fechaPedido: string
  items: { producto: string; cantidad: string; precioUnit: string }[]
}

const emptyProveedorForm: ProveedorForm = {
  nombre: "",
  nit: "",
  telefono: "",
  email: "",
  contacto: "",
  diasFlete: "",
}

const todayStr = () => new Date().toISOString().split("T")[0]

function calcularTracking(orden: OrdenCompra, proveedor: Proveedor | undefined) {
  if (!proveedor) return { estado: "pendiente", progreso: 0, diasRestantes: 0, label: "N/A" }
  const hoy = new Date()
  const pedido = new Date(orden.fechaPedido)
  const diff = hoy.getTime() - pedido.getTime()
  const diasTranscurridos = Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0)
  const diasEstimados = proveedor.diasFlete
  const progreso = Math.min(Math.round((diasTranscurridos / diasEstimados) * 100), 100)
  const diasRestantes = Math.max(diasEstimados - diasTranscurridos, 0)

  let estado: string
  if (orden.estado === "recibido") {
    estado = "recibido"
  } else if (diasTranscurridos > diasEstimados) {
    estado = "retrasado"
  } else if (diasTranscurridos >= Math.round(diasEstimados * 0.75)) {
    estado = "en_transito"
  } else {
    estado = "pendiente"
  }

  const label = orden.estado === "recibido"
    ? `Recibido (${diasTranscurridos}d)`
    : diasTranscurridos > diasEstimados
      ? `Retrasado ${diasTranscurridos - diasEstimados}d`
      : `${diasTranscurridos}/${diasEstimados}d`

  return { estado, progreso, diasRestantes, label }
}

const estadoBadge: Record<string, { color: string; bg: string; icon: string }> = {
  pendiente: { color: COLORS.muted, bg: `${COLORS.muted}20`, icon: "📋" },
  en_transito: { color: COLORS.warn, bg: `${COLORS.warn}20`, icon: "🚚" },
  retrasado: { color: COLORS.danger, bg: `${COLORS.danger}20`, icon: "⚠" },
  recibido: { color: COLORS.success, bg: `${COLORS.success}20`, icon: "✅" },
}

export function PageProveedores({ data }: Props) {
  const { selectedFarmaciaId } = useFilter()
  const { proveedores, ordenesCompra, farmacias } = data
  const [tab, setTab] = useState<"directorio" | "ordenes">("directorio")

  const [provModal, setProvModal] = useState(false)
  const [provForm, setProvForm] = useState<ProveedorForm>(emptyProveedorForm)
  const [provErrors, setProvErrors] = useState<Record<string, string>>({})

  const [ordenModal, setOrdenModal] = useState(false)
  const [ordenForm, setOrdenForm] = useState<OrdenForm>({
    proveedorId: "",
    farmaciaId: "",
    fechaPedido: todayStr(),
    items: [{ producto: "", cantidad: "", precioUnit: "" }],
  })

  const [filterProv, setFilterProv] = useState("all")
  const [filterEstado, setFilterEstado] = useState("all")

  const proveedorMap = new Map(proveedores.map((p) => [p.id, p]))

  const ordenesFiltradas = ordenesCompra
    .filter((o) => selectedFarmaciaId === null || o.farmaciaId === selectedFarmaciaId)
    .filter((o) => filterProv === "all" || o.proveedorId === Number(filterProv))
    .filter((o) => filterEstado === "all" || calcularTracking(o, proveedorMap.get(o.proveedorId)).estado === filterEstado)
    .sort((a, b) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime())

  const validateProveedor = () => {
    const e: Record<string, string> = {}
    if (!provForm.nombre.trim()) e.nombre = "Requerido"
    if (!provForm.nit.trim()) e.nit = "Requerido"
    if (!provForm.diasFlete.trim()) e.diasFlete = "Requerido"
    return e
  }

  const handleSaveProveedor = async () => {
    const e = validateProveedor()
    if (Object.keys(e).length) {
      setProvErrors(e)
      return
    }
    try {
      const res = await fetch("http://localhost:3001/proveedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...provForm, diasFlete: Number(provForm.diasFlete), activo: true }),
      })
      if (res.ok) {
        setProvForm(emptyProveedorForm)
        setProvErrors({})
        setProvModal(false)
      }
    } catch {
      console.error("Error saving proveedor")
    }
  }

  const totalOrden = (items: OrdenForm["items"]) =>
    items.reduce((sum, it) => sum + (Number(it.cantidad) || 0) * (Number(it.precioUnit) || 0), 0)

  const handleSaveOrden = async () => {
    const items: OrdenCompraItem[] = ordenForm.items
      .filter((it) => it.producto.trim())
      .map((it) => ({
        producto: it.producto,
        cantidad: Number(it.cantidad),
        precioUnit: Number(it.precioUnit),
      }))
    if (!items.length || !ordenForm.proveedorId || !ordenForm.farmaciaId) return
    try {
      const res = await fetch("http://localhost:3001/ordenesCompra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proveedorId: Number(ordenForm.proveedorId),
          farmaciaId: Number(ordenForm.farmaciaId),
          fechaPedido: ordenForm.fechaPedido,
          items,
          total: totalOrden(ordenForm.items),
          estado: "pendiente",
        }),
      })
      if (res.ok) {
        setOrdenForm({
          proveedorId: "",
          farmaciaId: "",
          fechaPedido: todayStr(),
          items: [{ producto: "", cantidad: "", precioUnit: "" }],
        })
        setOrdenModal(false)
      }
    } catch {
      console.error("Error saving orden")
    }
  }

  const [expandedId, setExpandedId] = useState<number | null>(null)

  return (
    <div>
      <h2 className="mb-1 text-2xl font-bold">📦 Proveedores</h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Directorio de proveedores y seguimiento de órdenes de compra
      </p>

      <div className="mb-5 flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(["directorio", "ordenes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              tab === t ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t === "directorio" ? "📋 Directorio" : "📦 Órdenes de Compra"}
          </button>
        ))}
      </div>

      {tab === "directorio" && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {proveedores.length} proveedores registrados
            </p>
            <Dialog open={provModal} onOpenChange={setProvModal}>
              <DialogTrigger asChild>
                <Button>+ Registrar proveedor</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Registrar nuevo proveedor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {[
                    { k: "nombre", label: "Nombre del proveedor", ph: "Distribuidora ABC" },
                    { k: "nit", label: "NIT", ph: "900.123.456-7" },
                    { k: "telefono", label: "Teléfono", ph: "601-555-1000" },
                    { k: "email", label: "Email", ph: "ventas@abc.com" },
                    { k: "contacto", label: "Persona de contacto", ph: "María López" },
                    { k: "diasFlete", label: "Días de flete", ph: "5" },
                  ].map(({ k, label, ph }) => (
                    <div key={k} className="space-y-1.5">
                      <Label>
                        {label}
                        {["nombre", "nit", "diasFlete"].includes(k) ? " *" : ""}
                      </Label>
                      <Input
                        placeholder={ph}
                        value={provForm[k as keyof ProveedorForm]}
                        onChange={(e) => {
                          setProvForm((p) => ({ ...p, [k]: e.target.value }))
                          setProvErrors((p) => ({ ...p, [k]: "" }))
                        }}
                        className={provErrors[k] ? "border-destructive" : ""}
                      />
                      {provErrors[k] && (
                        <p className="text-xs text-destructive">{provErrors[k]}</p>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Button className="flex-1" onClick={handleSaveProveedor}>
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setProvModal(false)
                        setProvForm(emptyProveedorForm)
                        setProvErrors({})
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {proveedores.map((p) => (
              <Card key={p.id} className="border-l-4" style={{ borderLeftColor: p.activo ? COLORS.success : COLORS.muted }}>
                <CardContent className="p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                      🏢
                    </div>
                    <Badge
                      style={{
                        backgroundColor: p.activo ? `${COLORS.success}20` : `${COLORS.muted}20`,
                        color: p.activo ? COLORS.success : COLORS.muted,
                      }}
                    >
                      {p.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <h3 className="mb-1 text-base font-bold">{p.nombre}</h3>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>🪪 NIT: {p.nit}</p>
                    <p>📞 {p.telefono}</p>
                    <p>✉ {p.email}</p>
                    <p>👤 {p.contacto}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-sm font-bold" style={{ color: COLORS.primary }}>
                    🚚 {p.diasFlete} días de flete
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "ordenes" && (
        <div>
          <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-2">
              <Select value={filterProv} onValueChange={setFilterProv}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos los proveedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_transito">En tránsito</SelectItem>
                  <SelectItem value="retrasado">Retrasado</SelectItem>
                  <SelectItem value="recibido">Recibido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={ordenModal} onOpenChange={setOrdenModal}>
              <DialogTrigger asChild>
                <Button>+ Nueva orden</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nueva orden de compra</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Proveedor *</Label>
                    <Select
                      value={ordenForm.proveedorId}
                      onValueChange={(v) => setOrdenForm((p) => ({ ...p, proveedorId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedores.filter((p) => p.activo).map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>{p.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Farmacia *</Label>
                    <Select
                      value={ordenForm.farmaciaId}
                      onValueChange={(v) => setOrdenForm((p) => ({ ...p, farmaciaId: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar farmacia" />
                      </SelectTrigger>
                      <SelectContent>
                        {farmacias.map((f) => (
                          <SelectItem key={f.id} value={String(f.id)}>{f.nombre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Fecha del pedido</Label>
                    <Input
                      type="date"
                      value={ordenForm.fechaPedido}
                      onChange={(e) => setOrdenForm((p) => ({ ...p, fechaPedido: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Productos</Label>
                    {ordenForm.items.map((item, i) => (
                      <div key={i} className="mt-2 grid grid-cols-4 gap-2">
                        <Input
                          placeholder="Producto"
                          value={item.producto}
                          onChange={(e) => {
                            const items = [...ordenForm.items]
                            items[i] = { ...items[i], producto: e.target.value }
                            setOrdenForm((p) => ({ ...p, items }))
                          }}
                          className="col-span-1"
                        />
                        <Input
                          type="number"
                          placeholder="Cant."
                          value={item.cantidad}
                          onChange={(e) => {
                            const items = [...ordenForm.items]
                            items[i] = { ...items[i], cantidad: e.target.value }
                            setOrdenForm((p) => ({ ...p, items }))
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Precio"
                          value={item.precioUnit}
                          onChange={(e) => {
                            const items = [...ordenForm.items]
                            items[i] = { ...items[i], precioUnit: e.target.value }
                            setOrdenForm((p) => ({ ...p, items }))
                          }}
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            ${fmt((Number(item.cantidad) || 0) * (Number(item.precioUnit) || 0))}
                          </span>
                          {ordenForm.items.length > 1 && (
                            <button
                              className="text-xs text-destructive hover:underline cursor-pointer"
                              onClick={() => {
                                const items = ordenForm.items.filter((_, j) => j !== i)
                                setOrdenForm((p) => ({ ...p, items }))
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() =>
                        setOrdenForm((p) => ({
                          ...p,
                          items: [...p.items, { producto: "", cantidad: "", precioUnit: "" }],
                        }))
                      }
                    >
                      + Agregar producto
                    </Button>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold">Total: {fmtM(totalOrden(ordenForm.items))}</span>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setOrdenModal(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSaveOrden}>Crear orden</Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">ID</th>
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">Proveedor</th>
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">Farmacia</th>
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">Fecha</th>
                    <th className="px-3 py-2 text-right font-bold text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-left font-bold text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesFiltradas.map((o) => {
                    const prov = proveedorMap.get(o.proveedorId)
                    const farm = farmacias.find((f) => f.id === o.farmaciaId)
                    const tracking = calcularTracking(o, prov)
                    const badge = estadoBadge[tracking.estado] || estadoBadge.pendiente
                    const expandida = expandedId === o.id
                    return (
                      <>
                        <tr
                          key={o.id}
                          className="border-t border-border cursor-pointer hover:bg-muted/50"
                          onClick={() => setExpandedId(expandida ? null : o.id)}
                        >
                          <td className="px-3 py-2.5 font-mono text-xs">#{o.id}</td>
                          <td className="px-3 py-2.5 font-medium">{prov?.nombre || "N/A"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">{farm?.nombre || "N/A"}</td>
                          <td className="px-3 py-2.5 text-muted-foreground">
                            {new Date(o.fechaPedido).toLocaleDateString("es-CO")}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium">{fmtM(o.total)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Badge style={{ backgroundColor: badge.bg, color: badge.color }}>
                                {badge.icon} {tracking.label}
                              </Badge>
                              <div className="w-20 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    width: `${tracking.progreso}%`,
                                    backgroundColor: badge.color,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandida && (
                          <tr key={`${o.id}-items`} className="bg-muted/30">
                            <td colSpan={6} className="px-6 py-3">
                              <p className="mb-2 text-xs font-bold uppercase text-muted-foreground">
                                Productos
                              </p>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-border text-muted-foreground">
                                    <th className="py-1 text-left font-medium">Producto</th>
                                    <th className="py-1 text-right font-medium">Cantidad</th>
                                    <th className="py-1 text-right font-medium">Precio Unit.</th>
                                    <th className="py-1 text-right font-medium">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {o.items.map((item, i) => (
                                    <tr key={i} className="border-b border-border/50">
                                      <td className="py-1 font-medium">{item.producto}</td>
                                      <td className="py-1 text-right">{fmt(item.cantidad)}</td>
                                      <td className="py-1 text-right">{fmtM(item.precioUnit)}</td>
                                      <td className="py-1 text-right font-medium">
                                        {fmtM(item.cantidad * item.precioUnit)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
              {ordenesFiltradas.length === 0 && (
                <p className="py-5 text-center text-muted-foreground">
                  No hay órdenes de compra para los filtros seleccionados
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
