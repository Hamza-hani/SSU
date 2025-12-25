import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { courses as seedCourses } from "../data/courses";

const prisma = new PrismaClient();

async function main() {
  // 1) Admin upsert
  const email = "admin@ssu.local".toLowerCase();
  const password = "admin123";

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      role: "ADMIN",
    },
    create: {
      name: "Admin",
      email,
      password: hashed,
      role: "ADMIN",
    },
  });

  console.log("✅ Admin ensured:", email, "/", password);

  // 2) Courses upsert
  let created = 0;
  let updated = 0;

  for (const c of seedCourses as any[]) {
    const id = String(c.id);

    const existing = await prisma.course.findUnique({ where: { id } });

    if (!existing) {
      await prisma.course.create({
        data: {
          id,
          title: String(c.title || ""),
          description: String(c.description || ""),
          level: String(c.level || ""),
          category: String(c.category || ""),
          duration: String(c.duration || ""),
          modules: Number(c.modules || (c.modulesList?.length || 0)),
          progress: Number(c.progress || 0),
          modulesList: (c.modulesList ?? []) as any,
          prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites.map(String) : [],
        },
      });
      created++;
    } else {
      await prisma.course.update({
        where: { id },
        data: {
          title: String(c.title || ""),
          description: String(c.description || ""),
          level: String(c.level || ""),
          category: String(c.category || ""),
          duration: String(c.duration || ""),
          modules: Number(c.modules || (c.modulesList?.length || 0)),
          progress: Number(c.progress || 0),
          modulesList: (c.modulesList ?? []) as any,
          prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites.map(String) : [],
        },
      });
      updated++;
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
