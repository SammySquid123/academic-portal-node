// Render the complete visual template shell structure dynamically
document.body.innerHTML = `
<style>
* { box-sizing: border-box; margin: 0; padding: 0; } 
body { font-family: sans-serif; background: #07070c; color: #ffb700; height: 100vh; display: flex; flex-direction: column; overflow: hidden; } 
header { background: #0f0f1a; border-bottom: 2px solid #ffb700; padding: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; } 
.branding { font-weight: 900; cursor: pointer; text-shadow: 0 0 8px #ffb700; } 
.tab-strip { display: flex; gap: 6px; overflow-x: auto; flex-grow: 1; } 
.tab { background: #141424; padding: 6px 12px; border-radius: 6px 6px 0 0; cursor: pointer; font-size: 13px; display: flex; align-items: center; border: 1px solid #2a2a40; color: #8a8a9e; } 
.tab.active { background: #ffb700; color: #07070c; font-weight: 700; border-color: #ffb700; } 
.close-btn { margin-left: 6px; font-weight: bold; cursor: pointer; } 
.add-tab-btn { background: #141424; border: 1px solid #ffb700; color: #ffb700; width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-weight: bold; } 
.nav-controls { display: flex; gap: 4px; align-items: center; } 
.nav-btn { background: #141424; border: 1px solid #ffb700; color: #ffb700; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 12px; } 
.nav-btn:hover { background: #ffb700; color: #07070c; }
.address-bar { background: #07070c; border: 1px solid #ffb700; border-radius: 4px; padding: 6px; color: #fff; width: 160px; font-size: 13px; } 
.view-cont { flex-grow: 1; position: relative; background: #000; } 
.view-frame { width: 100%; height: 100%; border: none; background: white; display: none; } 
.view-frame.active { display: block; } 
.home-dashboard { position: absolute; width: 100%; height: 100%; background: #0b0b14; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; } 
.search-box { background: #0f0f1a; padding: 25px; border-radius: 8px; border: 1px solid #ffb700; text-align: center; width: 90%; max-width: 450px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); } 
.search-box h1 { margin-bottom: 10px; font-size: 24px; text-shadow: 0 0 10px rgba(255,183,0,0.3); } 
.search-box input { width: 100%; padding: 12px; background: #07070c; border: 1px solid #ffb700; border-radius: 6px; color: #fff; margin-bottom: 12px; text-align: center; outline: none; } 
.search-box button { width: 100%; padding: 12px; background: #ffb700; color: #07070c; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
</style>
<header>
    <div class="branding" onclick="goHome()">🐕 DogePortal</div>
    <div class="nav-controls">
        <button class="nav-btn" onclick="navBack()">◀</button>
        <button class="nav-btn" onclick="navForward()">▶</button>
        <button class="nav-btn" onclick="refreshTab()">↻</button>
        <button class="nav-btn" onclick="goHome()">🏠</button>
    </div>
    <div class="tab-strip" id="strip"></div>
    <button class="add-tab-btn" onclick="createTab()">+</button>
    <div class="nav-controls">
        <input type="text" class="address-bar" id="tBar" placeholder="Search or URL...">
        <button class="nav-btn" onclick="launchTop()">➜</button>
    </div>
</header>
<div class="view-cont" id="viewCont"></div>
`;

let tabs = [];
let activeId = null;

window.createTab = function() {
    const id = 't_' + Date.now();
    tabs.push({ id: id, title: 'Blank Tab', url: null, isHome: true, history: [], historyIndex: -1 });
    
    const container = document.getElementById('viewCont');
    const dash = document.createElement('div');
    dash.className = 'home-dashboard';
    dash.id = 'h_' + id;
    dash.innerHTML = `<div class="search-box"><h1>DogePortal V4</h1><input type="text" id="i_${id}" placeholder="Search DuckDuckGo or enter URL"><button onclick="mount('${id}')">Launch Core</button></div>`;
    
    const frame = document.createElement('iframe');
    frame.className = 'view-frame';
    frame.id = 'f_' + id;
    
    container.appendChild(dash);
    container.appendChild(frame);
    dash.querySelector('input').addEventListener('keypress', (e) => { if(e.key==='Enter') mount(id); });
    switchTab(id);
};

window.renderTabs = function() {
    const strip = document.getElementById('strip');
    strip.innerHTML = '';
    tabs.forEach(t => {
        const el = document.createElement('div');
        el.className = 'tab ' + (t.id === activeId ? 'active' : '');
        el.onclick = () => switchTab(t.id);
        el.innerHTML = `<span>${t.title}</span><span class="close-btn" onclick="event.stopPropagation(); closeTab('${t.id}')">×</span>`;
        strip.appendChild(el);
    });
};

window.switchTab = function(id) {
    activeId = id;
    const t = tabs.find(x => x.id === id);
    document.querySelectorAll('.home-dashboard, .view-frame').forEach(el => { el.style.display = 'none'; el.classList.remove('active'); });
    
    const h = document.getElementById('h_' + id);
    const f = document.getElementById('f_' + id);
    const b = document.getElementById('tBar');
    
    if (t.isHome) {
        if(h) h.style.display = 'flex';
        b.value = '';
    } else {
        if(f) { f.style.display = 'block'; f.classList.add('active'); }
        b.value = t.url;
    }
    renderTabs();
};

window.closeTab = function(id) {
    if (tabs.length <= 1) return;
    const idx = tabs.findIndex(x => x.id === id);
    tabs = tabs.filter(x => x.id !== id);
    document.getElementById('h_' + id)?.remove();
    document.getElementById('f_' + id)?.remove();
    if (activeId === id) activeId = tabs[idx > 0 ? idx - 1 : 0].id;
    switchTab(activeId);
};

// Step-by-Step Back Navigation Logic
window.navBack = function() {
    const t = tabs.find(x => x.id === activeId);
    if (!t || t.isHome || t.historyIndex <= 0) return;
    t.historyIndex--;
    t.url = t.history[t.historyIndex];
    document.getElementById('f_' + activeId).src = '/session-route/' + encodeURIComponent(t.url);
    document.getElementById('tBar').value = t.url;
};

// Step-by-Step Forward Navigation Logic
window.navForward = function() {
    const t = tabs.find(x => x.id === activeId);
    if (!t || t.isHome || t.historyIndex >= t.history.length - 1) return;
    t.historyIndex++;
    t.url = t.history[t.historyIndex];
    document.getElementById('f_' + activeId).src = '/session-route/' + encodeURIComponent(t.url);
    document.getElementById('tBar').value = t.url;
};

// Active Viewport Refresh Command Logic
window.refreshTab = function() {
    const t = tabs.find(x => x.id === activeId);
    if (!t || t.isHome || !t.url) return;
    document.getElementById('f_' + activeId).src = '/session-route/' + encodeURIComponent(t.url);
};

window.mount = function(id, forcedUrl = null) {
    const input = document.getElementById('i_' + id);
    let query = forcedUrl || input.value.trim();
    if(!query) return;
    
    let url = query;
    const urlRegEx = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(\/.*)?$/;
    
    if (!forcedUrl && (!urlRegEx.test(url) || url.includes(' '))) {
        url = 'https://duckduckgo.com' + encodeURIComponent(query);
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    const t = tabs.find(x => x.id === id);
    t.url = url;
    t.isHome = false;
    
    // Push the newly verified destination link directly into the structural tracking block
    if (t.historyIndex === -1 || t.history[t.historyIndex] !== url) {
        t.history = t.history.slice(0, t.historyIndex + 1);
        t.history.push(url);
        t.historyIndex++;
    }

    try {
        t.title = new URL(url).hostname.replace('www.', '');
        if(t.title.includes('duckduckgo')) t.title = 'DDG Search';
    } catch(e) { t.title = 'Resource'; }
    
    document.getElementById('h_' + id).style.display = 'none';
    document.getElementById('f_' + id).src = '/session-route/' + encodeURIComponent(url);
    switchTab(id);
};

window.goHome = function() {
    if (!activeId) return;
    const t = tabs.find(x => x.id === activeId);
    t.isHome = true; t.title = 'Blank Tab'; t.url = null;
    document.getElementById('f_' + activeId).src = 'about:blank';
    switchTab(activeId);
};

window.launchTop = function() {
    if (!activeId) return;
    const b = document.getElementById('tBar');
    if (b.value.trim()) mount(activeId, b.value.trim());
};

document.getElementById('tBar').addEventListener('keypress', (e) => { if(e.key==='Enter') launchTop(); });
createTab();
