const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Deliver the visual browser template framework
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. Clear out common security filters that block embedded pages
function filterHeaders(proxyRes) {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
}

// 3. Dynamic Multi-Route Gateway Catch-All
app.use('/session-route/:targetUrl*', (req, res, next) => {
    const rawTarget = req.params.targetUrl;
    if (!rawTarget) return res.status(400).send('Missing endpoint target parameters.');

    let decodedTarget = decodeURIComponent(rawTarget);
    
    // Extract any additional appended URL subpaths or folders
    const extraPath = req.params[0] || '';
    const queryParameters = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const fullTarget = decodedTarget + extraPath + queryParameters;

    createProxyMiddleware({
        target: fullTarget,
        changeOrigin: true,
        ignorePath: true,
        followRedirects: true,
        onProxyReq: (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15');
        },
        onProxyRes: filterHeaders,
        onError: (err, req, response) => {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Session routing engine connection exception.');
        }
    })(req, res, next);
});

// 4. Handle internal nested resource assets (images, css, scripts)
app.use((req, res, next) => {
    // If the asset request comes from within a running session tab, re-route it
    if (req.headers.referer && req.headers.referer.includes('/session-route/')) {
        const parts = req.headers.referer.split('/session-route/');
        if (parts.length > 1) {
            const currentBaseBaseUrl = decodeURIComponent(parts[1].split('/')[0]);
            const correctedAssetUrl = currentBaseBaseUrl + req.url;
            
            return createProxyMiddleware({
                target: correctedAssetUrl,
                changeOrigin: true,
                ignorePath: true,
                followRedirects: true,
                onProxyRes: filterHeaders
            })(req, res, next);
        }
    }
    next();
});

app.listen(PORT, () => console.log('Active browser matrix core matching port ' + PORT));
