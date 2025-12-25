import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = (body?.name || body?.fullName || "").trim();
    const email = (body?.email || "").trim().toLowerCase();
    const password = body?.password || "";
    const confirmPassword = body?.confirmPassword || "";

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: "Name, email and password are required." },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { ok: false, message: "Passwords do not match." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { ok: false, message: "Email already exists." },
        { status: 409 }
      );
    }

    const hashed = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
      select: { id: true, name: true, email: true, role: true },
    });

    const token = signToken({ userId: user.id, role: user.role });

    const res = NextResponse.json({ ok: true, user }, { status: 201 });

    // ✅ same cookie name everywhere
    res.cookies.set("ssu_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    // Prisma unique constraint safety
    if (err?.code === "P2002") {
      return NextResponse.json(
        { ok: false, message: "Email already exists." },
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
