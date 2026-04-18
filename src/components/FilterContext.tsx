import { createContext, useContext } from "react"

export type Farmacia = {
  id: number
  nombre: string
  ciudad: string
  barrio?: string
  nit?: string
  tel?: string
  vendedor?: string
  activa: boolean
}

export type Venta = {
  id: number
  farmaciaId: number
  mes: string
  unidades: number
  valor: number
}

export type Grupo = {
  id: number
  farmaciaId: number | null
  grupo: string
  peso: number
}

export type TopArticulo = {
  id: number
  farmaciaId: number | null
  articulo: string
  unidades: number
  valor: number
}

export type Marca = {
  id: number
  nombre: string
}

export type MarcaData = {
  id: number
  marcaId: number
  farmaciaId: number | null
  mensual: { mes: string; unidades: number }[]
  porFarmacia: { farmacia: string; unidades: number }[]
}

export type Alerta = {
  id: number
  farmaciaId: number
  producto: string
  stock: number
  diasRotacion: number
  nivel: string
}

export type SkuData = {
  farmaciaId: number
  total: number
}

export type DataState = {
  farmacias: Farmacia[]
  ventas: Venta[]
  grupos: Grupo[]
  top10: TopArticulo[]
  marcas: Marca[]
  marcasData: MarcaData[]
  alertas: Alerta[]
  skus: SkuData[]
  loading: boolean
}

type FilterContextType = {
  selectedFarmaciaId: number | null
  setSelectedFarmaciaId: (id: number | null) => void
  getFarmaciaNombre: () => string
  farmacias: Farmacia[]
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: FilterContextType
}) {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  )
}

export function useFilter() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilter must be used within FilterProvider")
  }
  return context
}