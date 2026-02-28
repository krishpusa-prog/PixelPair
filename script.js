// --- 1. GLOBAL VARIABLES ---
const DB_NAME = "PixelPair_Storage";
const STORE_NAME = "catalog";
let model, db, lastSearchResults = [];

// --- 2. INITIALIZATION (The Setup) ---
async function startApp() {
    try {
        // Open IndexedDB (The Memory)
        db = await new Promise((res, rej) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = e => e.target.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
            req.onsuccess = e => res(e.target.result);
            req.onerror = rej;
        });

        // Load TensorFlow Model (The Brain)
        model = await tf.loadGraphModel('https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v3_small_100_224/feature_vector/5/default/1', { fromTFHub: true });
        
        // UI Updates
        document.getElementById('loading-screen').classList.add('opacity-0', 'pointer-events-none');
        const pill = document.getElementById('status-pill');
        pill.innerText = "Engine Active";
        pill.classList.add('status-active');
        
        updateLibraryCount();
    } catch (err) {
        console.error("Initialization Failed:", err);
        alert("Please ensure you have an internet connection for the initial load.");
    }
}

// --- 3. AI FEATURE EXTRACTION (The Translator) ---
async function getVector(imgSource) {
    if (!model) return null;
    return tf.tidy(() => {
        const tensor = tf.browser.fromPixels(imgSource)
            .resizeBilinear([224, 224])
            .expandDims(0).toFloat().div(127.5).sub(1);
        const feat = model.predict(tensor);
        return tf.div(feat, tf.norm(feat)).dataSync(); // Normalized Vector
    });
}

// --- 4. THE SEARCH ENGINE (The Judge) ---
async function conductSearch(queryVector) {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const allItems = await new Promise(res => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result);
    });

    if (allItems.length === 0) return;

    // Calculate Dot Product Similarity
    lastSearchResults = allItems.map(item => {
        let score = 0;
        for (let i = 0; i < queryVector.length; i++) {
            score += queryVector[i] * item.vector[i];
        }
        return { ...item, score };
    }).sort((a, b) => b.score - a.score);

    renderResults();
}

// --- 5. BATCH IMPORT (Catalog Feeding) ---
document.getElementById('folder-input').onchange = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    const pill = document.getElementById('status-pill');
    
    for (let i = 0; i < files.length; i++) {
        pill.innerText = `Indexing ${i+1}/${files.length}`;
        const file = files[i];
        const bitmap = await createImageBitmap(file);
        
        const canvas = document.createElement('canvas');
        canvas.width = 224; canvas.height = 224;
        canvas.getContext('2d').drawImage(bitmap, 0, 0, 224, 224);
        
        const vector = await getVector(canvas);
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).add({
            fileName: file.name,
            vector: Array.from(vector),
            image: canvas.toDataURL('image/jpeg', 0.6)
        });
    }
    pill.innerText = "Engine Active";
    updateLibraryCount();
};

// --- 6. UI RENDERERS ---
function renderResults() {
    const grid = document.getElementById('results-grid');
    const threshold = document.getElementById('threshold-slider').value / 100;
    
    const filtered = lastSearchResults.filter(m => m.score >= threshold).slice(0, 12);

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-300 italic">No matches found above ${Math.round(threshold*100)}%</div>`;
        return;
    }

    grid.innerHTML = filtered.map(m => `
        <div class="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all cursor-pointer" onclick="openLightbox('${m.image}', '${m.fileName}', ${m.score})">
            <div class="h-48 overflow-hidden bg-slate-100 relative">
                <img src="${m.image}" class="w-full h-full object-cover group-hover:scale-110 transition-duration-500">
                <div class="absolute top-2 right-2 bg-black/50 text-white text-[9px] px-2 py-1 rounded-full backdrop-blur-sm">Math Score: ${m.score.toFixed(4)}</div>
            </div>
            <div class="p-5 space-y-3">
                <div class="flex justify-between items-end">
                    <p class="text-[10px] font-black text-indigo-500 uppercase tracking-tighter">Similarity</p>
                    <p class="text-lg font-black text-slate-800">${(m.score * 100).toFixed(1)}%</p>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full" style="width: ${m.score * 100}%"></div>
                </div>
            </div>
        </div>
    `).join('');
}

// --- 7. UTILITIES & EVENTS ---
function openLightbox(src, name, score) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').innerText = `${name} (${(score*100).toFixed(2)}% Match)`;
    lb.classList.remove('hidden');
}

document.getElementById('lightbox').onclick = () => document.getElementById('lightbox').classList.add('hidden');

const updateLibraryCount = () => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).count();
    req.onsuccess = () => document.getElementById('db-count').innerText = req.result;
};

// Handle Drop/Upload
const zone = document.getElementById('drop-zone');
['dragover', 'drop'].forEach(name => zone.addEventListener(name, e => {
    e.preventDefault();
    zone.classList.toggle('drag-over', name === 'dragover');
    if (name === 'drop') handleSearchFile(e.dataTransfer.files[0]);
}));

zone.onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = e => handleSearchFile(e.target.files[0]);

async function handleSearchFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const preview = document.getElementById('search-preview');
    preview.src = url; preview.classList.remove('hidden');
    document.getElementById('drop-prompt').classList.add('opacity-0');
    
    const img = new Image();
    img.src = url;
    img.onload = async () => {
        const vec = await getVector(img);
        if(vec) conductSearch(vec);
    };
}

document.getElementById('threshold-slider').oninput = (e) => {
    document.getElementById('threshold-value').innerText = `${e.target.value}% Match`;
    renderResults();
};

document.getElementById('clear-db').onclick = () => {
    if(confirm("Wipe all local image data?")) {
        db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear();
        updateLibraryCount();
        lastSearchResults = [];
        renderResults();
    }
};

startApp();