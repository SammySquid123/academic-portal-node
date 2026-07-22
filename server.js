const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

// 1. Serve the browser user interface
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Academic Research Gateway</title>
            <style>
                body { font-family: -apple-system, sans-serif; background: #f4f4f9; padding: 20px; text-align: center; }
                .container { max-width: 600px; margin: 50px auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                input[type="text"] { width: 80%; padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 16px; margin-bottom: 15px; }
                button { background: #007aff; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Educational Database Portal</h2>
                <p>Enter the complete educational URL to mount the viewport matrix:</p>
                <form action="/gateway-mount" method="POST">
                    <input type="text" name="targetUrl" placeholder="https://example.com" required><br>
                    <button type="submit">Mount Resource</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

// 2. Dynamically intercept requests and map them to the router path
app.post('/gateway-mount', (req, res) => {
    let target = req.body.targetUrl;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
    }
    app.set('currentTarget', target);
    res.redirect('/viewport/');
});

// 3. Mount the dynamic proxy client framework
app.use('/viewport', (req, res, next) => {
    const target = app.get('currentTarget');
    if (!target) return res.redirect('/');
    
    createProxyMiddleware({
        target: target,
        changeOrigin: true,
        pathRewrite: { '^/viewport': '' },
        followRedirects: true,
        onError: (err, reqRes, response) => {
            response.writeHead(500, { 'Content-Type': 'text/plain' });
            response.end('Gateway connection reset. Verify target URL accuracy.');
        }
    })(req, res, next);
});

app.listen(PORT, () => console.log('Gateway routing active on port ' + PORT));
