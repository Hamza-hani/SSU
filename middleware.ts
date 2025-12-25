import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("ssu_token")?.value;
  const url = req.nextUrl;

  const isAdminRoute = url.pathname.startsWith("/admin");

  if (!isAdminRoute) return NextResponse.next();

  if (!token) return NextResponse.redirect(new URL("/", req.url));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== "ADMIN") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
