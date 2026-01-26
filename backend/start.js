#!/usr/bin/env node

console.log('🚀 Iniciando Sistema PDV Backend...');
console.log('📁 Diretório atual:', process.cwd());
console.log('📊 NODE_ENV:', process.env.NODE_ENV);
console.log('🔌 PORT:', process.env.PORT);

// Verificar se o arquivo existe
const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'dist', 'server.js');
console.log('🔍 Procurando arquivo:', serverPath);

if (!fs.existsSync(serverPath)) {
  console.error('❌ ERRO: server.js não encontrado em:', serverPath);
  console.log('📂 Conteúdo da pasta backend:');
  fs.readdirSync(__dirname).forEach(file => console.log('  -', file));
  
  if (fs.existsSync(path.join(__dirname, 'dist'))) {
    console.log('📂 Conteúdo da pasta dist:');
    fs.readdirSync(path.join(__dirname, 'dist')).forEach(file => console.log('  -', file));
  } else {
    console.error('❌ Pasta dist não existe!');
  }
  process.exit(1);
}

console.log('✅ Arquivo encontrado, iniciando servidor...');
require('./dist/server.js');
