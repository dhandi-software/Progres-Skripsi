import { useOutletContext } from "react-router";
import type { ContextType } from "~/root";
import { ChatDesktop, ChatMobile } from "~/features/admin/chat";

export default function AdminChatRoute() {
  const { isMobile } = useOutletContext<ContextType>();
  return isMobile ? <ChatMobile title="Chat" /> : <ChatDesktop title="Chat" />;
}
