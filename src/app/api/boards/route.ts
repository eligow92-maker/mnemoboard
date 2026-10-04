import { withApi } from "@/lib/api";
import { boardInputSchema } from "@/modules/boards/schema";
import { createBoard, listBoards } from "@/modules/boards/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => Response.json(await listBoards()));

export const POST = withApi({ body: boardInputSchema }, async ({ body }) =>
  Response.json(await createBoard(body), { status: 201 }),
);
