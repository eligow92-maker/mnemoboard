import { BoardEditorScreen } from "@/components/board/board-editor-screen";

export default async function BoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BoardEditorScreen boardId={id} />;
}
