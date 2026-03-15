# CLAUDE.md — AFCR Seguridad

Guía de referencia para el agente de IA. Leé este archivo antes de tocar cualquier archivo del proyecto.

---

## Comandos principales

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción (obligatorio antes de hacer PR)
npm run start        # Correr el build localmente
npm run lint         # Linter ESLint
```

> **Regla:** Siempre correr `npm run build` después de cambios significativos para verificar que TypeScript no tenga errores. El build es la fuente de verdad.

---

## Supabase CLI

```bash
# Autenticación
supabase login                          # Autenticarse con cuenta Supabase

# Gestión del proyecto
supabase init                           # Inicializar config local (si no existe)
supabase link --project-ref <ref-id>    # Vincular con el proyecto remoto

# Migraciones
supabase db push                        # Aplicar migraciones pendientes al proyecto remoto
supabase migration new <nombre>         # Crear una nueva migración
supabase db reset                       # Resetear DB local y re-aplicar migraciones + seed

# Tipos TypeScript (mantener src/types/index.ts actualizado a mano por ahora)
supabase gen types typescript --linked > src/types/supabase.ts

# Seed
supabase db seed                        # Aplicar supabase/seed.sql al proyecto local

# Studio local
supabase start                          # Levantar Supabase localmente (Docker requerido)
supabase stop                           # Detener instancia local
supabase status                         # Ver URLs de servicios locales
```

> El schema vive en `supabase/migrations/001_initial_schema.sql`. Las migraciones se nombran con prefijo numérico: `002_add_reviews.sql`, etc.

---

## Stack y versiones clave

| Tecnología | Versión | Notas |
|---|---|---|
| Next.js | 16.1.6 | App Router, **NO** Pages Router |
| React | 19.2.3 | Server Components por defecto |
| TypeScript | 5.x | strict mode activado |
| Tailwind CSS | 4.x | Configuración vía CSS, **no** `tailwind.config.ts` |
| Supabase JS | 2.x | `@supabase/supabase-js` + `@supabase/ssr` |
| Zustand | 5.x | Solo para carrito (estado del cliente) |
| React Query | 5.x | Disponible pero sin uso actual activo |
| Lucide React | 0.577 | Única librería de íconos |

---

## Arquitectura del proyecto

```
src/
├── app/                  # Next.js App Router (páginas y API routes)
│   ├── admin/            # Panel admin (layout sin auth guard en modo mockup)
│   ├── api/              # Route Handlers REST
│   ├── cuenta/           # Área privada del usuario
│   └── ...
├── components/
│   ├── layout/           # Header.tsx, Footer.tsx
│   ├── ui/               # Primitivos: Button, Input, Badge, Modal, Skeleton, Spinner
│   ├── products/         # ProductCard, ProductGrid, ProductGallery, ProductSpecs
│   ├── cart/             # CartDrawer, CartItem
│   ├── filters/          # FilterSidebar
│   ├── admin/            # AdminTable, ProductForm
│   └── checkout/         # CheckoutStepper
├── lib/
│   ├── supabase/         # client.ts · server.ts · middleware.ts
│   ├── mock-data.ts      # Datos demo (mockProducts, mockUser, mockOrders, etc.)
│   └── utils.ts          # cn(), formatPrice(), generateSlug(), getOrderStatus*()
├── store/
│   └── cart.ts           # Zustand store con persist en localStorage (clave: "afcr-cart")
├── types/
│   └── index.ts          # Todas las interfaces TypeScript del dominio
└── proxy.ts              # Middleware de Next.js 16 (reemplaza middleware.ts)
```

---

## Guías de estilo de código

### TypeScript
- `strict: true` — nunca usar `any`. Usar `unknown` si el tipo es incierto.
- Los tipos del dominio están en `src/types/index.ts`. Importar siempre desde ahí con `import type { Product } from "@/types"`.
- Usar `interface` para entidades de DB. Usar `type` para unions y alias.
- Las funciones async de Server Components siempre tipan el retorno explícitamente.
- Nunca usar `!` (non-null assertion) excepto en las env vars de Supabase (patrón establecido).

### Componentes
- **Server Components por defecto.** Solo agregar `"use client"` cuando se use: hooks de React, event handlers, `usePathname/useRouter`, Zustand, o APIs del browser.
- Nombrar archivos de componentes en **PascalCase**: `ProductCard.tsx`.
- Los archivos de rutas y utilitarios van en **camelCase**: `utils.ts`, `mock-data.ts`.
- Props de componentes como `interface` inline si son simples, o al tope del archivo si son complejas.

### Tailwind CSS v4
- La configuración de colores vive en `src/app/globals.css` bajo `@theme inline`, **no** en un archivo `tailwind.config.ts` (Tailwind v4 no lo usa).
- Paleta del proyecto:
  - `#0F172A` — fondo principal (`bg-[#0F172A]`)
  - `#1E293B` — cards, header, footer, drawers
  - `#2563EB` — CTAs, links, botones primarios, bordes activos
  - `#F97316` — badge de carrito, ofertas, highlights
- Usar `cn()` de `@/lib/utils` para condicionales de clases (combina `clsx` + `tailwind-merge`).
- No mezclar clases de Tailwind con estilos inline.

### Importaciones
- Siempre usar el alias `@/` (configurado en `tsconfig.json` como `src/*`).
- Orden: imports externos → imports internos con `@/` → tipos con `import type`.
- No usar importaciones con rutas relativas (`../`).

### Convenciones de naming
- **Componentes:** PascalCase → `ProductCard`, `CartDrawer`
- **Hooks personalizados:** `use` prefix → `useCartStore`
- **Funciones utilitarias:** camelCase → `formatPrice`, `generateSlug`
- **Constantes de datos mock:** camelCase con prefijo `mock` → `mockProducts`, `mockUser`
- **API Routes:** los archivos se llaman `route.ts`, siempre
- **Slugs de URL:** kebab-case, generados con `generateSlug()` de `@/lib/utils`

---

## Integración con Supabase

### Clientes — cuándo usar cada uno

| Archivo | Cuándo usarlo |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (`"use client"`), event handlers |
| `src/lib/supabase/server.ts` | Server Components, Route Handlers (`route.ts`) |
| `src/lib/supabase/middleware.ts` | Solo desde `src/proxy.ts` |

```typescript
// Client Component
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Server Component / Route Handler
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### Seguridad con Supabase

**Variables de entorno:**
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` → expuestas al cliente, está bien.
- `SUPABASE_SERVICE_ROLE_KEY` → **NUNCA** usar en Client Components ni exponer al browser. Solo en Route Handlers del lado del servidor si es estrictamente necesario.
- Nunca hardcodear credenciales en el código fuente.
- El archivo `.env.local` está en `.gitignore` (nunca commitear).

**Row Level Security (RLS):**
- **Todas las tablas tienen RLS habilitado.** Nunca desactivarlo.
- Las políticas están en `supabase/migrations/001_initial_schema.sql`. Cualquier nueva tabla debe incluir su política RLS en la misma migración.
- Regla de oro: la anon key solo puede hacer lo que las políticas RLS permiten explícitamente.

**Autenticación:**
- Usar siempre `supabase.auth.getUser()` para verificar sesión — nunca confiar en `getSession()` solo en el servidor (puede ser stale).
- En Route Handlers que mutan datos, verificar usuario Y rol antes de operar:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Para rutas admin: verificar profile.role === "admin"
  ```

**Proxy (middleware):**
- El archivo es `src/proxy.ts` con export `proxy` (Next.js 16 renombró `middleware.ts` → `proxy.ts`).
- **Modo actual: mockup** — el proxy solo refresca la sesión, no hace redirects. Cuando se active producción, restaurar los guards de `/cuenta/*` y `/admin/*`.

**Storage (imágenes):**
- Bucket: `product-images` (público para lectura, escritura solo admin vía RLS).
- Las URLs de imágenes de Supabase Storage tienen el formato: `https://<project>.supabase.co/storage/v1/object/public/product-images/<path>`.
- El dominio está whitelisteado en `next.config.ts` para `next/image`.

---

## Modo mockup vs producción

**Estado actual: modo mockup.** Toda la app funciona sin Supabase usando datos de `src/lib/mock-data.ts`.

Para **activar producción**:
1. Completar `.env.local` con credenciales reales de Supabase.
2. Ejecutar el schema SQL en Supabase: `supabase/migrations/001_initial_schema.sql`.
3. Ejecutar el seed: `supabase/seed.sql`.
4. Restaurar los auth guards en `src/proxy.ts`:
   ```typescript
   // Descomentar / restaurar:
   if (pathname.startsWith("/cuenta") && !user) redirect("/login");
   if (pathname.startsWith("/admin")) { /* verificar role admin */ }
   ```
5. Restaurar `src/app/admin/layout.tsx` con verificación de rol.
6. Reemplazar las páginas de `/cuenta/*` para leer de Supabase en lugar de `mockUser`/`mockOrders`.

---

## Patrones a seguir

### Nuevo Server Component con datos
```typescript
// app/ejemplo/page.tsx
import { mockData } from "@/lib/mock-data";
import type { Product } from "@/types";

async function getData(): Promise<Product[]> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*");
    if (data && data.length > 0) return data as Product[];
  } catch {
    // Supabase no disponible, usar mock
  }
  return mockData;
}

export default async function Page() {
  const items = await getData();
  return <div>...</div>;
}
```

### Nuevo Client Component con carrito
```typescript
"use client";
import { useCartStore } from "@/store/cart";

export default function MiComponente() {
  const { addItem, totalItems } = useCartStore();
  // ...
}
```

### Nueva API Route con auth
```typescript
// app/api/ejemplo/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  // operar con supabase...
  return NextResponse.json({ success: true }, { status: 201 });
}
```

---

## Archivos que NO tocar sin motivo claro

| Archivo | Razón |
|---|---|
| `src/types/index.ts` | Contratos de todos los tipos — cambiar impacta toda la app |
| `supabase/migrations/001_initial_schema.sql` | Schema de producción — nunca editar, crear nueva migración |
| `src/lib/supabase/server.ts` | Patrón oficial SSR de Supabase — no modificar la lógica de cookies |
| `src/app/globals.css` | Define los colores del design system — cambios afectan toda la UI |
| `.env.local` | Credenciales sensibles — nunca commitear |
