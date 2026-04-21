import { useState, useEffect } from "react"
import { TooltipProvider } from "./components/ui/tooltip"
import { Sheet, SheetContent } from "./components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select"
import { PanelLeft, PanelLeftClose, Menu } from "lucide-react"
import { Login } from "./components/Login"
import { FilterProvider, type DataState } from "./components/FilterContext"
import { PageResumen } from "./components/PageResumen"
import { PageMarcas } from "./components/PageMarcas"
import { PageAlertas } from "./components/PageAlertas"
import { PageFarmacias } from "./components/PageFarmacias"
import { PageSugeridos } from "./components/PageSugeridos"
import db from "../db.json"

const STORAGE_KEY = "phardash_logged"
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

const NAV = [
  { id: "resumen", label: "Resumen" },
  { id: "marcas", label: "Marcas" },
  { id: "alertas", label: "Alertas" },
  { id: "sugeridos", label: "Sugeridos" },
  { id: "farmacias", label: "Farmacias" },
]

type PageProps = {
  active: string
  onNav: (id: string) => void
  onLogout: () => void
  isOpen: boolean
}

function DashboardSidebar({ active, onNav, onLogout, isOpen }: PageProps) {
  return (
    <aside
      className={`hidden h-svh shrink-0 flex-col bg-primary text-primary-foreground transition-all duration-300 md:flex ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <div className="flex flex-col gap-1 border-b border-primary/20 p-4">
        <div className="flex items-center gap-2.5">
          {/* <img
            src={alcostoFamily}
            alt="Alkosto"
            className="size-10 shrink-0 rounded-lg object-cover"
          /> */}
          💊
          {isOpen && (
            <div>
              <div className="text-base font-bold tracking-tight">
                Phar Dash
              </div>
              <div className="text-xs text-primary-foreground/60">
                Panel analítico
              </div>
            </div>
          )}
        </div>
      </div>

      <nav
        className={`flex flex-1 flex-col gap-1 p-2 ${!isOpen ? "items-center" : ""}`}
      >
        {NAV.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`cursor-pointer rounded-lg text-left text-sm font-medium transition-all ${
              isOpen ? "px-3 py-2.5" : "p-2.5"
            } ${
              active === item.id
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
            }`}
          >
            {isOpen ? item.label : item.label[0]}
          </button>
        ))}
      </nav>

      <div className="border-t border-primary/20 p-2">
        <button
          onClick={onLogout}
          className={`w-full rounded-lg text-left text-sm font-medium text-primary-foreground/70 transition-all hover:bg-primary-foreground/10 hover:text-primary-foreground ${
            isOpen ? "px-3 py-2" : "p-2.5"
          }`}
        >
          {isOpen ? "Cerrar sesión" : "🚪"}
        </button>
      </div>
    </aside>
  )
}

function DashboardLayout() {
  const [page, setPage] = useState("resumen")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedFarmaciaId, setSelectedFarmaciaId] = useState<number | null>(
    null
  )
  const [data, setData] = useState<DataState>({
    farmacias: [],
    ventas: [],
    grupos: [],
    top10: [],
    marcas: [],
    marcasData: [],
    alertas: [],
    skus: [],
    sugeridos: [],
    loading: true,
  })

  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}`)

      if (response.ok) {
        const apiData = await response.json()
        setData({
          ventas: apiData.ventas || [],
          farmacias: apiData.farmacias || [],
          grupos: apiData.grupos || [],
          top10: apiData.top10 || [],
          marcas: apiData.marcas || [],
          marcasData: apiData.marcasData || [],
          alertas: apiData.alertas || [],
          skus: apiData.skus || [],
          sugeridos: apiData.sugeridos || [],
          loading: false,
        })
      } else {
        throw new Error("API response not ok")
      }
    } catch {
      setData({
        ventas: db.ventas,
        farmacias: db.farmacias,
        grupos: db.grupos,
        top10: db.top10,
        marcas: db.marcas,
        marcasData: db.marcasData,
        alertas: db.alertas,
        skus: db.skus,
        sugeridos: db.sugeridos || [],
        loading: false,
      })
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    window.location.reload()
  }

  const getFarmaciaNombre = (): string => {
    if (selectedFarmaciaId === null) return "Global"
    const farm = data.farmacias.find((f) => Number(f.id) === selectedFarmaciaId)
    return farm?.nombre || "Global"
  }

  const filterContext = {
    selectedFarmaciaId,
    setSelectedFarmaciaId,
    getFarmaciaNombre,
    farmacias: data.farmacias,
  }

  if (data.loading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 text-4xl">💊</div>
          <p className="text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  const pages: Record<string, React.ReactNode> = {
    resumen: <PageResumen data={data} />,
    marcas: <PageMarcas data={data} />,
    alertas: <PageAlertas data={data} />,
    sugeridos: <PageSugeridos data={data} />,
    farmacias: <PageFarmacias data={data} refetch={fetchData} />,
  }

  return (
    <FilterProvider value={filterContext}>
      <div className="flex h-svh w-full bg-background">
        <TooltipProvider>
          <DashboardSidebar
            active={page}
            onNav={(id) => {
              setPage(id)
              setMobileMenuOpen(false)
            }}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
          />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent
              side="left"
              className="w-70 p-0"
              showCloseButton={true}
            >
              <div className="flex h-screen w-70 flex-col bg-primary text-primary-foreground">
                <div className="flex flex-col gap-1 border-b border-white/20 p-4">
                  <div className="flex items-center gap-3">
                    {/* <img
                      src={alcostoFamily}
                      alt="Alkosto"
                      className="size-10 shrink-0 rounded-lg object-cover"
                    /> */}
                    💊
                    <div>
                      <div className="text-base font-bold tracking-tight">
                        Phar Dash
                      </div>
                      <div className="text-xs text-white/60">
                        Panel analítico
                      </div>
                    </div>
                  </div>
                </div>
                <nav className="flex flex-1 flex-col gap-1 p-3">
                  {NAV.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setPage(item.id)
                        setMobileMenuOpen(false)
                      }}
                      className={`w-full rounded-lg px-3 py-3 text-left text-sm font-medium transition-all ${
                        page === item.id
                          ? "bg-white/20 text-white"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="border-t border-white/20 p-3">
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </TooltipProvider>
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden size-8 items-center justify-center rounded-md hover:bg-muted md:flex"
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="size-4" />
                ) : (
                  <PanelLeft className="size-4" />
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex size-8 items-center justify-center rounded-md hover:bg-muted md:hidden"
              >
                <Menu className="size-4" />
              </button>
              <p className="text-sm text-muted-foreground">
                Demo User · {new Date().getFullYear()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={
                  selectedFarmaciaId === null
                    ? "all"
                    : String(selectedFarmaciaId)
                }
                onValueChange={(v) =>
                  setSelectedFarmaciaId(v === "all" ? null : Number(v))
                }
              >
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="🌍 Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌍 Global (Todas)</SelectItem>
                  {data.farmacias.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      🏪 {f.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 rounded-full bg-[#27AE60]/10 px-3 py-1">
                <span className="size-2 animate-pulse rounded-full bg-[#27AE60]" />
                <span className="text-xs font-medium text-[#27AE60]">
                  Sistema activo
                </span>
              </div>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6">
            <div className="w-full">
              {pages[page] || (
                <h1 className="text-2xl font-bold capitalize">{page}</h1>
              )}
            </div>
          </div>
        </main>
      </div>
    </FilterProvider>
  )
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true"
  })

  const handleLogin = () => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return <DashboardLayout />
}
