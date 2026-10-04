import { withApi } from "@/lib/api";
import { resetPegWord } from "@/modules/word-images/service";

export const POST = withApi({}, async ({ params }) =>
  Response.json(await resetPegWord(params.number)),
);
