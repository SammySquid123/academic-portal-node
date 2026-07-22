const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Serve the comprehensive multi-tab workspace UI
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>EduPortal Workspace</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0a0a12; color: #e2e2ec; height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
                
                /* Neon Accent Doge-Inspired Header */
                header { background: #111122; border-bottom: 2px solid #ff0055; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px; box-shadow: 0 0 15px rgba(255, 0, 85, 0.2); }
                .branding { font-weight: 800; font-size: 18px; color: #ff0055; text-shadow: 0 0 8px rgba(255, 0, 85, 0.6); display: flex; align-items: center; gap: 8px; cursor: pointer; }
                
                /* Custom Tab Management Strip */
                .tab-strip { display: flex; gap: 6px; overflow-x: auto; flex-grow: 1; padding-bottom: 2px; max-width: 60%; }
                .tab { background: #1a1a2e; border: 1px solid #333; padding: 6px 16px; border-radius: 6px 6px 0 0; font-size: 13px; cursor: pointer; color: #8a8a9e; display: flex; align-items: center; gap: 8px; white-space: nowrap; transition: all 0.2s; }
                .tab.active { background: #ff0055; color: white; border-color: #ff0055; font-weight: 600; box-shadow: 0 -2px 10px rgba(255,0,85,0.3); }
                .tab .close-btn { font-weight: bold; cursor: pointer; opacity: 0.6; }
                .tab .close-btn:hover { opacity: 1; color: #fff; }
                .add-tab-btn { background: #1a1a2e; border: 1px solid #444; color: #ff0055; width: 30px; height: 30px; border-radius: 5px; cursor: pointer; font-weight: bold; display: flex; align-items: center; justify-content: center; }
                .add-tab-btn:hover { background: #ff0055; color: white; }

                /* Navigation Bar controls */
                .nav-controls { display: flex; gap: 8px; align-items: center; }
                .nav-btn { background: #1b1b3a; border: 1px solid #ff0055; color: #ff0055; width: 34px; height: 34px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .nav-btn:hover { background: #ff0055; color: white; }
                .address-bar { flex-grow: 1; background: #07070f; border: 1px solid #334; border-radius: 6px; padding: 8px 12px; color: #fff; font-size: 14px; outline: none; max-width: 400px; }
                .address-bar:focus { border-color: #00ffcc; box-shadow: 0 0 8px rgba(0, 255, 204, 0.4); }

                /* Core Layout Window Frame container */
                .viewport-container { flex-grow: 1; position: relative; background: #07070f; }
                .view-frame { width: 100%; height: 100%; border: none; background: white; display: none; }
                .view-frame.active { display: block; }

                /* Built-In Home Screen Dashboard Overlay */
                .home-dashboard { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #0d0d1f; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; z-index: 10; text-align: center; }
                .home-dashboard.hidden { display: none; }
                .search-box { width: 100%; max-width: 550px; background: #161630; padding: 30px; border-radius: 12px; border: 1px solid #ff0055; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
                .search-box h1 { font-size: 26px; color: #fff; margin-bottom: 8px; }
                .search-box p { font-size: 14px; color: #8a8a9e; margin-bottom: 20px; }
                .search-box input { width: 100%; padding: 14px; background: #090914; border: 1px solid #445; border-radius: 8px; color: #fff; font-size: 16px; outline: none; margin-bottom: 15px; text-align: center; }
                .search-box input:focus { border-color: #00ffcc; }
                .search-box button { width: 100%; padding: 14px; background: #ff0055; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s; }
                .search-box button:hover { background: #e0004c; }
            </style>
        </head>
        <body>

            <header>
                <div class="branding" onclick="goHome()">⚡ EduPortal</div>
                <div class="tab-strip" id="tabStrip"></div>
                <button class="add-tab-btn" onclick="createNewTab()">+</button>
                
                <div class="nav-controls">
                    <button class="nav-btn" onclick="goHome()">🏠</button>
                    <input type="text" class="address-bar" id="topAddressBar" placeholder="Search or type URL..." onkeypress="handleAddressBarKey(event)">
                    <button class="nav-btn" onclick="launchUrlFromTop()">➜</button>
                </div>
            </header>

            <div class="viewport-container" id="viewportContainer"></div>

            <script>
                let tabs = [];
                let activeTabId = null;

                function createNewTab() {
                    const id = 'tab_' + Date.now();
                    const tabObj = { id: id, title: 'New Tab', url: null, isHome: true };
                    tabs.push(tabObj);

                    // Append the actual frame container element
                    const container = document.getElementById('viewportContainer');
                    
                    const dashboard = document.createElement('div');
                    dashboard.className = 'home-dashboard';
                    dashboard.id = 'home_' + id;
                    dashboard.innerHTML = \`
                        <div class="search-box">
                            <h1>Academic Gateway</h1>
                            <p>Isolated Virtual Core Matrix</p>
                            <input type="text" id="input_\${id}" placeholder="https://google.com" onkeypress="if(event.key==='Enter')mountTab('\${id}')">
                            <button onclick="mountTab('\${id}')">Launch Core Connection</button>
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
                    
                    document.querySelectorAll('.home-dashboard, .view-frame').forEach(el => el.classList.remove('active'));
                    document.querySelectorAll('.view-frame').forEach(el => el.style.display = 'none');

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
                    
                    const homeEl = document.getElementById('home_' + id);
                    const frameEl = document.getElementById('frame_' + id);
                    if(homeEl) homeEl.remove();
                    if(frameEl) frameEl.remove();

                    if (activeTabId === id) {
                        const nextActiveIndex = index > 0 ? index - 1 : 0;
                        activeTabId = tabs[nextActiveIndex].id;
                    }
                    switchTab(activeTabId);
                }

                function mountTab(id) {
                    const inputEl = document.getElementById('input_' + id);
                    let target = inputEl.value.trim();
