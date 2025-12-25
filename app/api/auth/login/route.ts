import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, normalizeRole } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: String(email || "").trim().toLowerCase() },
  });

  if (!user) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const ok = await verifyPassword(String(password || ""), user.password);
  if (!ok) {
    return NextResponse.json(
      { ok: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const role = normalizeRole(user.role);
  const token = await signToken({ userId: user.id, role });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role },
  });

  res.cookies.set("ssu_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
