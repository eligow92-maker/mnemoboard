import { uuidParam, withApi } from "@/lib/api";
import { deleteConnection } from "@/modules/arrangement/connections";

export const DELETE = withApi({}, async ({ params }) => {
  await deleteConnection(uuidParam(params, "connectionId"));
  return new Response(null, { status: 204 });
});
