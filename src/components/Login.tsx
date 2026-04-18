import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import alkostoFamily from "../assets/alkostofamily.jpeg"

type Props = {
  onLogin: () => void
}

export function Login({ onLogin }: Props) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      if (username === "demo" && password === "demo") {
        onLogin()
      } else {
        setError(true)
        setLoading(false)
      }
    }, 800)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin()
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary via-primary to-accent p-4">
      <Card className="w-full max-w-[380px] border-border/50 shadow-2xl">
        <CardHeader className="space-y-1 pb-2 text-center">
          <div className="mb-4 flex justify-center">
            <img
              src={alkostoFamily}
              alt="Alkosto Family"
              className="h-16 rounded-xl object-cover shadow-lg"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Phar Dash
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Panel de gestión farmacéutica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Usuario
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="demo"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError(false)
              }}
              onKeyDown={handleKeyDown}
              className={`h-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(false)
              }}
              onKeyDown={handleKeyDown}
              className={`h-10 ${error ? "border-destructive focus-visible:ring-destructive" : ""}`}
            />
          </div>

          {error && (
            <p className="text-center text-sm text-destructive">
              ⚠ Credenciales incorrectas
            </p>
          )}

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="h-10 w-full text-base font-medium transition-all"
          >
            {loading ? "Verificando..." : "Ingresar"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Demo: usuario <span className="font-semibold">demo</span> /
            contraseña <span className="font-semibold">demo</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
