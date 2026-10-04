import { uuidParam, withApi } from "@/lib/api";
import { exportBoard } from "@/modules/transfer/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async ({ params }) => {
  const { file, fileName } = await exportBoard(uuidParam(params, "boardId"));
  return Response.json(file, {
    headers: { "content-disposition": `attachment; filename="${fileName}"` },
  });
});
