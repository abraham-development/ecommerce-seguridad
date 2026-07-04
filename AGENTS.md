# AGENTS.md - AFCR Seguridad

Guía de referencia para el agente de IA. Leé este archivo antes de tocar cualquier archivo del proyecto.

---

## Comandos principales

```bash
npm install          # Instalar dependencias
npm run dev          # Servidor de desarrollo (http://localhost:3000)
npm run build        # Build de producción (obligatorio después de cambios significativos)
npm run start        # Correr el build localmente
npm run lint         # Linter ESLint
```

> **Regla:** Siempre correr `npm run build` después de cambios significativos de código para verificar que TypeScript no tenga errores. El build es la fuente de verdad. Para cambios solo de documentación no hace falta.

---

## Supabase CLI

```bash
# Descubrimiento
supabase --help                         # Revisar comandos disponibles antes de usarlos

# Autenticación
supabase login                          # Autenticarse con cuenta Supabase

# Gestión del proyecto
supabase init                           # Inicializar config local (si no existe)
supabase link --project-ref <ref-id>    # Vincular con el proyecto remoto

# Migraciones
supabase db push                        # Aplicar migraciones pendientes al proyecto remoto
supabase migration new <nombre>         # Crear una nueva migración
supabase db reset                       # Resetear DB local y re-aplicar migraciones + seed

# Tipos TypeScript (src/types/index.ts se mantiene a mano por ahora)
supabase gen types typescript --linked > src/types/supabase.ts

# Seed
supabase db seed                        # Aplicar supabase/seed.sql al proyecto local

# Studio local
supabase start                          # Levantar Supabase localmente (Docker requerido)
supabase stop                           # Detener instancia local
supabase status                         # Ver URLs de servicios locales
```

> El schema base vive en `supabase/migrations/001_initial_schema.sql`. Ya existen migraciones incrementales `002` a `007`; no reescribir migraciones aplicadas salvo pedido explícito. Para cambios de schema/RLS, crear una nueva migración.

---

## Azure e infraestructura

La infraestructura Azure de desarrollo vive en `infra/` y debe mantenerse alineada con:

- `infra/README.md` — guardrails operativos.
- `infra/azure-architecture.md` — informe completo de arquitectura y flujos.
- `infra/main.bicep` — infraestructura declarativa.
- `infra/dev.bicepparam` — parametros del entorno dev.

### Alcance fijo

Codex solo puede operar Azure dentro de este alcance:

```text
Subscription: 3274731e-9035-49fa-9d05-11c978277669
Tenant: 3d72d4fc-032a-439f-9051-a3bfcc6d8706
Resource Group: ecommerce
Location: westus2
Service Principal: sp-codex-ecommerce-dev
```

Acceso verificado: Codex visualiza el Resource Group `ecommerce` en `westus2` con estado `Succeeded` mediante la sesion Azure CLI dedicada.

Reglas obligatorias:

- Usar la identidad dedicada `sp-codex-ecommerce-dev`, no el login personal del usuario, para operaciones de Codex.
- Todo despliegue debe ser a nivel de Resource Group con `az deployment group`.
- Toda operacion de despliegue debe apuntar explicitamente a `--resource-group ecommerce`.
- No ejecutar despliegues a nivel de suscripcion, management group o tenant.
- No crear ni modificar recursos fuera del Resource Group `ecommerce`.
- No ejecutar cambios RBAC, no asignar roles, no usar `Owner`, `User Access Administrator` ni permisos equivalentes.
- No registrar providers con la identidad de Codex; si falta un provider, pedir que lo registre el usuario Owner.
- No commitear credenciales, secretos, archivos `.env`, ni contenido de `~/.azure-codex-ecommerce/`.

### Sesion Azure CLI para Codex

Usar siempre un directorio de configuracion Azure CLI separado:

```bash
source "$HOME/.azure-codex-ecommerce/env"
export AZURE_CONFIG_DIR="$HOME/.azure-codex-ecommerce/cli"

az login --service-principal \
  --username "$AZURE_CLIENT_ID" \
  --password "$AZURE_CLIENT_SECRET" \
  --tenant "$AZURE_TENANT_ID" \
  --allow-no-subscriptions

az account set --subscription "$AZURE_SUBSCRIPTION_ID"
```

### Comandos seguros

Antes de desplegar, revisar siempre el plan:

```bash
az deployment group what-if \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --resource-group ecommerce \
  --template-file infra/main.bicep \
  --parameters infra/dev.bicepparam
```

Desplegar solo despues de revisar el `what-if`:

```bash
az deployment group create \
  --subscription "$AZURE_SUBSCRIPTION_ID" \
  --resource-group ecommerce \
  --template-file infra/main.bicep \
  --parameters infra/dev.bicepparam
```

Validar el alcance RBAC del service principal cuando haga falta:

```bash
az role assignment list \
  --assignee "$AZURE_CLIENT_ID" \
  --all \
  --query '[].{role:roleDefinitionName,scope:scope}' \
  -o table
```

El unico scope esperado para Codex es:

```text
/subscriptions/3274731e-9035-49fa-9d05-11c978277669/resourceGroups/ecommerce
```

### Arquitectura Azure objetivo

La arquitectura dev planificada migra gradualmente desde Supabase hacia servicios Azure-native:

- Compute: Azure App Service para Next.js SSR y Route Handlers.
- Auth clientes: Microsoft Entra External ID.
- DB: Azure Database for PostgreSQL Flexible Server.
- Imagenes: Azure Blob Storage (`product-images`).
- Secretos: Azure Key Vault.
- Observabilidad: Application Insights + Log Analytics.
- CI/CD: GitHub Actions con OIDC.

En dev se prioriza bajo costo y simplicidad. Produccion queda fuera de alcance de este Resource Group.

---

## Stack y versiones clave

| Tecnología | Versión | Notas |
|---|---|---|
| Next.js | 16.2.6 | App Router, **NO** Pages Router. `src/proxy.ts` reemplaza middleware clásico |
| React | 19.2.3 | Server Components por defecto |
| TypeScript | 5.x | strict mode activado |
| Tailwind CSS | 4.x | Configuración vía CSS, **no** `tailwind.config.ts` |
| Supabase JS | 2.99.x | `@supabase/supabase-js` + `@supabase/ssr` |
| Zustand | 5.x | Solo para carrito (estado del cliente) |
| react-hot-toast | 2.6.x | Notificaciones cliente desde `src/components/Providers.tsx` |
| Lucide React | 0.577 | Única librería de íconos |

---

## Arquitectura del proyecto

```
infra/                  # Bicep, parametros y documentacion Azure para RG ecommerce
src/
├── app/                  # Next.js App Router (páginas y API routes)
│   ├── admin/            # Panel admin protegido por src/app/admin/layout.tsx
│   ├── api/              # Route Handlers REST: auth, cart, orders, products, admin
│   ├── carrito/          # Página de carrito local
│   ├── checkout/         # Auth gate + stepper de pedido
│   ├── cuenta/           # Área privada del usuario
│   ├── login/registro/   # Email/password + Google OAuth
│   ├── productos/        # Catálogo y detalle por slug
│   ├── categorias/       # Listado por categoría
│   ├── marcas/           # Listado por marca
│   └── ...
├── components/
│   ├── account/          # ProfileForm
│   ├── layout/           # Header.tsx, Footer.tsx
│   ├── ui/               # Primitivos: Button, Input, Badge, Modal, Skeleton, Spinner
│   ├── products/         # ProductCard, ProductGrid, ProductGallery, ProductSpecs, AddToCartButton
│   ├── cart/             # CartDrawer, CartItem
│   ├── filters/          # FilterSidebar
│   ├── admin/            # AdminTable, AdminProductosTable, ProductForm
│   └── checkout/         # CheckoutStepper, CheckoutAuthGate, LoginForm, RegisterForm
├── lib/
│   ├── auth-routing.ts   # Redirects seguros, roles y destinos post-login
│   ├── data-utils.ts     # withMockFallback()
│   ├── supabase/         # client.ts · server.ts · middleware.ts · env.ts · data.ts
│   ├── mock-data.ts      # Datos demo (mockProducts, mockUser, mockOrders, etc.)
│   └── utils.ts          # cn(), formatPrice(), generateSlug(), getOrderStatus*()
├── store/
│   └── cart.ts           # Zustand store con persist en localStorage (clave: "afcr-cart")
├── types/
│   └── index.ts          # Todas las interfaces TypeScript del dominio
└── proxy.ts              # Middleware de Next.js 16 (reemplaza middleware.ts)
```

### Rutas API actuales

| Ruta | Métodos | Responsabilidad |
|---|---|---|
| `/api/auth/callback` | `GET` | Intercambia OAuth code por sesión y redirige según rol |
| `/api/auth/role-redirect` | `GET` | Redirección post-login con validación de sesión/rol |
| `/api/auth/signout` | `GET`, `POST` | Cierra sesión y vuelve a `/` |
| `/api/products/search` | `GET` | Busca productos con Supabase y fallback mock |
| `/api/cart` | `GET`, `POST` | Carrito Supabase para usuario autenticado |
| `/api/cart/[id]` | `PATCH`, `DELETE` | Actualiza/elimina item propio del carrito |
| `/api/orders` | `POST` | Crea orden, items y limpia carrito Supabase |
| `/api/orders/[id]` | `GET` | Lee orden propia con items |
| `/api/admin/products` | `POST` | Crea producto; requiere admin |
| `/api/admin/products/[id]` | `PUT`, `DELETE` | Edita/elimina producto; requiere admin |

### Flujo de datos actual

- La capa central de lectura vive en `src/lib/supabase/data.ts`.
- Productos, categorías, marcas, listados y detalle intentan leer Supabase y caen a `src/lib/mock-data.ts` si Supabase falla o no devuelve datos útiles.
- Cuenta, admin y pedidos privados requieren sesión real con `supabase.auth.getUser()`.
- El carrito visible usa Zustand/localStorage (`src/store/cart.ts`, key `afcr-cart`). Las APIs `/api/cart` existen para carrito persistido en Supabase.
- Checkout verifica sesión desde el cliente; si no hay usuario muestra `CheckoutAuthGate`. Al confirmar, postea a `/api/orders`, crea orden/items y limpia el carrito local.
- Admin se protege en `src/app/admin/layout.tsx`; `src/proxy.ts` solo refresca sesión.

---

## Guías de estilo de código

### TypeScript
- `strict: true` — nunca usar `any`. Usar `unknown` si el tipo es incierto.
- Los tipos del dominio están en `src/types/index.ts`. Importar siempre desde ahí con `import type { Product } from "@/types"`.
- Usar `interface` para entidades de DB. Usar `type` para unions y alias.
- Las funciones async de Server Components siempre tipan el retorno explícitamente.
- Nunca usar `!` (non-null assertion) excepto en las env vars de Supabase (patrón establecido).
- En rutas dinámicas de App Router/Next 16, el patrón actual usa `params: Promise<{ ... }>` y `const { id } = await params`.

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
- Hay algunos estilos inline existentes para casos puntuales; no expandir ese patrón si puede resolverse con Tailwind.

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
- **Admin/auth routing:** centralizar destinos y rol admin en `src/lib/auth-routing.ts`

---

## Integración con Supabase

### Clientes — cuándo usar cada uno

| Archivo | Cuándo usarlo |
|---|---|
| `src/lib/supabase/client.ts` | Client Components (`"use client"`), event handlers |
| `src/lib/supabase/server.ts` | Server Components, Route Handlers (`route.ts`) |
| `src/lib/supabase/middleware.ts` | Solo desde `src/proxy.ts` |
| `src/lib/supabase/env.ts` | Lectura de `NEXT_PUBLIC_SUPABASE_URL` y key pública |
| `src/lib/supabase/data.ts` | Queries de lectura con fallback mock |

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
- `NEXT_PUBLIC_SUPABASE_URL` → obligatoria para clientes Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → key pública preferida.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → fallback compatible si no existe publishable key.
- `SUPABASE_SERVICE_ROLE_KEY` → **NUNCA** usar en Client Components ni exponer al browser. Solo en Route Handlers del lado del servidor si es estrictamente necesario.
- Nunca hardcodear credenciales en el código fuente.
- El archivo `.env.local` está en `.gitignore` (nunca commitear).

**Row Level Security (RLS):**
- **Todas las tablas tienen RLS habilitado.** Nunca desactivarlo.
- Las políticas nacen en `supabase/migrations/001_initial_schema.sql` y fueron ajustadas en migraciones posteriores. Cualquier nueva tabla debe incluir su política RLS en la misma migración nueva.
- Regla de oro: la anon key solo puede hacer lo que las políticas RLS permiten explícitamente.
- Las migraciones de hardening movieron helpers admin a schema privado; no volver a introducir helpers `security definer` en schemas expuestos.

**Autenticación:**
- Usar siempre `supabase.auth.getUser()` para verificar sesión — nunca confiar en `getSession()` solo en el servidor (puede ser stale).
- Para admin, usar `isAdminAccount()` de `src/lib/auth-routing.ts`; combina `profile.role === "admin"` con un fallback de email permitido. Si cambia la lógica admin, actualizar ese helper y revisar RLS/migraciones.
- En Route Handlers que mutan datos, verificar usuario Y rol antes de operar:
  ```typescript
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // Para rutas admin: verificar profile.role === "admin"
  ```

**Proxy (middleware):**
- El archivo es `src/proxy.ts` con export `proxy` (Next.js 16 renombró `middleware.ts` → `proxy.ts`).
- El proxy solo refresca la sesión, no hace redirects.
- Los guards reales actuales están en `src/app/admin/layout.tsx`, páginas de `/cuenta/*` y routes de auth (`callback`, `role-redirect`).

**Storage (imágenes):**
- Bucket: `product-images` (público para lectura, escritura solo admin vía RLS).
- Las URLs de imágenes de Supabase Storage tienen el formato: `https://<project>.supabase.co/storage/v1/object/public/product-images/<path>`.
- El dominio está whitelisteado en `next.config.ts` para `next/image`.

---

## Modo híbrido actual

La app no está en mockup puro: combina Supabase real con fallback mock.

- Catálogo público: intenta Supabase y cae a `src/lib/mock-data.ts`.
- Autenticación: usa Supabase Auth real en login, registro, OAuth, checkout, cuenta y admin.
- Admin: `src/app/admin/layout.tsx` exige sesión y rol admin.
- Cuenta: `/cuenta/*` exige sesión real; algunas lecturas de pedidos tienen fallback mock si falla la query.
- Carrito visible: localStorage/Zustand. APIs de carrito Supabase existen, pero no son la fuente principal de la UI actual.

Para producción:
1. Completar `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Aplicar migraciones `supabase/migrations/*.sql` en orden.
3. Ejecutar `supabase/seed.sql` si se necesitan datos demo.
4. Confirmar que las URLs de auth/OAuth apuntan al dominio correcto.
5. Crear/asignar admins mediante `profiles.role = 'admin'` y revisar `src/lib/auth-routing.ts`.
6. Verificar RLS y Storage (`product-images`) antes de exponer escritura admin.

---

## Patrones a seguir

### Nuevo Server Component con datos
```typescript
// app/ejemplo/page.tsx
import { mockProducts } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types";
import type { ReactElement } from "react";

async function getData(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, brand:brands(*), category:categories(*)")
      .eq("is_active", true);

    if (error) throw error;
    if (data && data.length > 0) return data as Product[];
  } catch {
    // Supabase no disponible, usar fallback mock
  }
  return mockProducts;
}

export default async function Page(): Promise<ReactElement> {
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

### Nueva API Route admin
```typescript
// app/api/admin/ejemplo/route.ts
import { NextResponse } from "next/server";
import { isAdminAccount } from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isAdminAccount(profile?.role, user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  return NextResponse.json(body, { status: 201 });
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
| `supabase/migrations/*.sql` ya aplicadas | No reescribir historia de DB salvo pedido explícito |
| `src/lib/supabase/server.ts` | Patrón oficial SSR de Supabase — no modificar la lógica de cookies |
| `src/lib/supabase/middleware.ts` y `src/proxy.ts` | Manejo global de sesión — cambios pueden romper auth |
| `src/lib/auth-routing.ts` | Decide admins y redirects — revisar seguridad antes de cambiar |
| `src/app/globals.css` | Define los colores del design system — cambios afectan toda la UI |
| `.env.local` | Credenciales sensibles — nunca commitear |

---

## Notas actuales

- `CLAUDE.md` aparece borrado en el working tree al momento de este mapeo; no restaurarlo ni modificarlo salvo pedido explícito.
- `next.config.ts` permite imágenes de `*.supabase.co/storage/v1/object/public/**` y `images.unsplash.com`.
- `ProductForm` sube imágenes al bucket `product-images`; mantener rutas compatibles con Storage público.
- El plan Azure se mantiene con Key Vault; no reemplazar secretos cloud por `.env` para despliegues.
