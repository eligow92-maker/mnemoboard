import { ReviewScreen } from "@/components/review/review-screen";
import { parseColorsParam } from "@/modules/notes/colors";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ colors?: string }>;
}) {
  const { id } = await params;
  const { colors } = await searchParams;
  return <ReviewScreen boardId={id} colors={parseColorsParam(colors)} />;
}
