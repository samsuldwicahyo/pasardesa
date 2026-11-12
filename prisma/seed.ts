import "dotenv/config";
import { UserRole } from "@prisma/client";
import { db } from "../src/lib/db";
import { hashPassword } from "../src/modules/auth/service";

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length < 12) {
    throw new Error("Set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD (at least 12 characters) before seeding.");
  }
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== UserRole.SUPER_ADMIN) throw new Error("The bootstrap email belongs to a different role.");
    console.log("Super admin already exists; credentials were not changed.");
    return;
  }
  await db.user.create({ data: {
    email, name: "Super Admin", passwordHash: await hashPassword(password),
    role: UserRole.SUPER_ADMIN, isActive: true, mustChangePassword: true,
  } });
  console.log("Super admin created. Sign in with the credentials configured locally.");
}

main().catch(() => {
  console.error("Bootstrap failed. Check local configuration and database access.");
  process.exitCode = 1;
}).finally(() => db.$disconnect());
