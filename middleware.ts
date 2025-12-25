import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const encoder = new TextEncoder();

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  return encoder.encode(secret);
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminRoute = url.pathname.startsWith("/admin");

  if (!isAdminRoute) return NextResponse.next();

  const token = req.cookies.get("ssu_token")?.value;
  if (!token) return NextResponse.redirect(new URL("/", req.url));

  const secret = getSecret();
  if (!secret) return NextResponse.redirect(new URL("/", req.url));

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = String((payload as any)?.role || "").toLowerCase();

    // ✅ token stores normalized role: "admin" | "user"
    if (role !== "admin") return NextResponse.redirect(new URL("/", req.url));

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
