export const COLORS = {
  primary: "#1447e6",
  primary2: "#110f0e",
  accent: "#2b7fff",
  success: "#27AE60",
  danger: "#E74C3C",
  warn: "#F39C12",
  bg: "#F0F6FC",
  card: "#FFFFFF",
  text: "#110f0e",
  muted: "#6B8299",
  border: "#D0DFF0",
}

export const PIE_COLORS = [
  "#1447e6",
  "#27AE60",
  "#F5A623",
  "#E74C3C",
  "#8E44AD",
  "#16A085",
]

export const STORE_COLORS: Record<string, string> = {
  FarmaVida: "#1447e6",
  FarmaMuerte: "#27AE60",
  FarmaPurgatorio: "#F5A623",
}

export const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

export const fmt = (n: number) => new Intl.NumberFormat("es-CO").format(n)
export const fmtM = (n: number) =>
  n >= 1e9
    ? `$${(n / 1e9).toFixed(1)}B`
    : n >= 1e6
      ? `$${(n / 1e6).toFixed(1)}M`
      : `$${fmt(n)}`

export const getCurrentYear = () => new Date().getFullYear().toString()