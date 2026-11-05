const argon2 = require('argon2');
const crypto = require('crypto');

async function executeHashingTasks() {
    const password = "NucleoBridgeSecurePassword123!";

    console.log("--- Task 1: Hash the same password twice ---");
    const hash1 = await argon2.hash(password);
    const hash2 = await argon2.hash(password);
    console.log("Hash 1: ", hash1);
    console.log("Hash 2: ", hash2);
    console.log("\n");

    console.log("--- Task 2: Time the algorithms ---");
    // Time Argon2id
    const startArgon = performance.now();
    await argon2.hash(password);
    const endArgon = performance.now();
    const argonTime = endArgon - startArgon;
    console.log(`Argon2id hashing time: ${argonTime.toFixed(3)} ms`);

    // Time SHA-256
    const startSha = performance.now();
    crypto.createHash('sha256').update(password).digest('hex');
    const endSha = performance.now();
    const shaTime = endSha - startSha;
    console.log(`SHA-256 hashing time: ${shaTime.toFixed(3)} ms`);
}

executeHashingTasks();