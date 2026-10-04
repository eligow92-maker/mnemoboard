import { uuidParam, withApi } from "@/lib/api";
import { finishSession } from "@/modules/review/service";

export const POST = withApi({}, async ({ params }) =>
  Response.json(await finishSession(uuidParam(params, "sessionId"))),
);
