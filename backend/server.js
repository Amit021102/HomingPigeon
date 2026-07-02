import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import pasteStorage from './storage.js';
import { generateUniqueId } from './ids.js';

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/api/pastes', (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: "Content field is required." });
    }

    const pasteId = generateUniqueId(pasteStorage);
    pasteStorage[pasteId] = content;

    console.log(`Saved new paste under ID: ${pasteId}`);

    res.status(201).json({ id: pasteId });
});

app.get('/api/pastes/:id', (req, res) => {
    const requestedId = req.params.id;
    const savedContent = pasteStorage[requestedId];

    if (!savedContent) {
        return res.status(404).json({ error: "Paste not found." });
    }

    res.send(savedContent);
});

app.get('/:id', (req, res, next) => {
    // If the URL looks like an internal API call or a file asset (like a favicon), skip it
    if (req.params.id.startsWith('api') || !req.params.id.match(/^[a-zA-Z0-9]+$/)) {
        return next();
    }
    // Otherwise, send our paste viewer page
    res.sendFile(path.join(__dirname, '../frontend', 'view.html'));
});

app.listen(PORT, () => {
    console.log(`HomingPigeon backend engine actively listening on http://localhost:${PORT}`);
});