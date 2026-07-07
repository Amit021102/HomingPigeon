import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import pasteStorage from './storage.js';
import { generateUniqueId } from './ids.js';

const app = express();
const PORT = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// --- BACKGROUND GARBAGE COLLECTOR SERVICE ---
// Sweeps memory every 60 seconds to clear expired pastes before they clog RAM
setInterval(() => {
    const now = Date.now();
    let purgeCount = 0;

    const allPastes = pasteStorage.getAll();

    for (const paste of allPastes) {
        if (paste.expiresAt && now > paste.expiresAt) {
            pasteStorage.delete(paste.id);
            purgeCount++;
        }
    }

    if (purgeCount > 0) {
        console.log(`[GC Service] Sweeper cleaned up ${purgeCount} expired pastes.`);
    }
}, 60000);



app.post('/api/pastes', (req, res) => {
    const { title, category, content, syntax, expiration, isBurn } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content field is required." });
    }

    const uniqueId = generateUniqueId(pasteStorage);
    const now = Date.now();
    let expiresAt = null;

    // Calculate future unix timestamp based on selection
    if (!isBurn && expiration && expiration !== 'never') {
        const durationMap = {
            '1m': 60 * 1000,                // 1 minute
            '1h': 60 * 60 * 1000,           // 1 hour
            '1d': 24 * 60 * 60 * 1000,      // 1 day
            '1w': 7 * 24 * 60 * 60 * 1000,  // 1 week
            '1M': 30 * 24 * 60 * 60 * 1000, // 1 month
            '1y': 365 * 24 * 60 * 60 * 1000 // 1 year
        };
        if (durationMap[expiration]) {
            expiresAt = now + durationMap[expiration];
        }
    }

    // Save metadata package
    pasteStorage.set(uniqueId, {
        title: title || "Untitled Paste",
        category: category || "General",
        content,
        syntax: syntax || "plaintext",
        isBurn: !!isBurn,
        createdAt: now,
        expiresAt
    });

    console.log(`Created Paste [${uniqueId}] - Burn Mode: ${!!isBurn}, Expires: ${expiresAt ? new Date(expiresAt).toISOString() : 'Never'}`);
    res.status(201).json({ id: uniqueId });
});

app.get('/api/pastes/:id', (req, res) => {
    const requestedId = req.params.id;
    const paste = pasteStorage.get(requestedId);

    if (!paste) {
        return res.status(404).json({ error: "Paste not found." });
    }

    // Active Expiration Check (On-Call protection)
    if (paste.expiresAt && Date.now() > paste.expiresAt) {
        pasteStorage.delete(requestedId); // Clean up expired paste immediately
        return res.status(404).json({ error: "Paste has expired." });
    }

    // Clone the metadata payload before modifying storage state
    const payload = { ...paste };

    // Burn After Read Trigger
    if (paste.isBurn) {
        console.log(`[Burn-On-Read] Paste [${requestedId}] consumed. Deleting metadata package...`);
        pasteStorage.delete(requestedId); // Wiped from server memory permanently
    }

    res.json(payload);
});

app.get('/:id', (req, res, next) => {
    // If the URL looks like an internal API call or a file asset (like a favicon), skip it
    if (req.params.id.startsWith('api') || !req.params.id.match(/^[a-zA-Z0-9]+$/)) {
        return next();
    }
    const paste = pasteStorage.get(req.params.id);
    // If the paste is set to burn, and they haven't added '?confirmed=true' to their URL
    if (paste && paste.isBurn && req.query.confirmed !== 'true') {
        return res.sendFile(path.join(__dirname, '../frontend', 'warning.html'));
    }

    // Otherwise, send our paste viewer page
    res.sendFile(path.join(__dirname, '../frontend', 'view.html'));
});

app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  🐦 HomingPigeon is flying high and ready!`);
    console.log(`  🚀 Local Application URL: http://localhost:${PORT}`);
    console.log(`==================================================\n`);
});