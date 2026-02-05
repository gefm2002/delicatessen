# 🔐 Valores de Variables de Entorno - Delicatessen

Copia y pega estos valores en tu `.env.local` y en Netlify Dashboard.

## ⚠️ IMPORTANTE - SEGURIDAD

**Los tokens compartidos en el chat deben ser REVOCADOS/ROTADOS inmediatamente:**

1. **GitHub Token**: Revocá cualquier token compartido desde GitHub Settings > Developer settings > Personal access tokens
2. **Supabase Access Token**: Revocá cualquier token compartido desde Supabase Dashboard > Account Settings > Access Tokens

**Generá nuevos tokens y configurálos en las variables de entorno.**

---

## 📋 Variables para `.env.local` (Desarrollo Local)

```env
# ============================================
# SUPABASE - Configuración Base
# ============================================
# Obtener desde: https://app.supabase.com > Tu Proyecto > Settings > API
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# ============================================
# SUPABASE - Variables para Vite (Frontend)
# ============================================
# Mismas que arriba, pero con prefijo VITE_
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# ============================================
# SUPABASE - Provisionamiento Automático (Opcional)
# ============================================
# Solo si querés crear el proyecto automáticamente
SUPABASE_ACCESS_TOKEN=tu_supabase_access_token
SUPABASE_ORG_SLUG=tu_org_slug
SUPABASE_PROJECT_NAME=delicatessen
SUPABASE_REGION=us-east-1
SUPABASE_DB_PASSWORD=tu_password_seguro_aqui

# ============================================
# WHATSAPP
# ============================================
# Formato: 5491123456789 (código país + código área + número sin 0 inicial)
VITE_WHATSAPP_NUMBER=5491123456789

# ============================================
# NETLIFY - JWT Secret (Producción)
# ============================================
# Generar con: openssl rand -base64 32
NETLIFY_JWT_SECRET=tu_jwt_secret_aqui

# ============================================
# GITHUB - Token (Opcional, para automatización)
# ============================================
GITHUB_TOKEN=tu_github_token_aqui
```

---

## 🌐 Variables para Netlify Dashboard

Configurá estas variables en: **Netlify Dashboard > Site settings > Environment variables**

### Variables Requeridas:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NETLIFY_JWT_SECRET=tu_jwt_secret_aqui
```

### Variables Opcionales:

```env
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

---

## 📝 Cómo Obtener los Valores

### 1. Supabase URL y Keys

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Seleccioná tu proyecto (o creá uno nuevo)
3. Ve a **Settings > API**
4. Copiá:
   - **Project URL** → `SUPABASE_URL` y `VITE_SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY` y `VITE_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` y `VITE_SUPABASE_SERVICE_ROLE_KEY`

### 2. Supabase Access Token (Para provisionamiento automático)

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Account Settings > Access Tokens**
3. Creá un nuevo token → `SUPABASE_ACCESS_TOKEN`

### 3. Supabase Org Slug

1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. En la URL o en la configuración de la organización, encontrás el slug
3. Ejemplo: `https://app.supabase.com/organization/gopntmzxqonsqbsykbup` → `gopntmzxqonsqbsykbup`

### 4. WhatsApp Number

Formato: `5491123456789`
- `54` = código país (Argentina)
- `9` = código para móviles
- `11` = código área (Buenos Aires)
- `123456789` = número sin el 0 inicial

### 5. Netlify JWT Secret

Generá un secret seguro:

```bash
openssl rand -base64 32
```

O usa cualquier string aleatorio de al menos 32 caracteres.

### 6. GitHub Token (Opcional)

1. Ve a [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Creá un nuevo token con permisos `repo`
3. Copiá el token → `GITHUB_TOKEN`

---

## ✅ Checklist de Configuración

- [ ] Crear proyecto en Supabase (o usar existente)
- [ ] Obtener `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configurar `.env.local` con todos los valores
- [ ] Aplicar migrations desde `supabase/migrations/`
- [ ] Ejecutar `npm run seed` para poblar la base de datos
- [ ] Configurar variables en Netlify Dashboard (si vas a deployar)
- [ ] **REVOCAR los tokens compartidos en el chat**

---

## 🚀 Comandos Rápidos

```bash
# 1. Copiar template
cp .env.example .env.local

# 2. Editar .env.local con los valores de arriba
# (usar tu editor favorito)

# 3. Aplicar migrations (desde Supabase Dashboard SQL Editor)
# O usar: supabase db push

# 4. Ejecutar seed
npm run seed

# 5. Ejecutar en desarrollo
npm run dev
```

---

## 📚 Documentación Adicional

- Ver `README.md` para setup completo
- Ver `SETUP_LOCAL.md` para guía rápida local
- Ver `supabase/migrations/` para estructura de base de datos
