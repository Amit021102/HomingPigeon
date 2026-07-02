const ID_LENGTH = 8;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateShortId() {
    let result = '';
    for (let i = 0; i < ID_LENGTH; i++) {
        // Pick a random index from the 62 available characters
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }
    return result;
}

/**
 * Generates an 8-character Base62 string that is guaranteed unique within the provided store.
 * @param {Object} storage - The pasteStorage object reference
 */
export function generateUniqueId(storage) {
    let uniqueId = generateShortId();

    // Loop executes if a matching key is found, ensuring 100% collision resistance
    while (storage.hasOwnProperty(uniqueId)) {
        // console.warn(`Collision detected for ID: ${uniqueId}. Regenerating...`);
        uniqueId = generateShortId();
    }

    return uniqueId;
}