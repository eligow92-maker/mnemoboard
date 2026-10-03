import { uuidParam, withApi } from "@/lib/api";
import { requireBoard } from "@/modules/boards/service";
import { startSession } from "@/modules/review/service";

export const POST = withApi({}, async ({ params }) => {
  const board = await requireBoard(uuidParam(params, "boardId"));
  return Response.json(await startSession(board.id), { status: 201 });
});
