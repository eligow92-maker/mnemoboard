import { withApi } from "@/lib/api";
import { customPegInputSchema } from "@/modules/word-images/schema";
import { createPegWord, listPegWords } from "@/modules/word-images/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => Response.json(await listPegWords()));

export const POST = withApi({ body: customPegInputSchema }, async ({ body }) =>
  Response.json(await createPegWord(body.number, body.word), { status: 201 }),
);
