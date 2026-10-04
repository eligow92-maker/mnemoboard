import { withApi } from "@/lib/api";
import { buildBackup } from "@/modules/transfer/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => {
  const { file, fileName } = await buildBackup();
  return Response.json(file, {
    headers: { "content-disposition": `attachment; filename="${fileName}"` },
  });
});
