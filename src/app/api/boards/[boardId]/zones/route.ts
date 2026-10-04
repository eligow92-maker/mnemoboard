import { uuidParam, withApi } from "@/lib/api";
import { zoneCreateSchema } from "@/modules/arrangement/schema";
import { createZone } from "@/modules/arrangement/zone-service";
import { requireBoard } from "@/modules/boards/service";

export const POST = withApi({ body: zoneCreateSchema }, async ({ params, body }) => {
  const board = await requireBoard(uuidParam(params, "boardId"));
  return Response.json(await createZone(board.id, body), { status: 201 });
});
