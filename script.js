const DB_NAME = "PixelPair_Pro_V6";
const STORE_NAME = "neural_catalog";
let model, db, lastSearchResults = [];

// --- THEME ENGINE ---
const themeBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const htmlEl = document.documentElement;

themeBtn.onclick = () => {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    themeIcon.innerText = isDark ? '☀️' : '🌙';
    updateHeatmap(); // Refresh heatmap color
};

// --- SYSTEM BOOT ---
async function startApp() {
    db = await new Promise((res) => {
        const req = indexedDB.open(DB_NAME, 6);
        req.onupgradeneeded = e => {
            const store = e.target.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            store.createIndex("folder", "folder", { unique: false });
        };
        req.onsuccess = e => res(e.target.result);
    });

    model = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1', { fromTFHub: true });
    
    document.getElementById('loading-screen').classList.add('opacity-0', 'pointer-events-none');
    document.getElementById('status-pill').innerText = "Neural Engine Ready";
    updateHealth();
}

// --- FEATURE EXTRACTION ---
async function getFeatures(img) {
    const t0 = performance.now();
    const vector = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(img).resizeBilinear([224, 224]).expandDims(0).toFloat().div(127.5).sub(1);
        const feat = model.predict(tensor);
        return tf.div(feat, tf.norm(feat)).dataSync();
    });
    const color = await extractColor(img);
    document.getElementById('stat-latency').innerText = Math.round(performance.now() - t0) + "ms";
    updateHealth();
    return { vector: Array.from(vector), color };
}

async function extractColor(img) {
    const bias = document.getElementById('focus-slider').value / 100;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 5; canvas.height = 5;
    const s = 100 * (1 - bias/2);
    ctx.drawImage(img, (100-s)/2, (100-s)/2, s, s, 0, 0, 5, 5);
    const d = ctx.getImageData(0,0,5,5).data;
    let r=0, g=0, b=0;
    for(let i=0; i<d.length; i+=4) { r+=d[i]; g+=d[i+1]; b+=d[i+2]; }
    return [r/25, g/25, b/25];
}

// --- HEATMAP ---
function updateHeatmap() {
    const bias = document.getElementById('focus-slider').value;
    const heatmap = document.getElementById('heatmap');
    // Use the CSS variable for accent color to match theme
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    heatmap.style.background = `radial-gradient(circle, ${accentColor} 0%, transparent ${bias}%)`;
}

// --- SEARCH ---
async function search(query) {
    const all = await new Promise(res => {
        db.transaction(STORE_NAME).objectStore(STORE_NAME).getAll().onsuccess = e => res(e.target.result);
    });
    const cWeight = document.getElementById('color-slider').value / 100;
    const sWeight = 1 - cWeight;
    lastSearchResults = all.map(item => {
        let structuralScore = 0;
        for(let i=0; i<query.vector.length; i++) structuralScore += query.vector[i] * item.vector[i];
        const rD = (query.color[0]-item.color[0]), gD = (query.color[1]-item.color[1]), bD = (query.color[2]-item.color[2]);
        const colorScore = Math.max(0, 1 - (Math.sqrt(rD*rD + gD*gD + bD*bD)/441));
        return { ...item, structuralScore, colorScore, total: (structuralScore * sWeight) + (colorScore * cWeight) };
    }).sort((a,b) => b.total - a.total);
    render();
}

// --- INGESTION ---
document.getElementById('folder-input').onchange = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    const folderName = files[0].webkitRelativePath.split('/')[0] || "Session";
    for(let i=0; i<files.length; i++) {
        document.getElementById('status-pill').innerText = `SYNCING: ${i+1}/${files.length}`;
        const bmp = await createImageBitmap(files[i]);
        const { vector, color } = await getFeatures(bmp);
        const reader = new FileReader();
        reader.onload = () => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).add({ vector, color, folder: folderName, image: reader.result });
            if(i === files.length-1) updateHealth();
        };
        reader.readAsDataURL(files[i]);
    }
};

// --- RENDER ---
function render() {
    const threshold = document.getElementById('sim-slider').value / 100;
    const grid = document.getElementById('results-grid');
    const filtered = lastSearchResults.filter(m => m.total >= threshold).slice(0, 16);
    grid.innerHTML = filtered.map(m => `
        <div class="result-card p-4 group" onclick="openAudit(${m.id})">
            <div class="aspect-square rounded-[2rem] overflow-hidden mb-4 theme-panel-inner">
                <img src="${m.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700">
            </div>
            <div class="px-2">
                <div class="flex justify-between items-center mb-2">
                    <span class="text-[9px] font-bold theme-accent-text uppercase tracking-widest truncate max-w-[100px] opacity-70">${m.folder}</span>
                    <span class="text-xs font-mono font-bold">${(m.total * 100).toFixed(1)}%</span>
                </div>
                <div class="h-1 theme-bg rounded-full overflow-hidden">
                    <div class="h-full theme-accent-bg" style="width: ${m.total * 100}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

function openAudit(id) {
    const item = lastSearchResults.find(x => x.id === id);
    document.getElementById('comp-ref-img').src = document.getElementById('search-preview').src;
    document.getElementById('comp-match-img').src = item.image;
    document.getElementById('folder-tag').innerText = `Neural Origin: ${item.folder}`;
    document.getElementById('comparison-modal').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('struct-bar').style.width = `${item.structuralScore * 100}%`;
        document.getElementById('color-bar').style.width = `${item.colorScore * 100}%`;
    }, 100);
}

async function updateHealth() {
    db.transaction(STORE_NAME).objectStore(STORE_NAME).count().onsuccess = e => {
        document.getElementById('db-count').innerText = e.target.result;
    };
    if (navigator.storage && navigator.storage.estimate) {
        const {usage} = await navigator.storage.estimate();
        document.getElementById('stat-memory').innerText = (usage / (1024 * 1024)).toFixed(1) + " MB";
    }
}

async function handleSearch(file) {
    document.getElementById('search-preview').src = URL.createObjectURL(file);
    document.getElementById('preview-container').classList.remove('hidden');
    document.getElementById('drop-prompt').classList.add('opacity-0');
    updateHeatmap();
    const feat = await getFeatures(await createImageBitmap(file));
    search(feat);
}

document.getElementById('drop-zone').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = e => handleSearch(e.target.files[0]);
document.getElementById('sim-slider').oninput = e => { document.getElementById('sim-val').innerText = e.target.value + '%'; render(); };
document.getElementById('color-slider').oninput = e => { document.getElementById('color-val').innerText = e.target.value + '%'; render(); };
document.getElementById('focus-slider').oninput = e => { 
    const v = e.target.value;
    document.getElementById('focus-val').innerText = v > 70 ? 'Core' : (v > 30 ? 'Balanced' : 'Global');
    updateHeatmap();
};
document.getElementById('clear-db').onclick = () => { if(confirm("Wipe index?")) { db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear(); updateHealth(); render(); }};

startApp();