import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { ChatDesktop, ChatMobile } from "~/features/dosen/chat";

export default function ChatRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <ChatMobile title="Chat" /> : <ChatDesktop title="Chat" />;
}
