import { Card, CardContent } from "./ui/card"

type MetricCardProps = {
  icon: string
  label: string
  value: string | number
  sub?: string
  color?: string
}

export function MetricCard({ icon, label, value, sub, color }: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-2 p-2">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-base">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {label}
          </p>
          <p
            className="text-base font-bold tracking-tight"
            style={{ color }}
          >
            {value}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {sub}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}