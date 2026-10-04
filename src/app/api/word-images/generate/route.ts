import { withApi } from "@/lib/api";
import { generateSchema } from "@/modules/word-images/schema";
import { generateForTopic } from "@/modules/word-images/service";

export const POST = withApi({ body: generateSchema }, async ({ body }) =>
  Response.json(await generateForTopic(body.topic)),
);
