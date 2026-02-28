const DB_NAME = "PixelPair_DB";
const STORE_NAME = "vectors";

// 1. Database Initialization
async function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        };
        request.onsuccess = () => resolve(request.result);
    });
}

// 2. Index a New Product Locally
async function indexImage(imageElement, label) {
    const vector = await extractFeatures(imageElement);
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    
    // Store image as Blob or base64 for offline use
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    canvas.getContext('2d').drawImage(imageElement, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

    store.add({ vector, label, url: dataUrl, timestamp: Date.now() });
    updateLocalCount();
}

// 3. The Search Engine
async function performSearch(queryVector) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const allRecords = await new Promise(res => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result);
    });

    const matches = allRecords.map(record => {
        const score = dotProduct(queryVector, record.vector);
        return { ...record, score };
    }).sort((a, b) => b.score - a.score).slice(0, 12);

    renderMatches(matches);
}