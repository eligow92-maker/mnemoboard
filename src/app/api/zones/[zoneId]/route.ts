import { uuidParam, withApi } from "@/lib/api";
import { zoneUpdateSchema } from "@/modules/arrangement/schema";
import { deleteZone, updateZone } from "@/modules/arrangement/zone-service";

export const PATCH = withApi({ body: zoneUpdateSchema }, async ({ params, body }) =>
  Response.json(await updateZone(uuidParam(params, "zoneId"), body)),
);

export const DELETE = withApi({}, async ({ params }) => {
  await deleteZone(uuidParam(params, "zoneId"));
  return new Response(null, { status: 204 });
});
