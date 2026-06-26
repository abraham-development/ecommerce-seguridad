# AFCR Seguridad - E-commerce de Camaras de Seguridad

Tienda online especializada en sistemas de videovigilancia y seguridad electronica.

## Stack Tecnologico

| Tecnologia | Version | Uso |
|---|---:|---|
| Next.js | 16.2.6 | App Router, Server Components y Route Handlers |
| React | 19.2.3 | UI y componentes cliente cuando hacen falta hooks/browser APIs |
| TypeScript | 5.x | Strict mode |
| Tailwind CSS | 4.x | Estilos configurados desde CSS |
| Supabase JS/SSR | 2.99.x / 0.9.x | Auth, PostgreSQL, Storage y SSR |
| Zustand | 5.x | Carrito local persistido en `localStorage` |
| react-hot-toast | 2.6.x | Notificaciones cliente |
| Lucide React | 0.577.x | Iconos |

## Comandos

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

El servidor de desarrollo queda disponible en `http://localhost:3000`.

## Variables de Entorno

Crea `.env.local` en la raiz del proyecto con las credenciales publicas de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="<publishable-key>"
# Alternativa compatible si no usas publishable key:
# NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon-key>"
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` es obligatoria.
- Se prefiere `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; `NEXT_PUBLIC_SUPABASE_ANON_KEY` funciona como fallback.
- `SUPABASE_SERVICE_ROLE_KEY` no se usa en clientes publicos y no debe exponerse al browser.
- `.env.local` esta ignorado por Git.

## Supabase

El schema base vive en `supabase/migrations/001_initial_schema.sql` y existen migraciones incrementales hasta `007_handle_admin_signup.sql`.

Para preparar un proyecto remoto o local:

```bash
supabase --help
supabase link --project-ref <ref-id>
supabase db push
supabase db seed
```

Si trabajas con Supabase local:

```bash
supabase start
supabase db reset
supabase status
```

El seed de datos demo esta en `supabase/seed.sql`.

## Estructura del Proyecto

```text
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Panel administrativo protegido
│   ├── api/                # Route Handlers REST
│   ├── carrito/            # Carrito local
│   ├── categorias/[slug]/  # Listado por categoria
│   ├── checkout/           # Auth gate y stepper de pedido
│   ├── cuenta/             # Area privada del usuario
│   ├── login/              # Inicio de sesion
│   ├── marcas/[slug]/      # Listado por marca
│   ├── productos/          # Catalogo y detalle
│   └── registro/           # Registro de usuarios
├── components/
│   ├── account/            # Perfil de usuario
│   ├── admin/              # Tablas y formulario de productos
│   ├── cart/               # Drawer e items del carrito
│   ├── checkout/           # Formularios y stepper
│   ├── filters/            # Filtros y ordenamiento
│   ├── layout/             # Header y Footer
│   ├── products/           # Cards, grid, galeria, specs
│   └── ui/                 # Primitivos reutilizables
├── lib/
│   ├── auth-routing.ts     # Redirects seguros y rol admin
│   ├── mock-data.ts        # Datos demo para fallback
│   ├── supabase/           # Clientes, env, middleware y data access
│   └── utils.ts            # Utilidades compartidas
├── store/
│   └── cart.ts             # Zustand store, key `afcr-cart`
├── types/
│   └── index.ts            # Tipos del dominio
└── proxy.ts                # Proxy de Next 16 para refrescar sesion
```

## Rutas API

| Ruta | Metodos | Responsabilidad |
|---|---|---|
| `/api/auth/callback` | `GET` | Intercambia OAuth code por sesion y redirige segun rol |
| `/api/auth/role-redirect` | `GET` | Redireccion post-login segura |
| `/api/auth/signout` | `GET`, `POST` | Cierra sesion |
| `/api/products/search` | `GET` | Busqueda de productos con fallback mock |
| `/api/cart` | `GET`, `POST` | Carrito Supabase para usuarios autenticados |
| `/api/cart/[id]` | `PATCH`, `DELETE` | Actualiza o elimina items propios |
| `/api/orders` | `POST` | Crea orden, items y limpia carrito Supabase |
| `/api/orders/[id]` | `GET` | Lee una orden propia |
| `/api/admin/products` | `POST` | Crea productos; requiere admin |
| `/api/admin/products/[id]` | `PUT`, `DELETE` | Edita o elimina productos; requiere admin |

## Flujo de Datos

- El catalogo publico intenta leer desde Supabase y cae a `src/lib/mock-data.ts` si la consulta falla o no hay datos utiles.
- Auth, cuenta, checkout y admin usan Supabase Auth real.
- El carrito visible de la UI usa Zustand/localStorage con la key `afcr-cart`.
- Las APIs de carrito Supabase existen para persistencia de usuarios autenticados, pero no son la fuente principal visible del carrito actual.
- El checkout exige sesion y crea ordenes mediante `/api/orders`.
- `src/proxy.ts` refresca sesion; los redirects y guards reales viven en layouts, paginas privadas y rutas de auth.

## Panel Admin

1. Crear una cuenta en la tienda.
2. Asignar `profiles.role = 'admin'` en Supabase.
3. Acceder a `/admin`.

Tambien existe un fallback de email permitido en `src/lib/auth-routing.ts`. Si cambia la politica de admins, revisar ese helper y las politicas RLS relacionadas.

## Imagenes de Productos

El bucket esperado es `product-images`.

Las imagenes publicas de Supabase Storage deben tener formato:

```text
https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
```

`next.config.ts` permite imagenes de `*.supabase.co/storage/v1/object/public/**` y `images.unsplash.com`.

## Produccion

1. Completar `.env.local` o las variables del entorno de despliegue.
2. Aplicar migraciones en orden.
3. Ejecutar `supabase/seed.sql` solo si se necesitan datos demo.
4. Configurar URLs de Auth/OAuth en Supabase.
5. Asignar admins mediante `profiles.role = 'admin'`.
6. Verificar RLS y Storage antes de exponer escritura admin.
7. Ejecutar:

```bash
npm run build
npm run start
```

## Estado Actual

- La app combina Supabase real con fallback mock para catalogo publico.
- Pagos con MercadoPago/Stripe no estan implementados todavia.
- `README.md` describe la arquitectura actual con Next.js 16 y `src/proxy.ts`.
