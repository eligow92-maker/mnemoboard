import { uuidParam, withApi } from "@/lib/api";
import { getBoardDetail } from "@/modules/boards/service";

export const GET = withApi({}, async ({ params }) =>
  Response.json(await getBoardDetail(uuidParam(params, "boardId"))),
);
