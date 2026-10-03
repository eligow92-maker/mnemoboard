import { uuidParam, withApi } from "@/lib/api";
import { boardInputSchema } from "@/modules/boards/schema";
import { deleteBoard, getBoardDetail, renameBoard } from "@/modules/boards/service";

export const GET = withApi({}, async ({ params }) =>
  Response.json(await getBoardDetail(uuidParam(params, "boardId"))),
);

export const PATCH = withApi({ body: boardInputSchema }, async ({ params, body }) =>
  Response.json(await renameBoard(uuidParam(params, "boardId"), body)),
);

export const DELETE = withApi({}, async ({ params }) => {
  await deleteBoard(uuidParam(params, "boardId"));
  return new Response(null, { status: 204 });
});
