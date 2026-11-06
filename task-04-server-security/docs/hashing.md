# Password Hashing Experiment

## Task 1: Hashing the Same Password Twice

The same password was hashed twice using Argon2id.

- **First hash:** $argon2id$v=19$m=65536,t=3,p=4$1qRZlU4mxny7tZ62xiMfnw$1ry2lqoYvv8j+ksT5G9po+CAPe8HthKLhgVRHEmW7OQ

- **Second hash:** $argon2id$v=19$m=65536,t=3,p=4$oXwTLLWxD1zxNCKLQTYUAA$MSILqM6ZsqCgzFWJOq4WKN9XcY5HF8kF+SnLMMPPv3w

**Observation:** The two outputs differ because Argon2id generates a unique random salt for each hashing operation, even when the input password is identical.

## Task 2: Algorithm Timings

The time required to hash the same password using each algorithm was measured on my machine.

| Algorithm | Hashing Time |
|---|---:|
| Argon2id | 153.720 ms |
| SHA-256 | 0.892 ms |

## Task 3: Guesses Per Second

To estimate how many password guesses an attacker can make per second, divide 1,000 milliseconds (one second) by the time required to compute one hash.

### Argon2id

**Calculation:**

1,000 ms / 153.720 ms = 6.505 guesses per second

**Result:** Approximately 7 guesses per second.

### SHA-256

**Calculation:**

1,000 ms / 0.892 ms = 1,121.076 guesses per second

**Result:** Approximately 1,121 guesses per second.

**Note:** SHA-256 is designed for speed. On dedicated GPU cracking hardware, its guessing rate can scale into the billions of guesses per second, depending on the hardware and implementation.

## Salting Mechanics

### What Salting Does

Salting involves adding a randomly generated string of characters to a password before hashing it. This ensures that identical passwords produce different hashes when different salts are used.

### Does Argon2id Handle Salting Automatically?

Yes. Argon2id implementations generate a random salt automatically when one is not explicitly supplied. The salt is stored as part of the resulting encoded hash string, allowing it to be retrieved during password verification.

### What Happens If Salting Is Skipped?

Without unique salts, identical passwords produce identical hashes. This allows attackers to identify users sharing the same password and makes precomputed hash databases, such as rainbow tables, more effective.

Unique salts prevent attackers from directly reusing precomputed hash tables across users and require them to perform separate cracking computations for each salted password.