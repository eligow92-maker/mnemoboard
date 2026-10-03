import { uuidParam, withApi } from "@/lib/api";
import { reviewResultSchema } from "@/modules/review/schema";
import { recordResult } from "@/modules/review/service";

export const POST = withApi({ body: reviewResultSchema }, async ({ params, body }) =>
  Response.json(await recordResult(uuidParam(params, "sessionId"), body), { status: 201 }),
);
