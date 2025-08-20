const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3001;

// 🔧 PROXY para a API (⚠️ NÃO adicionar '/api' no target para evitar duplicação)
// Ex.: chamada do front -> http://localhost:3001/api/profissionais
// Proxy envia para ->     http://localhost:3000/api/profissionais
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'warn',
}));

// Proxy do Swagger
app.use('/api-docs', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
  logLevel: 'warn',
}));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Front rodando em http://localhost:${PORT}`);
});
