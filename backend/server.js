import express from 'express';
import { generateShortId } from './ids.js';
const app = express();
const PORT = 3000;
// 1. Load the Express module
// const express = require('express');
// const { generateShortId } = require('./ids');


// 2. MIDDLEWARE: Teach our server how to read incoming data payloads
// express.json() intercepts incoming requests with a 'Content-Type: application/json' header 
// and automatically parses the body into a readable JavaScript object (req.body).
app.use(express.json());

// 3. IN-MEMORY STORAGE: A basic JS object to store our pastes temporarily while we are database-free
const pasteStorage = {};

// 4. THE POST ROUTE: Receives text content from the user and assigns a placeholder short string
app.post('/api/pastes', (req, res) => {
    // Extract the 'content' field from the parsed request body
    const { content } = req.body;

    // Validation guardrail: Ensure the user didn't send an empty paste
    if (!content) {
        return res.status(400).json({ error: "Content field is required." });
    }

    // // For our absolute basic version, let's use a hardcoded short string key to verify the flow works
    // const dummyId = "pigeon1";

    const pasteId = generateShortId();
    
    // Save the text content into our memory storage mapping it to our key
    pasteStorage[pasteId] = content;

    console.log(`Saved new paste under ID: ${pasteId}`);

    // Respond back to the client with a 201 Created status and the ID
    res.status(201).json({ id: pasteId });
});

// 5. THE GET ROUTE: Looks up a paste by its specific ID parameter in the URL
app.get('/api/pastes/:id', (req, res) => {
    // req.params.id extracts the ':id' variable directly out of the request URL string
    const requestedId = req.params.id;
    
    // Look up the value matching that key in our memory object
    const savedContent = pasteStorage[requestedId];

    // Safety check: If the key doesn't exist in our memory, send a 404 error
    if (!savedContent) {
        return res.status(404).json({ error: "Paste not found." });
    }

    // Send the raw text back to the client with a default 200 OK status
    res.send(savedContent);
});

// 6. Ignition switch to boot up the server
app.listen(PORT, () => {
    console.log(`HomingPigeon backend engine actively listening on http://localhost:${PORT}`);
});