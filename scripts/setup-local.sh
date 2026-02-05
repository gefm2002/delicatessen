#!/bin/bash

echo "🚀 Setup local de Delicatessen"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "📝 Creando .env.local desde .env.example..."
  cp .env.example .env.local
  echo "⚠️  IMPORTANTE: Editá .env.local y completá las variables de Supabase"
  echo ""
fi

# Install dependencies
echo "📦 Instalando dependencias..."
npm install

echo ""
echo "✅ Setup completado!"
echo ""
echo "Próximos pasos:"
echo "1. Editá .env.local con tus credenciales de Supabase"
echo "2. Aplicá las migrations desde supabase/migrations/ en Supabase Dashboard"
echo "3. Ejecutá: npm run seed"
echo "4. Ejecutá: npm run dev"
echo ""
