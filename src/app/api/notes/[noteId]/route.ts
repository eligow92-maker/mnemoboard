import { uuidParam, withApi } from "@/lib/api";
import { noteUpdateSchema } from "@/modules/notes/schema";
import { deleteNote, updateNote } from "@/modules/notes/service";

export const PATCH = withApi({ body: noteUpdateSchema }, async ({ params, body }) =>
  Response.json(await updateNote(uuidParam(params, "noteId"), body)),
);

export const DELETE = withApi({}, async ({ params }) => {
  await deleteNote(uuidParam(params, "noteId"));
  return new Response(null, { status: 204 });
});
