import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function isAdminRole(role?: string) {
  return String(role || "").toLowerCase() === "admin";
}

// GET: public (or logged-in) — returns all courses from DB
export async function GET() {
  try {
    const list = await prisma.course.findMany({
      orderBy: { createdAt: "asc" },
    });

    const courses = list.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      level: c.level,
      category: c.category,
      duration: c.duration,
      modules: c.modules,
      progress: c.progress,
      modulesList: c.modulesList,
      prerequisites: c.prerequisites ?? [],
    }));

    return NextResponse.json({ ok: true, courses });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to load courses" },
      { status: 500 }
    );
  }
}

// PUT: admin only — saves full array
export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ssu_token")?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let payload: any;
  try {
    payload = verifyToken(token);
  } catch {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isAdminRole(payload?.role)) {
    return NextResponse.json(
      { ok: false, message: "Forbidden" },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => null);
  const courses = Array.isArray(body?.courses) ? body.courses : [];

  try {
    await prisma.$transaction(async (tx) => {
      const ids = new Set<string>(courses.map((c: any) => String(c.id)));

      // delete removed
      await tx.course.deleteMany({
        where: { id: { notIn: Array.from(ids) } },
      });

      // upsert all
      for (const c of courses) {
        const id = String(c.id);
        await tx.course.upsert({
          where: { id },
          update: {
            title: String(c.title || ""),
            description: String(c.description || ""),
            level: String(c.level || ""),
            category: String(c.category || ""),
            duration: String(c.duration || ""),
            modules: Number(c.modules || 0),
            progress: Number(c.progress || 0),
            modulesList: c.modulesList ?? [],
            prerequisites: Array.isArray(c.prerequisites)
              ? c.prerequisites.map(String)
              : [],
          },
          create: {
            id,
            title: String(c.title || ""),
            description: String(c.description || ""),
            level: String(c.level || ""),
            category: String(c.category || ""),
            duration: String(c.duration || ""),
            modules: Number(c.modules || 0),
            progress: Number(c.progress || 0),
            modulesList: c.modulesList ?? [],
            prerequisites: Array.isArray(c.prerequisites)
              ? c.prerequisites.map(String)
              : [],
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Failed to save courses" },
      { status: 500 }
    );
  }
}
