import request from 'supertest';
import app from './server.js';
import pasteStorage from './storage.js';

describe('HomingPigeon API Integration Tests', () => {
    
    // Keep an array of all IDs created during this test execution
    let createdPasteIds = [];

    // Clean up only our created pastes after ALL tests are finished
    afterAll(async () => {
        // 1. Loop through and delete only the junk pastes we generated
        for (const id of createdPasteIds) {
            try {
                await pasteStorage.delete(id); 
            } catch (err) {
                console.error(`Failed to clean up paste ${id}:`, err);
            }
        }
    });

    // 1. ID Generator Check via API
    test('POST /api/pastes should generate a valid unique short ID', async () => {
        const response = await request(app)
            .post('/api/pastes')
            .send({ content: 'console.log("Hello World");', syntax: 'javascript', isBurn: false });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toHaveLength(8);

        createdPasteIds.push(response.body.id);
    });

    // 2. Verification of returned payload matching input
    test('POST then GET should return the identical paste object data', async () => {
        const testPaste = { content: 'print("Hello")', syntax: 'python', isBurn: false};
        
        const createResponse = await request(app).post('/api/pastes').send(testPaste);
        const pasteId = createResponse.body.id;

        createdPasteIds.push(pasteId);

        const getResponse = await request(app).get(`/api/pastes/${pasteId}`);
        
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.content).toBe(testPaste.content);
        expect(getResponse.body.syntax).toBe(testPaste.syntax);
    });

    // 3. Accessing invalid short/malformed ID strings
    test('GET /api/pastes/:id with an invalid ID length should return 404 or 400', async () => {
        const response = await request(app).get('/api/pastes/abc12'); // 5 characters
        expect(response.status).toBe(404);
    });

    // 4. Create, explicitly remove via API, and try to revisit
    test('DELETE /api/pastes/:id should remove the paste and prevent subsequent access', async () => {
        const createResponse = await request(app)
            .post('/api/pastes')
            .send({ content: 'Temporary text to be deleted', syntax: 'plaintext', type: 'standard' });
        const pasteId = createResponse.body.id;
        
        // Track it just in case the delete fails so afterAll catches it
        createdPasteIds.push(pasteId); 

        // 1. Actively delete it using your new endpoint
        const deleteResponse = await request(app).delete(`/api/pastes/${pasteId}`);
        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body.message).toBe('Paste successfully removed');

        // 2. Try to revisit it right after and expect a 404
        const getResponse = await request(app).get(`/api/pastes/${pasteId}`);
        expect(getResponse.status).toBe(404);
    });

    // 5. Creating Burn-After-Read, viewing it once, then checking it's destroyed
    test('Burn-after-read paste should be accessible exactly once', async () => {
        const createResponse = await request(app)
            .post('/api/pastes')
            .send({ content: 'This will self destruct', syntax: 'plaintext', isBurn: true });
        const pasteId = createResponse.body.id;
        createdPasteIds.push(pasteId);
        // First read (Allowed - prints warning on frontend but gives the payload)
        const firstRead = await request(app).get(`/api/pastes/${pasteId}`);
        expect(firstRead.status).toBe(200);
        expect(firstRead.body.content).toBe('This will self destruct');

        // Second read (Destroyed - must return 404)
        const secondRead = await request(app).get(`/api/pastes/${pasteId}`);
        expect(secondRead.status).toBe(404);
    });
});