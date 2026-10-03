import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

// Przed całym przebiegiem testów: tworzy testową bazę (jeśli jej nie ma) i wykonuje na niej migracje.
export default async function setup(): Promise<void> {
  const testUrl = process.env.DATABASE_URL_TEST;
  if (!testUrl) {
    throw new Error("Brak DATABASE_URL_TEST — testy integracyjne wymagają testowej bazy.");
  }

  const adminUrl = new URL(testUrl);
  const databaseName = adminUrl.pathname.slice(1);
  adminUrl.pathname = "/postgres";

  const admin = new PrismaClient({ datasourceUrl: adminUrl.toString() });
  try {
    const existing = await admin.$queryRaw<unknown[]>`
      SELECT 1 FROM pg_database WHERE datname = ${databaseName}
    `;
    if (existing.length === 0) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`);
    }
  } finally {
    await admin.$disconnect();
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: testUrl },
    stdio: "inherit",
  });
}
