#!/usr/bin/env bash
# Build script para Render

echo "📦 Instalando dependências do backend..."
cd backend
npm install

echo "🔨 Compilando TypeScript..."
npm run build

echo "✅ Build completo!"
