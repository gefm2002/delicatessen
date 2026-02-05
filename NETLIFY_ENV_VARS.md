# 🔐 Variables de Entorno para Netlify

Copia y pega estos valores en **Netlify Dashboard > Site settings > Environment variables**

## ⚠️ IMPORTANTE - SEGURIDAD

**Los tokens compartidos deben ser REVOCADOS/ROTADOS inmediatamente.**

---

## 📋 Variables para Netlify Dashboard

### Variables Requeridas (Servidor/Functions):

```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NETLIFY_JWT_SECRET=tu_jwt_secret_aqui
```

### Variables para Build (Frontend):

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
VITE_WHATSAPP_NUMBER=5491123456789
```

### Variables Opcionales (Solo si usás scripts de automatización):

```
SUPABASE_ACCESS_TOKEN=tu_supabase_access_token
SUPABASE_ORG_SLUG=tu_org_slug
SUPABASE_PROJECT_NAME=delicatessen
SUPABASE_REGION=us-east-1
GITHUB_TOKEN=tu_github_token_aqui
```

---

## 📝 Cómo Configurar en Netlify

1. Ve a tu sitio en [Netlify Dashboard](https://app.netlify.com)
2. Ve a **Site settings > Environment variables**
3. Click en **Add a variable**
4. Para cada variable:
   - **Key**: El nombre (ej: `SUPABASE_URL`)
   - **Value**: El valor (ej: `https://oseeysmiwfdhpizzeota.supabase.co`)
   - **Scopes**: Seleccioná "All scopes" o "Production, Deploy previews, Branch deploys" según necesites

### Orden Recomendado:

1. **SUPABASE_URL**
2. **SUPABASE_SERVICE_ROLE_KEY**
3. **NETLIFY_JWT_SECRET**
4. **VITE_SUPABASE_URL**
5. **VITE_SUPABASE_ANON_KEY**
6. **VITE_WHATSAPP_NUMBER**

---

## 🔄 Después de Configurar

1. **Hacé un nuevo deploy** para que las variables tomen efecto
2. **Revocá los tokens compartidos** y generá nuevos
3. **Actualizá las variables** con los nuevos tokens

---

## ✅ Checklist

- [ ] Configuré todas las variables requeridas
- [ ] Configuré las variables VITE_ para el build
- [ ] Hice un nuevo deploy
- [ ] Revocé los tokens compartidos
- [ ] Generé nuevos tokens y actualicé las variables
