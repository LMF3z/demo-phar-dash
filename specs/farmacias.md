# Módulo Farmacias — Especificación

## Descripción
CRUD de farmacias. Permite ver el listado de sucursales registradas y registrar nuevas farmacias. Muestra datos de contacto y estado de cada sucursal.

## Data Utilizada
- `farmacias`: catálogo de farmacias con datos de contacto

## Layout de la Página

```
┌──────────────────────────────────────────────┐
│ Título "⚕️ Farmacias" + Botón "+ Registrar" │
├──────────────────────────────────────────────┤
│ Grid de cards (responsive 1/2/3 columnas)    │
│                                              │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐ │
│ │ ⚕️ Activa │  │ ⚕️ Activa │  │ ⚕️ Activa │ │
│ │           │  │           │  │           │ │
│ │ Farmacia 1│  │ Farmacia 2│  │ Farmacia 3│ │
│ │ Maracaibo │  │ Maracaibo │  │ San Fran. │ │
│ │ NIT: ...  │  │ NIT: ...  │  │ NIT: ...  │ │
│ │ 📞 tel    │  │ 📞 tel    │  │ 📞 tel    │ │
│ │ 👤 vended │  │ 👤 vended │  │ 👤 vended │ │
│ └───────────┘  └───────────┘  └───────────┘ │
└──────────────────────────────────────────────┘
```

## Componentes

### Card de Farmacia
Cada farmacia se muestra como una Card con:
- **Header**: Icono ⚕️ + Badge Activa/Inactiva
- **Nombre**: texto bold con color `STORE_COLORS[f.nombre]`
- **Ubicación**: "Ciudad · Barrio"
- **Info contacto** (iconos + texto):
  - 🪪 NIT
  - 📞 Teléfono
  - 👤 Vendedor asignado
- **Borde superior**: color de la farmacia (border-t-4)

### Dialog — Registrar Farmacia

Formulario modal con campos:
| Campo              | Tipo  | Requerido | Placeholder     |
| ------------------ | ----- | --------- | --------------- |
| Nombre             | text  | ✅        | Farmacia N      |
| Ciudad             | text  | ✅        | Bogotá          |
| Barrio/Localidad   | text  | ❌        | Suba            |
| NIT                | text  | ✅        | 900111222-1     |
| Teléfono           | text  | ❌        | 601-555-0000    |
| Vendedor asignado  | text  | ❌        | Nombre          |

Validación:
- `nombre`, `ciudad`, `nit` no pueden estar vacíos
- Errores se muestran inline debajo del input con `className="text-destructive"`
- Input con error tiene `className="border-destructive"`

Acciones:
- **Guardar**: POST a `http://localhost:3001/farmacias`, luego `refetch()` y cierra modal
- **Cancelar**: limpia formulario y cierra modal

### Colores por Farmacia
```typescript
STORE_COLORS = {
  "Farmacia 1": "#1447e6",
  "Farmacia 2": "#27AE60",
  "Farmacia 3": "#F5A623",
}
```
Usado para:
- Borde superior de card
- Color del nombre
- Background del icono (con opacidad 20%)

## Flujo de Registro

1. Usuario hace clic en "+ Registrar farmacia"
2. Se abre Dialog con formulario vacío
3. Usuario llena campos. Los requeridos tienen asterisco (*)
4. Al hacer clic en "Guardar":
   - Si hay errores de validación → se muestran en rojo, no se envía
   - Si OK → POST a json-server, se llama `refetch()`, se cierra modal
5. Si la API no responde → error en consola (no se muestra toast)

## Integración con json-server

- Endpoint: `POST http://localhost:3001/farmacias`
- Body: `{ nombre, ciudad, barrio, nit, tel, vendedor, activa: true }`
- json-server auto-asigna ID
- `refetch()` actualiza la lista desde App.tsx

## Estados
- **Loading**: No aplica (lista viene precargada en data)
- **Empty**: "No hay farmacias registradas" (grid vacío)
- **Error registro**: Solo console.error (mejora futura: agregar toast)
- **Form validation**: Errores inline por campo

## Notas
- Es el único módulo con capacidad de escritura actualmente
- No hay edición ni eliminación de farmacias (solo creación)
- La lista se actualiza via `refetch` que hace un GET completo desde App.tsx
- Los datos mock iniciales vienen de db.json
