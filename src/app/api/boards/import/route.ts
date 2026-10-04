import { withApi } from "@/lib/api";
import { importBoard, readBoardExportFile } from "@/modules/transfer/service";

export const POST = withApi({}, async ({ request }) =>
  Response.json(await importBoard(await readBoardExportFile(request)), { status: 201 }),
);
