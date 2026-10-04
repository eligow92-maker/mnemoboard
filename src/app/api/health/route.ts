import { ApiError, withApi } from "@/lib/api";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    throw new ApiError(503, "SERVICE_UNAVAILABLE", "Baza danych jest niedostępna");
  }
  return Response.json({ status: "ok" });
});
