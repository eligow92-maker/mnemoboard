import { withApi } from "@/lib/api";
import { listPegWords } from "@/modules/word-images/service";

export const dynamic = "force-dynamic";

export const GET = withApi({}, async () => Response.json(await listPegWords()));
