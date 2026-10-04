import { uuidParam, withApi } from "@/lib/api";
import { requireBoard } from "@/modules/boards/service";
import { startSessionSchema } from "@/modules/review/schema";
import { startSession } from "@/modules/review/service";

export const POST = withApi(
  { body: startSessionSchema, bodyOptional: true },
  async ({ params, body }) => {
    const board = await requireBoard(uuidParam(params, "boardId"));
    return Response.json(await startSession(board.id, body?.colors), { status: 201 });
  },
);
