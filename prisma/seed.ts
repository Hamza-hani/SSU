import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
