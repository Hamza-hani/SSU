import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, normalizeRole } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, message: "Password too short" },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
      select: { id: true, name: true, email: true, role: true },
    });

    const role = normalizeRole(user.role);
    const token = await signToken({ userId: user.id, role });

    const res = NextResponse.json({ ok: true, user: { ...user, role } });

    res.cookies.set("ssu_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        { ok: false, message: "Email already exists" },
        { status: 409 }
      );
    }
    console.error("SIGNUP_ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Server error during signup." },
      { status: 500 }
    );
  }
}
