import { randomInt } from "node:crypto";

import { compare, hash } from "bcryptjs";

const PASSWORD_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export function generateTemporaryPassword() {
  let password = "PD-";

  for (let index = 0; index < 10; index += 1) {
    password += PASSWORD_ALPHABET[randomInt(0, PASSWORD_ALPHABET.length)];
  }

  return `${password}!7`;
}
