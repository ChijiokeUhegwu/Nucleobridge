import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
  hash as argon2Hash,
  parseOptions,
  verify as argon2Verify,
  type Options,
} from '@node-rs/argon2';

const ARGON2ID_ALGORITHM = 2;
const ARGON2_VERSION_13 = 1;
const ARGON2_MEMORY_COST_KIB = 19456;
const ARGON2_TIME_COST = 2;
const ARGON2_PARALLELISM = 1;
const ARGON2_OUTPUT_LEN = 32;

const ARGON2ID_OPTIONS: Options = {
  algorithm: ARGON2ID_ALGORITHM,
  memoryCost: ARGON2_MEMORY_COST_KIB,
  timeCost: ARGON2_TIME_COST,
  parallelism: ARGON2_PARALLELISM,
  outputLen: ARGON2_OUTPUT_LEN,
};

function isBcryptHash(hash: string): boolean {
  return /^\$2[abxy]?\$/.test(hash);
}

function isArgon2Hash(hash: string): boolean {
  return /^\$argon2(id|i|d)\$/.test(hash);
}

/**
 * Hashes a plaintext password using Argon2id.
 */
export async function hashPassword(password: string): Promise<string> {
  return argon2Hash(password, ARGON2ID_OPTIONS);
}

/**
 * Verifies a plaintext password against a stored Argon2id or legacy bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isBcryptHash(hash)) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return false;
    }
  }

  if (!isArgon2Hash(hash)) {
    return false;
  }

  try {
    return await argon2Verify(hash, password);
  } catch {
    return false;
  }
}

/**
 * Reports whether a stored hash should be replaced after a successful login.
 */
export function needsPasswordRehash(hash: string): boolean {
  if (!hash.startsWith('$argon2id$')) {
    return true;
  }

  try {
    const parsed = parseOptions(hash);
    return (
      parsed.algorithm !== ARGON2ID_ALGORITHM ||
      parsed.version !== ARGON2_VERSION_13 ||
      parsed.memoryCost < ARGON2_MEMORY_COST_KIB ||
      parsed.timeCost < ARGON2_TIME_COST ||
      parsed.parallelism !== ARGON2_PARALLELISM ||
      parsed.outputLen < ARGON2_OUTPUT_LEN
    );
  } catch {
    return true;
  }
}

/**
 * Generates a random 6-digit numeric OTP code.
 */
export function generateOtpCode(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Computes a SHA-256 hash of a string (used for storing OTP and token hashes).
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Generates a secure URL-safe random token for password resets.
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

