const LOWER = "abcdefghijkmnopqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBER = "23456789";
const SYMBOL = "!@#$%&*?";

const ALL = LOWER + UPPER + NUMBER + SYMBOL;

export function generatePassword(length = 16): string {
  let password = "";

  password += LOWER[Math.floor(Math.random() * LOWER.length)];
  password += UPPER[Math.floor(Math.random() * UPPER.length)];
  password += NUMBER[Math.floor(Math.random() * NUMBER.length)];
  password += SYMBOL[Math.floor(Math.random() * SYMBOL.length)];

  while (password.length < length) {
    password += ALL[Math.floor(Math.random() * ALL.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
