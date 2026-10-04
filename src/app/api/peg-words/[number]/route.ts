import { withApi } from "@/lib/api";
import { pegWordInputSchema } from "@/modules/word-images/schema";
import { deletePegWord, updatePegWord } from "@/modules/word-images/service";

export const DELETE = withApi({}, async ({ params }) => {
  await deletePegWord(params.number);
  return new Response(null, { status: 204 });
});

export const PUT = withApi({ body: pegWordInputSchema }, async ({ params, body }) =>
  Response.json(await updatePegWord(params.number, body.word)),
);
