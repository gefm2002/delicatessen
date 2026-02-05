# 🚀 Setup Local - Guía Rápida

## Estado Actual

✅ **Código creado**: Todo el código está listo
❌ **Supabase**: Aún no se creó nada en Supabase (solo migrations preparadas)

## Pasos para Ejecutar Localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar Supabase

Tienes dos opciones:

#### Opción A: Usar proyecto Supabase existente

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto o usa uno existente
3. Copia la URL y las keys (anon y service_role)
4. Crea `.env.local`:

```bash
cp .env.example .env.local
```

5. Edita `.env.local` y completa:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
VITE_WHATSAPP_NUMBER=5491123456789
```

#### Opción B: Crear proyecto automáticamente

```bash
# Configura estas variables
export SUPABASE_ACCESS_TOKEN=tu_access_token
export SUPABASE_ORG_SLUG=gopntmzxqonsqbsykbup
export SUPABASE_PROJECT_NAME=delicatessen
export SUPABASE_REGION=us-east-1

npm run supabase:provision
```

### 3. Aplicar Migrations

Ve al SQL Editor en Supabase Dashboard y ejecuta los archivos en orden:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_storage.sql`
3. `supabase/migrations/010_rpc_insert_order.sql`

O usa Supabase CLI:

```bash
supabase db push
```

### 4. Ejecutar Seed

```bash
npm run seed
```

Esto creará:
- ✅ Categorías
- ✅ Productos (40+)
- ✅ Promos
- ✅ Sucursales
- ✅ Configuración
- ✅ Admin (admin@delicatessen.com / admin123)

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

La app estará en: http://localhost:5173

## Verificación Rápida

```bash
# 1. Instalar
npm install

# 2. Configurar .env.local (editar manualmente)

# 3. Aplicar migrations (desde Supabase Dashboard)

# 4. Seed
npm run seed

# 5. Ejecutar
npm run dev
```

## Troubleshooting

### Error: "Missing Supabase environment variables"

- Verifica que `.env.local` existe y tiene todas las variables
- Las variables `VITE_*` deben estar sin espacios

### Error al aplicar migrations

- Verifica que estás en el SQL Editor correcto
- Ejecuta las migrations en orden (001, 002, 010)
- Si hay errores de "already exists", está bien, significa que ya se aplicaron

### Error en seed

- Verifica que las migrations se aplicaron correctamente
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` está configurada
- Revisa la consola para ver qué falló

## Estructura de URLs

- **Frontend**: http://localhost:5173
- **Admin**: http://localhost:5173/admin
- **API (dev)**: Las funciones de Netlify se ejecutan localmente con `netlify dev` (opcional)

## Notas

- En desarrollo, el checkout usa `createOrderDev` que se conecta directamente a Supabase
- Las Netlify Functions solo se usan en producción
- El admin requiere `VITE_SUPABASE_SERVICE_ROLE_KEY` en desarrollo
