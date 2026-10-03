import { withApi } from "@/lib/api";
import { getStats } from "@/modules/review/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => Response.json(await getStats()));
