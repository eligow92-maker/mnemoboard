import { prisma } from "@/lib/db";

// Czyści dane plansz (kaskadowo: strefy, karteczki, połączenia, sesje, wyniki).
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe("TRUNCATE TABLE board CASCADE");
}
