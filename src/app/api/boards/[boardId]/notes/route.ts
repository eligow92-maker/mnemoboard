import { uuidParam, withApi } from "@/lib/api";
import { requireBoard } from "@/modules/boards/service";
import { noteCreateSchema } from "@/modules/notes/schema";
import { createNote } from "@/modules/notes/service";

export const POST = withApi({ body: noteCreateSchema }, async ({ params, body }) => {
  const board = await requireBoard(uuidParam(params, "boardId"));
  return Response.json(await createNote(board.id, body), { status: 201 });
});
