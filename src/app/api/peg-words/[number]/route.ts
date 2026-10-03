import { withApi } from "@/lib/api";
import { pegWordInputSchema } from "@/modules/word-images/schema";
import { updatePegWord } from "@/modules/word-images/service";

export const PUT = withApi({ body: pegWordInputSchema }, async ({ params, body }) =>
  Response.json(await updatePegWord(params.number, body.word)),
);
