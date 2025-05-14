const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// Proxy middleware configuration
app.use('/api', createProxyMiddleware({
  target: 'http://20.244.56.144',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/evaluation-service'
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
}));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});
