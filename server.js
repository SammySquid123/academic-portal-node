const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Remove security restriction policies from the headers
function filterHeaders(proxyRes) {
    delete proxyRes.headers['x-frame-options'];
    delete proxyRes.headers['content-security-policy'];
    delete proxyRes.headers['content-security-policy-report-only'];
}

// 1. Deliver the visual browser template framework directly inline
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>DogePortal V4</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #07070c; color: #ffb700; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
                
                header { background: #0f0f1a; border-bottom: 2px solid #ffb700; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: 0 0 15px rgba(255, 183, 0, 0.2); z-index: 20; }
                .branding { font-weight: 900; font-size: 18px; color: #ffb700; text-shadow: 0 0 8px rgba(255,183,0,0.5); cursor: pointer; white-space: nowrap; }
                
                .tab-strip { display: flex; gap: 6px; overflow-x: auto; flex-grow: 1; padding-bottom: 2px; -webkit-overflow-scrolling: touch; }
                .tab-strip::-webkit-scrollbar { display: none; }
                .tab { background: #141424; border: 1px solid #2a2a40; padding: 6px 14px; border-radius: 6px 6px 0 0; font-size: 13px; cursor: pointer; color: #8a8a9e; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
                .tab.active { background: #ffb700; color: #07070c; border-color: #ffb700; font-weight: 700; box-shadow: 0 -2px 10px rgba(255,183,0,0.2); }
                .tab .close-btn { font-weight: bold; cursor: pointer; margin-left: 4px; }
                .add-tab-btn { background: #141424; border: 1px solid #ffb700; color: #ffb700; width: 30px; height: 30px; border-radius: 5px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

                .nav-controls { display: flex; gap: 6px; align-items: center; }
                .nav-btn { background: #141424; border: 1px solid #ffb700; color: #ffb700; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .address-bar { background: #07070c; border: 1px solid #ffb700; border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 14px; outline: none; width: 180px; transition: width 0.2s; }
                @media(min-width: 600px) { .address-bar { width: 300px; } }

                .viewport-container { flex-grow: 1; position: relative; background: #07070c; }
                .view-frame { width: 100%; height: 100%; border: none; background: white; display: none; }
                .view-frame.active { display: block; }

                .home-dashboard { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #0b0b14; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; z-index: 10; }
                .home-dashboard.hidden { display: none; }
                .search-box { width: 100%; max-width: 500px; background: #0f0f1a; padding: 30px; border-radius: 12px; border: 1px solid #ffb700; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
                .search-box h1 { font-size: 28px; margin-bottom: 5px; color: #ffb700; text-shadow: 0 0 10px rgba(255,183,0,0.3); }
                .search-box p { font-size: 13px; color: #7a7a9e; margin-bottom: 20px; }
                .search-box input { width: 100%; padding: 14px; background: #07070c; border: 1px solid #ffb700; border-radius: 8px; color: #fff; font-size: 16px; outline: none; margin-bottom: 15px; text-align: center; }
                .search-box button { width: 100%; padding: 14px; background: #ffb700; color: #07070c; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>

            <header>
                <div class="branding" onclick="goHome()">🐕 DogePortal</div>
                <div class="tab-strip" id="tabStrip"></div>
                <button class="add-tab-btn" onclick="createNewTab()">+</button>
                
                <div class="nav-controls">
                    <button class="nav-btn" onclick="goHome()">🏠</button>
                    <input type="text" class="address-bar" id="topAddressBar" placeholder="Enter URL..." onkeypress="if(event.key==='Enter')launchUrlFromTop()">
                    <button class="nav-btn" onclick="launchUrlFromTop()">➜</button>
                </div>
            </header>

            <div class="viewport-container" id="viewportContainer"></div>

            <script>
                let tabs = [];
                let activeTabId = null;

                function createNewTab() {
                    const id = 'tab_' + Date.now();
                    tabs.push({ id: id, title: 'Blank Tab', url: null, isHome: true });

                    const container = document.getElementById('viewportContainer');
                    
                    const dashboard = document.createElement('div');
                    dashboard.className = 'home-dashboard';
                    dashboard.id = 'home_' + id;
                    dashboard.innerHTML = \`
                        <div class="search-box">
                            <h1>DogePortal V4</h1>
                            <p>Decentralized Virtual Gateway Matrix</p>
                            <input type="text" id="input_\${id}" placeholder="https://google.com" onkeypress="if(event.key==='Enter')mountTab('\${id}')">
                            <button onclick="mountTab('\${id}')">Deploy Connection</button>
                        </div>
                    \`;
                    
                    const iframe = document.createElement('iframe');
                    iframe.className = 'view-frame';
                    iframe.id = 'frame_' + id;

                    container.appendChild(dashboard);
                    container.appendChild(iframe);

                    renderTabs();
                    switchTab(id);
                }

                function renderTabs() {
                    const strip = document.getElementById('tabStrip');
                    strip.innerHTML = '';
                    tabs.forEach(t => {
                        const el = document.createElement('div');
                        el.className = \`tab \${t.id === activeTabId ? 'active' : ''}\`;
                        el.onclick = () => switchTab(t.id);
                        el.innerHTML = \`
                            <span>\${t.title}</span>
                            <span class="close-btn" onclick="event.stopPropagation(); closeTab('\${t.id}')">×</span>
                        \`;
                        strip.appendChild(el);
                    });
                }

                function switchTab(id) {
                    activeTabId = id;
                    const tab = tabs.find(t => t.id === id);
                    
                    document.querySelectorAll('.home-dashboard, .view-frame').forEach(el => {
                        el.style.display = 'none';
                        el.classList.remove('active');
                    });

                    const targetHome = document.getElementById('home_' + id);
                    const targetFrame = document.getElementById('frame_' + id);
                    const topBar = document.getElementById('topAddressBar');

                    if (tab.isHome) {
                        if(targetHome) targetHome.style.display = 'flex';
                        topBar.value = '';
                    } else {
                        if(targetHome) targetHome.style.display = 'none';
                        if(targetFrame) {
                            targetFrame.style.display = 'block';
                            targetFrame.classList.add('active');
                        }
                        topBar.value = tab.url;
                    }
                    renderTabs();
                }

                function closeTab(id) {
                    if (tabs.length <= 1) return;
                    const index = tabs.findIndex(t => t.id === id);
                    tabs = tabs.filter(t => t.id !== id);
                    
                    document.getElementById('home_' + id)?.remove();
                    document.getElementById('frame_' + id)?.remove();

                    if (activeTabId === id) {
                        activeTabId = tabs[index > 0 ? index - 1 : 0].id;
                    }
                    switchTab(activeTabId);
                }

                function mountTab(id) {
                    const inputEl = document.getElementById('input_' + id);
                    let target = inputEl.value.trim();
                    if(!target) return;

                    if (!target.startsWith('http://') && !target.startsWith('https://')) {
                        target = 'https://' + target;
                    }

                    const tab = tabs.find(t => t.id === id);
                    tab.url = target;
                    tab.isHome = false;
                    
                    try {
                        tab.title = new URL(target).hostname.replace('www.', '');
