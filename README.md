# Delicatessen - Webapp E-commerce

Webapp SPA para supermercado/almacén gourmet con foco en promos, boxes y productos a granel.

## ⚠️ IMPORTANTE - SEGURIDAD

**Los tokens compartidos en el chat deben ser REVOCADOS/ROTADOS inmediatamente:**

1. **GitHub Token**: Revocá cualquier token compartido desde GitHub Settings > Developer settings > Personal access tokens
2. **Supabase Access Token**: Revocá cualquier token compartido desde Supabase Dashboard > Account Settings > Access Tokens

**Generá nuevos tokens y configurálos en las variables de entorno.**

## Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Supabase + Netlify Functions
- **Deploy**: Netlify
- **Base de datos**: PostgreSQL (Supabase)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completá las variables:

```bash
cp .env.example .env.local
```

Variables requeridas:
- `SUPABASE_URL`: URL de tu proyecto Supabase
- `SUPABASE_ANON_KEY`: Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio (solo para funciones/server)
- `VITE_SUPABASE_URL`: Misma que SUPABASE_URL
- `VITE_SUPABASE_ANON_KEY`: Misma que SUPABASE_ANON_KEY
- `VITE_WHATSAPP_NUMBER`: Número de WhatsApp (formato: 5491123456789)

### 3. Provisionar Supabase

#### Modo A: Proyecto existente

Si ya tenés un proyecto Supabase, configurá las variables en `.env.local` y saltá al paso 4.

#### Modo B: Crear proyecto automáticamente

```bash
# Configurá estas variables antes de ejecutar:
export SUPABASE_ACCESS_TOKEN=tu_token
export SUPABASE_ORG_SLUG=tu_org_slug
export SUPABASE_PROJECT_NAME=delicatessen
export SUPABASE_REGION=us-east-1

npm run supabase:provision
```

### 4. Aplicar migrations

Las migrations están en `supabase/migrations/`. Aplicalas desde el Supabase Dashboard o CLI:

```bash
supabase db push
```

O manualmente desde el SQL Editor en Supabase Dashboard.

### 5. Ejecutar seed

```bash
npm run seed
```

Esto creará:
- Categorías
- Productos (weighted, standard, combo)
- Promos
- Sucursales
- Configuración del sitio
- Admin (email: `admin@delicatessen.com`, password: `admin123`)

### 6. Descargar imágenes de stock (opcional)

```bash
npm run fetch-images
```

### 7. Ejecutar en desarrollo

```bash
npm run dev
```

## Estructura del proyecto

```
delicatessen/
├── src/
│   ├── components/       # Componentes UI reutilizables
│   ├── pages/           # Páginas de la app
│   ├── lib/             # Helpers y utilidades
│   ├── context/         # Context providers (Cart)
│   └── styles/          # Estilos globales y tokens
├── supabase/
│   └── migrations/      # Migrations de base de datos
├── netlify/
│   └── functions/       # Netlify Functions
├── scripts/             # Scripts de automatización
└── public/             # Assets estáticos
```

## Netlify Functions

Todas las funciones están en `netlify/functions/`:

- `orders-create`: Crear orden (POST)
- `admin-login`: Login de admin (POST)
- `admin-orders-list`: Listar órdenes (GET)
- `admin-orders-get`: Obtener orden (GET)
- `admin-orders-update`: Actualizar orden (PUT)
- `admin-orders-send-note`: Enviar nota por WhatsApp (POST)
- `admin-products-crud`: CRUD de productos
- `admin-categories-crud`: CRUD de categorías
- `admin-promos-crud`: CRUD de promos
- `admin-branches-crud`: CRUD de sucursales
- `admin-site-config-get`: Obtener configuración (GET)
- `admin-site-config-update`: Actualizar configuración (PUT)
- `images-sign-upload`: Generar URL de subida (POST)
- `images-sign-read`: Generar URL de lectura (GET)

## Variables de entorno en Netlify

Configurá estas variables en Netlify Dashboard > Site settings > Environment variables:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NETLIFY_JWT_SECRET` (para autenticación de admin)

## Modelos de producto

- **standard**: Productos con precio fijo y cantidad (ej: yerba, fideos)
- **weighted**: Productos a granel con precio por kg (ej: fiambres, quesos)
- **combo**: Boxes/regalos con precio fijo (ej: Box Gourmet)

## Estados de orden

- `new`: Nueva orden
- `contacted`: Cliente contactado
- `confirmed`: Orden confirmada
- `preparing`: En preparación
- `shipped`: Enviada
- `completed`: Completada
- `canceled`: Cancelada

## Deploy

1. Conectá el repo a Netlify
2. Configurá las variables de entorno en Netlify
3. Deploy automático desde `main`

## Desarrollo

- **Frontend**: `npm run dev` (puerto 5173)
- **Netlify Functions**: Se ejecutan localmente con `netlify dev` (requiere Netlify CLI)

## Licencia

Diseño y desarrollo por [Structura](https://structura.com.ar/)
