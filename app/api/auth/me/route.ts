import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken, normalizeRole } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ssu_token")?.value;

  if (!token) return NextResponse.json({ user: null }, { status: 200 });

  try {
    const payload = (await verifyToken(token)) as { userId?: string; role?: string };
    if (!payload?.userId) return NextResponse.json({ user: null }, { status: 200 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return NextResponse.json({ user: null }, { status: 200 });

    const role = normalizeRole(user.role);
    return NextResponse.json({ user: { ...user, role } }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
