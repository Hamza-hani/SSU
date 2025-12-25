import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses as seedCourses } from "../data/courses";

const prisma = new PrismaClient();

async function main() {
  // =========================
  // 1) Admin seed
  // =========================
  const email = "admin@ssu.local".toLowerCase();
  const password = "admin123";

  const exists = await prisma.user.findUnique({ where: { email } });

  if (!exists) {
    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Admin",
        email,
        password: hashed,
        role: "ADMIN",
      },
    });

    console.log("✅ Admin created:", email, "/", password);
  } else {
    console.log("ℹ️ Admin already exists:", email);
  }

  // =========================
  // 2) Courses seed (upsert)
  // =========================
  // NOTE:
  // - This will keep DB courses in-sync with your seedCourses
  // - It does NOT delete extra DB courses (safer).
  //   If you want exact mirror (delete removed), tell me and I’ll switch to transaction+deleteMany.

  const list = Array.isArray(seedCourses) ? seedCourses : [];

  let created = 0;
  let updated = 0;

  for (const c of list as any[]) {
    const id = String(c.id);

    const payload = {
      id,
      title: String(c.title || ""),
      description: String(c.description || ""),
      level: String(c.level || ""),
      category: String(c.category || ""),
      duration: String(c.duration || ""),
      modules: Number(
        typeof c.modules === "number"
          ? c.modules
          : Array.isArray(c.modulesList)
          ? c.modulesList.length
          : 0
      ),
      progress: Number(c.progress || 0),
      modulesList: Array.isArray(c.modulesList) ? c.modulesList : [],
      prerequisites: Array.isArray(c.prerequisites)
        ? c.prerequisites.map(String)
        : [],
    };

    // Some schemas may not have prerequisites column; handle gracefully
    // by trying with prerequisites first, and retrying without it if Prisma throws.
    try {
      const existing = await prisma.course.findUnique({ where: { id } });
      await prisma.course.upsert({
        where: { id },
        update: payload,
        create: payload,
      });

      if (existing) updated++;
      else created++;
    } catch (err: any) {
      // Retry without prerequisites (in case column doesn't exist in schema)
      const { prerequisites, ...withoutPrereq } = payload as any;

      const existing = await prisma.course.findUnique({ where: { id } });
      await prisma.course.upsert({
        where: { id },
        update: withoutPrereq,
        create: withoutPrereq,
      });

      if (existing) updated++;
      else created++;
    }
  }

  console.log(`✅ Courses seeded: created=${created}, updated=${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
