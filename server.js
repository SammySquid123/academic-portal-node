const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Deliver the visual template from an un-clippable cloud delivery pipeline
app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>DogePortal V4</title><script src="https://jsdelivr.net" defer></script></head><body></body></html>`);
});

// 2. Intercept wildcard traffic dynamically inside the active tab iframe sandbox
app.use('/session-route/:targetUrl*', (req, res, next) => {
    const rawTarget = req.params.targetUrl;
    if (!rawTarget) return res.status(400).send('Missing target parameters.');
    let dest = decodeURIComponent(rawTarget);
    const extra = req.params || '';
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    
    createProxyMiddleware({
        target: dest + extra + query,
        changeOrigin: true,
        ignorePath: true,
        followRedirects: true,
        onProxyReq: (proxyReq) => proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
        onProxyRes: (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
            delete proxyRes.headers['content-security-policy-report-only'];
        },
        onError: (err, req, response) => {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Proxy routing channel error.');
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log('Active on ' + PORT));
