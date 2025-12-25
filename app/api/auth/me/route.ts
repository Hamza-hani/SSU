import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth"; // ✅ add this in lib/auth

export async function GET() {
  // ✅ Next 15: cookies() ko await karo
  const cookieStore = await cookies();
  const token = cookieStore.get("ssu_token")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const payload = verifyToken(token) as { userId: string; role?: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // ✅ frontend ko normalized role do
    const role = String(user.role || "").toLowerCase() === "admin" ? "admin" : "user";

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email, role } },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
