import { uuidParam, withApi } from "@/lib/api";
import { createConnection } from "@/modules/arrangement/connections";
import { connectionCreateSchema } from "@/modules/arrangement/schema";
import { requireBoard } from "@/modules/boards/service";

export const POST = withApi({ body: connectionCreateSchema }, async ({ params, body }) => {
  const board = await requireBoard(uuidParam(params, "boardId"));
  return Response.json(await createConnection(board.id, body), { status: 201 });
});
