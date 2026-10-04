import { withApi } from "@/lib/api";
import { readBackupFile, restoreBackup } from "@/modules/transfer/service";

// ?dryRun=true tylko zapowiada, co zostałoby dodane (podstawa potwierdzenia w interfejsie).
export const POST = withApi({}, async ({ request }) => {
  const dryRun = new URL(request.url).searchParams.get("dryRun") === "true";
  return Response.json(await restoreBackup(await readBackupFile(request), { dryRun }));
});
