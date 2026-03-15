# AFCR Seguridad — E-commerce de Cámaras de Seguridad

Tienda online especializada en sistemas de videovigilancia y seguridad electrónica.

## Stack Tecnológico

- **Frontend**: Next.js 14+ App Router + TypeScript
- **Estilos**: Tailwind CSS v4
- **Base de datos**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **Storage**: Supabase Storage (imágenes de productos)
- **Estado global**: Zustand (carrito)
- **Pagos**: MercadoPago / Stripe (preparado)

## Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales de Supabase
```

### 3. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ir a **SQL Editor** y ejecutar:
   ```sql
   -- supabase/migrations/001_initial_schema.sql
   ```
3. Ejecutar datos de ejemplo:
   ```sql
   -- supabase/seed.sql
   ```
4. Copiar las credenciales a `.env.local`

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── admin/              # Panel administrativo (solo admins)
│   ├── api/                # API Route Handlers
│   ├── carrito/            # Página de carrito
│   ├── categorias/[slug]/  # Páginas por categoría
│   ├── checkout/           # Proceso de compra
│   ├── cuenta/             # Cuenta del usuario
│   ├── login/              # Autenticación
│   ├── marcas/[slug]/      # Páginas por marca
│   ├── productos/          # Catálogo y detalle
│   └── registro/           # Registro de usuarios
├── components/
│   ├── admin/              # Componentes del panel admin
│   ├── cart/               # Carrito (drawer + items)
│   ├── checkout/           # Stepper de checkout
│   ├── filters/            # Filtros del catálogo
│   ├── layout/             # Header + Footer
│   ├── products/           # Tarjetas, grid, galería, specs
│   └── ui/                 # Componentes base
├── lib/
│   ├── mock-data.ts        # Datos de ejemplo (fallback sin Supabase)
│   ├── supabase/           # Clientes (browser/server/middleware)
│   └── utils.ts            # Utilidades
├── store/
│   └── cart.ts             # Estado del carrito (Zustand)
├── types/
│   └── index.ts            # Interfaces TypeScript
└── middleware.ts            # Protección de rutas
```

## Configurar Panel Admin

1. Crear una cuenta en la tienda
2. En Supabase Table Editor → profiles → cambiar `role` a `admin`
3. Acceder a `/admin`

## Variables de Entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (solo servidor) |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acceso MercadoPago |
| `NEXT_PUBLIC_APP_URL` | URL base de la aplicación |

## Funcionamiento Sin Supabase

La app usa datos mock automáticamente cuando Supabase no está configurado:
- Productos, categorías y marcas se cargan desde `src/lib/mock-data.ts`
- El carrito funciona con localStorage
- Las rutas protegidas redirigen al login

## Build de Producción

```bash
npm run build
npm start
```
