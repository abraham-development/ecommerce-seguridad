# AGENTS.md - AFCR Seguridad

Guia operativa para agentes de IA en este repositorio. Leer antes de tocar archivos.

---

## Comandos principales

```bash
npm install          # Instalar/sincronizar dependencias
npm run dev          # Servidor de desarrollo (http://localhost:3000; Next puede usar 3001 si 3000 esta ocupado)
npm run build        # Build de produccion; fuente de verdad para TypeScript
npm run start        # Correr el build localmente
npm run lint         # ESLint
```

> Regla: correr `npm run build` despues de cambios significativos de codigo. Para cambios solo de documentacion no hace falta.

---

## Mapa raiz del proyecto

```text
.
├── AGENTS.md                 # Esta guia para agentes
├── DIAGRAMA_APP.md           # Diagrama Mermaid simplificado de arquitectura
├── README.md                 # Documentacion general; puede tener referencias antiguas
├── eslint.config.mjs         # ESLint flat config + Next core-web-vitals/typescript
├── next.config.ts            # Config Next; remote images Supabase Storage + Unsplash
├── package.json              # Scripts y dependencias
├── package-lock.json         # Lock npm
├── postcss.config.mjs        # Tailwind CSS v4 via @tailwindcss/postcss
├── public/                   # SVGs estaticos de plantilla
├── screenshot.png            # Imagen local de referencia
├── skills-lock.json          # Lock de skills/agentes
├── src/                      # Aplicacion Next.js
├── supabase/                 # Migraciones SQL y seed
└── tsconfig.json             # TypeScript strict + alias @/*
```

### Carpetas generadas/locales

- `.next/` y `node_modules/` son generadas y estan ignoradas.
- `.chrome-debug-profile/` es local de debugging; no tocar salvo pedido explicito.
- `supabase/.temp/` contiene estado local de Supabase CLI; no editar ni commitear.
- `.env*`, `.mcp.json`, `next-env.d.ts`, coverage/build/out y logs estan ignorados por `.gitignore`.

---

## Repositorio y Git

- Repositorio canonico: `https://github.com/abraham-development/ecommerce-seguridad`.
- El remoto `origin` debe usar `https://github.com/abraham-development/ecommerce-seguridad.git` para fetch y push.
- Rama principal: `main`.
- `package.json` conserva por ahora el nombre interno legado `projectclaude1`; no usar ese campo para inferir el nombre del repositorio ni cambiarlo sin pedido explicito.
- Antes de editar, revisar `git status --short` y preservar cambios ajenos o archivos no trackeados.

---

## Stack actual

| Tecnologia | Version | Notas |
|---|---:|---|
| Next.js | 16.2.6 | App Router; usa `src/proxy.ts` en lugar de `middleware.ts` |
| React | 19.2.3 | Server Components por defecto |
| TypeScript | 5.x | `strict: true`, `noEmit: true`, alias `@/*` |
| Tailwind CSS | 4.x | Configuracion via CSS/PostCSS, no `tailwind.config.ts` |
| Supabase JS | 2.99.x | `@supabase/supabase-js` + `@supabase/ssr` |
| Zustand | 5.x | Estado del carrito local |
| react-hot-toast | 2.6.x | Toaster global en `src/components/Providers.tsx` |
| lucide-react | 0.577.x | Libreria de iconos |

---

## Arquitectura en `src/`

```text
src/
├── app/
│   ├── layout.tsx              # Root layout: Providers, Header, Footer
│   ├── page.tsx                # Home
│   ├── loading.tsx             # Loading global
│   ├── error.tsx               # Error boundary cliente
│   ├── globals.css             # Tailwind v4 + theme del sitio
│   ├── acerca-de-nosotros/     # Pagina institucional
│   ├── productos/              # Catalogo y detalle por slug
│   ├── categorias/[slug]/      # Listado por categoria
│   ├── marcas/[slug]/          # Listado por marca
│   ├── carrito/                # Carrito local
│   ├── checkout/               # Auth gate cliente + stepper de pedido
│   ├── login/                  # Login email/password + Google OAuth
│   ├── registro/               # Registro email/password + Google OAuth
│   ├── cuenta/                 # Area privada de usuario
│   ├── admin/                  # Panel admin protegido por layout
│   └── api/                    # Route Handlers REST
├── components/
│   ├── account/                # ProfileForm
│   ├── admin/                  # AdminTable, AdminProductosTable, ProductForm
│   ├── cart/                   # CartDrawer, CartItem
│   ├── checkout/               # CheckoutStepper, CheckoutAuthGate, LoginForm, RegisterForm
│   ├── filters/                # FilterSidebar, ProductSort
│   ├── layout/                 # Header, Footer
│   ├── products/               # ProductCard, ProductGrid, Gallery, Specs, AddToCart
│   ├── ui/                     # Button, Input, Badge, Modal, Skeleton, Spinner
│   └── Providers.tsx           # Toaster provider
├── lib/
│   ├── auth-routing.ts         # Redirects seguros, rutas dashboard y rol admin
│   ├── data-utils.ts           # Utilidades de fallback
│   ├── mock-data.ts            # Datos demo
│   ├── supabase/               # client/server/middleware/env/data
│   └── utils.ts                # cn, formatPrice, generateSlug, estados
├── store/
│   └── cart.ts                 # Zustand persist en localStorage, key `afcr-cart`
├── types/
│   └── index.ts                # Contratos de dominio
└── proxy.ts                    # Proxy Next 16; refresca sesion Supabase
```

---

## Rutas App Router

### Publicas

| Ruta | Archivo | Responsabilidad |
|---|---|---|
| `/` | `src/app/page.tsx` | Home con destacados y categorias |
| `/productos` | `src/app/productos/page.tsx` | Catalogo, filtros, orden y paginacion |
| `/productos/[slug]` | `src/app/productos/[slug]/page.tsx` | Detalle, galeria, specs y relacionados |
| `/categorias/[slug]` | `src/app/categorias/[slug]/page.tsx` | Productos por categoria |
| `/marcas/[slug]` | `src/app/marcas/[slug]/page.tsx` | Productos por marca |
| `/carrito` | `src/app/carrito/page.tsx` | Carrito local Zustand |
| `/acerca-de-nosotros` | `src/app/acerca-de-nosotros/page.tsx` | Pagina institucional |
| `/login` | `src/app/login/page.tsx` | Login y Google OAuth |
| `/registro` | `src/app/registro/page.tsx` | Registro y Google OAuth |

### Checkout y cuenta

| Ruta | Archivo | Responsabilidad |
|---|---|---|
| `/checkout` | `src/app/checkout/page.tsx` | Verifica usuario en cliente; muestra AuthGate o Stepper |
| `/cuenta` | `src/app/cuenta/page.tsx` | Resumen de cuenta y pedidos recientes |
| `/cuenta/perfil` | `src/app/cuenta/perfil/page.tsx` | Edicion de perfil |
| `/cuenta/pedidos` | `src/app/cuenta/pedidos/page.tsx` | Historial de pedidos |
| `/cuenta/pedidos/[id]` | `src/app/cuenta/pedidos/[id]/page.tsx` | Detalle de pedido propio |

### Admin

| Ruta | Archivo | Responsabilidad |
|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | Dashboard admin |
| `/admin/productos` | `src/app/admin/productos/page.tsx` | Tabla de productos admin |
| `/admin/productos/nuevo` | `src/app/admin/productos/nuevo/page.tsx` | Crear producto |
| `/admin/productos/[id]/editar` | `src/app/admin/productos/[id]/editar/page.tsx` | Editar producto |
| `/admin/pedidos` | `src/app/admin/pedidos/page.tsx` | Pedidos admin |
| `/admin/usuarios` | `src/app/admin/usuarios/page.tsx` | Usuarios/perfiles admin |

`src/app/admin/layout.tsx` protege todo `/admin` con `getCurrentAccount()` y `isAdminAccount()`.

---

## API Routes actuales

| Ruta | Metodos | Archivo | Responsabilidad |
|---|---|---|---|
| `/api/auth/callback` | `GET` | `src/app/api/auth/callback/route.ts` | Intercambia OAuth code por sesion y redirige segun rol |
| `/api/auth/role-redirect` | `GET` | `src/app/api/auth/role-redirect/route.ts` | Redireccion post-login con sesion y rol |
| `/api/auth/signout` | `GET`, `POST` | `src/app/api/auth/signout/route.ts` | Cierra sesion y vuelve a `/` |
| `/api/products/search` | `GET` | `src/app/api/products/search/route.ts` | Busqueda corta con Supabase y fallback mock |
| `/api/cart` | `GET`, `POST` | `src/app/api/cart/route.ts` | Carrito persistido en `cart_items` para usuario autenticado |
| `/api/cart/[id]` | `PATCH`, `DELETE` | `src/app/api/cart/[id]/route.ts` | Actualiza/elimina item propio |
| `/api/orders` | `POST` | `src/app/api/orders/route.ts` | Crea orden, order_items y limpia `cart_items` remoto |
| `/api/orders/[id]` | `GET` | `src/app/api/orders/[id]/route.ts` | Lee orden propia |
| `/api/admin/products` | `POST` | `src/app/api/admin/products/route.ts` | Crea producto; requiere admin |
| `/api/admin/products/[id]` | `PUT`, `DELETE` | `src/app/api/admin/products/[id]/route.ts` | Edita/elimina producto; requiere admin |

En rutas dinamicas se usa el patron Next 16:

```ts
interface RouteParams {
  params: Promise<{ id: string }>;
}

const { id } = await params;
```

---

## Flujo de datos

- La capa central de lectura es `src/lib/supabase/data.ts`.
- Catalogo, categorias, marcas, detalle y relacionados intentan leer Supabase y caen a `src/lib/mock-data.ts`.
- Cuenta y admin verifican sesion real con `supabase.auth.getUser()`.
- Algunas lecturas privadas de pedidos tienen fallback mock si falla la query.
- El carrito visible usa Zustand/localStorage en `src/store/cart.ts`, key `afcr-cart`.
- Las APIs `/api/cart` existen para `cart_items`, pero no son la fuente principal de la UI actual.
- Checkout valida usuario desde cliente; si no hay usuario muestra `CheckoutAuthGate`.
- Al confirmar checkout, `CheckoutStepper` postea a `/api/orders`, crea `orders` y `order_items`, limpia el carrito local y la API limpia `cart_items`.
- `ProductForm` sube imagenes directo a Supabase Storage con el cliente browser y guarda el producto por API admin.

---

## Supabase

### Clientes

| Archivo | Uso |
|---|---|
| `src/lib/supabase/client.ts` | Client Components y event handlers (`createBrowserClient`) |
| `src/lib/supabase/server.ts` | Server Components y Route Handlers (`createServerClient` con cookies) |
| `src/lib/supabase/middleware.ts` | Solo desde `src/proxy.ts` para refrescar sesion |
| `src/lib/supabase/env.ts` | Lee URL/key publica |
| `src/lib/supabase/data.ts` | Lecturas con fallback mock |

### Variables de entorno

- `NEXT_PUBLIC_SUPABASE_URL`: obligatoria para usar Supabase.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: key publica preferida.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: fallback compatible.
- `SUPABASE_SERVICE_ROLE_KEY`: no usar en Client Components ni exponer al browser.
- `.env*` esta ignorado; no commitear credenciales.

### Schema, migraciones y seed

```text
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_fix_admin_rls_recursion.sql
│   ├── 003_harden_rls_security_and_indexes.sql
│   ├── 004_app_roles_admin_user.sql
│   ├── 005_profiles_email_and_role_redirects.sql
│   ├── 006_split_profile_rls_policies.sql
│   └── 007_handle_admin_signup.sql
└── seed.sql
```

Tablas principales:

- `profiles`
- `categories`
- `brands`
- `products`
- `cart_items`
- `orders`
- `order_items`

Storage:

- Bucket `product-images`.
- Lectura publica.
- Escritura/eliminacion protegida por politicas para admin.
- `next.config.ts` permite imagenes de `*.supabase.co/storage/v1/object/public/**`.

Reglas:

- No reescribir `001_initial_schema.sql` ni migraciones ya aplicadas salvo pedido explicito.
- Para cambios de schema/RLS, crear una migracion nueva.
- Todas las tablas publicas tienen RLS; no desactivarlo.
- No introducir `security definer` en schemas expuestos.
- Verificar auth server con `supabase.auth.getUser()`, no confiar solo en `getSession()`.

### Supabase CLI

```bash
supabase --help
supabase login
supabase init
supabase link --project-ref <ref-id>
supabase migration new <nombre>
supabase db push
supabase db reset
supabase db seed
supabase gen types typescript --linked > src/types/supabase.ts
supabase start
supabase stop
supabase status
```

> Revisar `supabase --help` antes de usar comandos: la CLI cambia con frecuencia.

---

## Auth y autorizacion

- `src/proxy.ts` solo refresca sesion; no hace redirects.
- Guards reales:
  - `src/app/admin/layout.tsx`
  - paginas de `/cuenta/*`
  - API routes protegidas
  - `/api/auth/callback`
  - `/api/auth/role-redirect`
- `src/lib/auth-routing.ts` centraliza:
  - `ADMIN_DASHBOARD_PATH = "/admin"`
  - `USER_DASHBOARD_PATH = "/cuenta"`
  - `getSafeRedirectPath()`
  - `getLocalSafeOrigin()`
  - `getPostLoginRedirect()`
  - `isAdminAccount()`
- Admin actual: `profile.role === "admin"` o email en `ADMIN_EMAILS` (`time45120@gmail.com`).
- Si cambia la logica admin, revisar `auth-routing.ts`, rutas admin y politicas RLS/migraciones.

---

## Tipos de dominio

Los contratos viven en `src/types/index.ts`:

- `UserRole`
- `OrderStatus`
- `Address`
- `Profile`
- `Category`
- `Brand`
- `ProductSpecs`
- `Product`
- `CartItem`
- `Order`
- `OrderItem`
- `CartItemLocal`
- `PaginatedResponse<T>`
- `ProductFilters`

Importar tipos siempre desde `@/types`:

```ts
import type { Product } from "@/types";
```

---

## Convenciones de codigo

### TypeScript

- `strict: true`; evitar `any`.
- Usar `unknown` si el tipo realmente es incierto.
- Preferir `interface` para entidades de DB y props complejas.
- Usar `type` para unions y alias.
- Server Components async deben tipar retorno explicitamente cuando se agreguen patrones nuevos.
- No usar `!` salvo patron establecido de env vars Supabase.

### Componentes

- Server Components por defecto.
- Agregar `"use client"` solo si se usan hooks, event handlers, `useRouter`, `usePathname`, Zustand o APIs browser.
- Componentes en PascalCase: `ProductCard.tsx`.
- Rutas/utilitarios en camelCase o convencion Next: `route.ts`, `page.tsx`, `utils.ts`.

### Imports

- Usar alias `@/`; evitar imports relativos `../`.
- Orden recomendado: externos, internos `@/`, tipos con `import type`.

### Tailwind CSS v4

- Configuracion de theme en `src/app/globals.css`, no crear `tailwind.config.ts`.
- Paleta actual:
  - `#0F172A`: fondo principal.
  - `#1E293B`: cards/header/footer/drawers.
  - `#2563EB`: CTAs, links, bordes activos.
  - `#F97316`: badges/ofertas/highlights.
- Usar `cn()` de `@/lib/utils` para clases condicionales.
- Evitar estilos inline nuevos si puede resolverse con Tailwind.

### Naming

- Componentes: PascalCase.
- Hooks: prefijo `use`.
- Funciones utilitarias: camelCase.
- Datos mock: prefijo `mock`.
- API routes: archivo `route.ts`.
- Slugs: kebab-case con `generateSlug()`.
- Auth/admin routing: centralizar en `src/lib/auth-routing.ts`.

---

## Patrones utiles

### Server Component con datos y fallback

```ts
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
    // Supabase no disponible: fallback mock.
  }

  return mockProducts;
}

export default async function Page(): Promise<ReactElement> {
  const items = await getData();
  return <div>{items.length}</div>;
}
```

### Client Component con carrito

```ts
"use client";

import { useCartStore } from "@/store/cart";

export default function MiComponente() {
  const { addItem, totalItems } = useCartStore();
  return <button>{totalItems()}</button>;
}
```

### API Route con usuario autenticado

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  return NextResponse.json({ success: true, body }, { status: 201 });
}
```

### API Route admin

```ts
import { NextResponse } from "next/server";
import { isAdminAccount } from "@/lib/auth-routing";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

---

## Archivos sensibles o de alto impacto

| Archivo | Motivo |
|---|---|
| `.env*` | Credenciales; no commitear |
| `src/types/index.ts` | Contratos compartidos por toda la app |
| `src/lib/auth-routing.ts` | Decide admins y redirects |
| `src/lib/supabase/server.ts` | Cookies SSR Supabase |
| `src/lib/supabase/middleware.ts` | Refresco global de sesion |
| `src/proxy.ts` | Proxy Next 16 |
| `src/app/globals.css` | Theme global Tailwind |
| `supabase/migrations/001_initial_schema.sql` | Schema base |
| `supabase/migrations/*.sql` aplicadas | No reescribir historia |
| `package-lock.json` | Mantener sincronizado con `package.json` |

---

## Notas actuales del mapeo

- `DIAGRAMA_APP.md` esta versionado y contiene un diagrama Mermaid simplificado.
- `README.md` puede contener referencias antiguas frente al estado actual del proyecto.
- `@supabase/ssr` esta declarado e instalado; si aparece `Module not found: Can't resolve '@supabase/ssr'`, correr `npm install`.
- Next puede reportar puerto 3000 ocupado si ya hay otro `next dev` corriendo.
- `src/proxy.ts` reemplaza el middleware clasico de Next; no crear `middleware.ts` salvo cambio deliberado.
- El modo actual es hibrido: Supabase real + fallback mock para catalogo y algunas lecturas.
