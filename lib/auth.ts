import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export type JwtPayload = {
  userId: string;
  role: "ADMIN" | "USER";
};

const SECRET = process.env.JWT_SECRET || "";

export function assertSecret() {
  if (!SECRET) throw new Error("JWT_SECRET missing in .env");
}

export function signToken(payload: JwtPayload) {
  assertSecret();
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  assertSecret();
  return jwt.verify(token, SECRET) as JwtPayload;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}
