import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET env var");
  return encoder.encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashed: string) {
  return bcrypt.compare(password, hashed);
}

export function normalizeRole(role: unknown): "admin" | "user" {
  return String(role || "").toUpperCase() === "ADMIN" ? "admin" : "user";
}

export async function signToken(payload: { userId: string; role: "admin" | "user" }) {
  const secret = getJwtSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string) {
  const secret = getJwtSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload; // { userId, role, iat, exp }
}
