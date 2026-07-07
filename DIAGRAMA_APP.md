# AFCR Seguridad - Diagrama Simplificado

```mermaid
flowchart LR
  User["Usuario / Admin<br/>Navegador"]

  subgraph App["Next.js App Router"]
    Public["Tienda publica<br/>inicio, catalogo, producto, carrito"]
    Auth["Login / Registro<br/>email-password y Google"]
    Checkout["Checkout<br/>validacion de sesion + pedido"]
    Account["Cuenta<br/>perfil y pedidos"]
    Admin["Panel Admin<br/>productos, pedidos, usuarios"]
  end

  subgraph UI["UI y estado cliente"]
    Components["Componentes React<br/>layout, productos, filtros, forms"]
    LocalCart["Carrito local<br/>Zustand + localStorage"]
    BrowserClient["Supabase browser client"]
  end

  subgraph Server["Servidor Next.js"]
    Proxy["Proxy<br/>refresca sesion"]
    DataLayer["Capa de datos<br/>src/lib/supabase/data.ts"]
    Api["API Routes<br/>auth, cart, orders, admin products"]
    AuthRules["Reglas de auth<br/>redirects + rol admin"]
  end

  subgraph Supabase["Supabase"]
    SupabaseAuth["Auth"]
    Database["Postgres + RLS"]
    Storage["Storage<br/>product-images"]
    Tables["Tablas principales<br/>profiles, products, categories, brands,<br/>cart_items, orders, order_items"]
  end

  Mock["Datos mock<br/>fallback demo"]

  User --> Public
  User --> Auth
  User --> Checkout
  User --> Account
  User --> Admin

  Public --> Components
  Account --> Components
  Admin --> Components
  Checkout --> Components

  Components --> LocalCart
  Components --> BrowserClient
  Auth --> BrowserClient
  Checkout --> LocalCart

  BrowserClient --> SupabaseAuth
  BrowserClient --> Storage
  BrowserClient --> Database

  Proxy --> SupabaseAuth
  Public --> DataLayer
  Account --> DataLayer
  Admin --> DataLayer
  DataLayer --> Database
  DataLayer -. si Supabase falla .-> Mock

  Auth --> Api
  Checkout --> Api
  Components --> Api
  Api --> AuthRules
  Api --> SupabaseAuth
  Api --> Database
  Api --> Storage

  Database --> Tables

  %% Colores de flechas por tipo de flujo.
  linkStyle default stroke:#94a3b8,stroke-width:1.5px
  linkStyle 0,1,2,3,4 stroke:#64748b,stroke-width:2.5px
  linkStyle 5,6,7,8 stroke:#f97316,stroke-width:2.5px
  linkStyle 9,10,11,12 stroke:#fb923c,stroke-width:2.5px
  linkStyle 13,14,15 stroke:#8b5cf6,stroke-width:2.5px
  linkStyle 16 stroke:#06b6d4,stroke-width:2.5px
  linkStyle 17,18,19,20,21 stroke:#22c55e,stroke-width:2.5px
  linkStyle 22,23,24,25,26,27,28 stroke:#2563eb,stroke-width:2.5px
  linkStyle 29 stroke:#10b981,stroke-width:2.5px
```

## Leyenda

- Gris: entrada del usuario a las secciones principales.
- Naranja: rutas que usan componentes y estado cliente.
- Naranja claro: carrito local y cliente browser de Supabase.
- Violeta: comunicacion directa del cliente con Supabase.
- Cian: refresco de sesion en el proxy.
- Verde: lecturas server con fallback mock.
- Azul: API routes y operaciones protegidas.
- Verde oscuro: estructura de base de datos.

## Resumen

La app es una tienda Next.js con rutas publicas, checkout, cuenta privada y panel admin. Lee datos desde Supabase mediante una capa server con fallback mock. El carrito visible vive en Zustand/localStorage. Las operaciones importantes, como crear ordenes o administrar productos, pasan por API routes protegidas y Supabase aplica RLS en la base de datos.
