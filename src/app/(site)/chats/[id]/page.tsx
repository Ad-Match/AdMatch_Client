import { ChatRoomClient } from "@/mfe/apps/chat/ChatRoomClient";

type Props = { params: Promise<{ id: string }> };

export default async function ChatRoomPage({ params }: Props) {
  const { id } = await params;
  return <ChatRoomClient roomId={id} />;
}
