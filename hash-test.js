import argon2 from 'argon2';
import crypto from 'crypto';

async function executeHashingTasks() {
    const password = "NucleoBridgeSecurePassword123!";

    console.log("--- Task 1: Hash the same password twice ---");
    const hash1 = await argon2.hash(password);
    const hash2 = await argon2.hash(password);
    console.log("Hash 1: ", hash1);
    console.log("Hash 2: ", hash2);

    console.log("\n--- Task 2 & 3: Timings and Guesses Per Second ---");

    // Time Argon2
    const startArgon = performance.now();
    await argon2.hash(password);
    const endArgon = performance.now();
    const argonTime = endArgon - startArgon;

    // Time SHA-256
    const startSha = performance.now();
    crypto.createHash('sha256').update(password).digest('hex');
    const endSha = performance.now();
    const shaTime = endSha - startSha;

    console.log(`Argon2id hashing time: ${argonTime.toFixed(3)} ms`);
    console.log(`SHA-256 hashing time: ${shaTime.toFixed(3)} ms\n`);

    // Task 3: Calculate guesses per second (1 second = 1000 ms)
    const argonGuesses = 1000 / argonTime;
    console.log(`Argon2id guesses per second: ${Math.round(argonGuesses).toLocaleString()}`);

    // Handle extremely fast SHA-256 execution times safely
    if (shaTime > 0) {
        const shaGuesses = 1000 / shaTime;
        console.log(`SHA-256 guesses per second: ${Math.round(shaGuesses).toLocaleString()}`);
    } else {
        console.log(`SHA-256 guesses per second: Too fast to measure (Millions+)`);
    }
}

executeHashingTasks();