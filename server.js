const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets out of the root folder
app.use(express.static(__dirname));

// 1. Deliver the visual browser template framework
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Intercept routing network queries inside the tabs
app.use('/session-route/:targetUrl*', (req, res, next) => {
    const rawTarget = req.params.targetUrl;
    if (!rawTarget) return res.status(400).send('Missing target URL parameters.');

    let decodedTarget = decodeURIComponent(rawTarget);
    const extraPath = req.params[0] || '';
    const fullTarget = decodedTarget + extraPath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '');

    createProxyMiddleware({
        target: fullTarget,
        changeOrigin: true,
        ignorePath: true,
        followRedirects: true,
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15');
        },
        onProxyRes: (proxyRes) => {
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        },
        onError: (err, req, response) => {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Session routing engine connection exception.');
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log('Active browser matrix core matching port ' + PORT));
