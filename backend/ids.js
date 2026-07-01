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