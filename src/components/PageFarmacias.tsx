import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { STORE_COLORS } from "./constants"
import type { DataState } from "./FilterContext"

type Props = {
  data: DataState
  refetch: () => void
}

type FormData = {
  nombre: string
  ciudad: string
  barrio: string
  nit: string
  tel: string
  vendedor: string
}

const emptyForm: FormData = {
  nombre: "",
  ciudad: "",
  barrio: "",
  nit: "",
  tel: "",
  vendedor: "",
}

export function PageFarmacias({ data, refetch }: Props) {
  const [lista, setLista] = useState(data.farmacias)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<FormData>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLista(data.farmacias)
  }, [data.farmacias])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.nombre.trim()) e.nombre = "Requerido"
    if (!form.ciudad.trim()) e.ciudad = "Requerido"
    if (!form.nit.trim()) e.nit = "Requerido"
    return e
  }

  const handleSave = async () => {
    const e = validate()
    if (Object.keys(e).length) {
      setErrors(e)
      return
    }
    try {
      const res = await fetch(`http://localhost:3001/farmacias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, activa: true }),
      })
      if (res.ok) {
        refetch()
        setForm(emptyForm)
        setErrors({})
        setModalOpen(false)
      }
    } catch {
      console.error("Error saving farmacia:")
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold">⚕️ Farmacias</h2>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>+ Registrar farmacia</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar nueva farmacia</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {[
                { k: "nombre", label: "Nombre de la farmacia", ph: "FarmaVida" },
                { k: "ciudad", label: "Ciudad", ph: "Bogotá" },
                { k: "barrio", label: "Barrio / Localidad", ph: "Suba" },
                { k: "nit", label: "NIT", ph: "900111222-1" },
                { k: "tel", label: "Teléfono", ph: "601-555-0000" },
                { k: "vendedor", label: "Vendedor asignado", ph: "Nombre" },
              ].map(({ k, label, ph }) => (
                <div key={k} className="space-y-1.5">
                  <Label>
                    {label}
                    {["nombre", "ciudad", "nit"].includes(k) ? " *" : ""}
                  </Label>
                  <Input
                    placeholder={ph}
                    value={(form as any)[k]}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, [k]: e.target.value }))
                      setErrors((p) => ({ ...p, [k]: "" }))
                    }}
                    className={errors[k] ? "border-destructive" : ""}
                  />
                  {errors[k] && (
                    <p className="text-xs text-destructive">{errors[k]}</p>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleSave}>
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setModalOpen(false)
                    setForm(emptyForm)
                    setErrors({})
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
        {lista.map((f) => (
          <Card
            key={f.id}
            className="border-t-4"
            style={{
              borderTopColor: STORE_COLORS[f.nombre] || "#1447e6",
            }}
          >
            <CardContent className="p-3">
              <div className="mb-3 flex items-center justify-between">
                <div
                  className="flex size-10 items-center justify-center rounded-lg text-lg"
                  style={{
                    background: `${STORE_COLORS[f.nombre] || "#1447e6"}20`,
                  }}
                >
                  ⚕️
                </div>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{
                    background: f.activa ? "#27AE6020" : "#D0DFF0",
                    color: f.activa ? "#27AE60" : "#6B8299",
                  }}
                >
                  {f.activa ? "Activa" : "Inactiva"}
                </span>
              </div>
              <h3
                className="mb-1 text-base font-bold"
                style={{
                  color: STORE_COLORS[f.nombre] || "#1447e6",
                }}
              >
                {f.nombre}
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                {f.ciudad}
                {f.barrio ? ` · ${f.barrio}` : ""}
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                {f.nit && <p>🪪 NIT: {f.nit}</p>}
                {f.tel && <p>📞 {f.tel}</p>}
                {f.vendedor && <p>👤 {f.vendedor}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}