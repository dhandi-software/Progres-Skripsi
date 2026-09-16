export interface Message {
  id: number;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'document' | 'none' | null;
  fileName?: string | null;
  senderId: number;
  receiverId?: number;
  roomId?: number;
  createdAt: string;
  sender?: {
    username: string;
    role: string;
    photo?: string;
  };
  receiver?: {
    username: string;
    role: string;
    photo?: string;
  };
  isPublic?: boolean;
  isRead: boolean;
  isDeleted: boolean;
  isEdited?: boolean;
  replyToId?: number | null;
  parent?: {
    id: number;
    content: string;
    sender: { username: string };
  };
}

export interface ChatContact {
  id: number | string;
  realId?: number;
  isGroup?: boolean;
  username: string;
  role: string;
  email: string;
  photo?: string;
  lastMessage?: Message;
  adminId?: number;
  members?: { id: number; username: string; role: string; photo?: string }[];
}

export interface SendMessagePayload {
  senderId: number;
  receiverId?: number;
  roomId?: number;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'none';
  fileName?: string;
  isPublic?: boolean;
}

export interface AvatarDetails {
  initials: string;
  color: string;
  image: string;
}

export interface ChatWindowProps {
  activeContact: ChatContact | null;
  messages: Message[];
  currentUser: { id: number; username: string; role?: string } | null;
  onSendMessage: (content: string, file?: File, replyToId?: number) => void;
  onEditMessage?: (messageId: number, newContent: string) => void;
  isLoadingHistory: boolean;
  onBack?: () => void;
  onMarkAsRead?: (targetId: number | string, isGroup?: boolean) => void;
  onDeleteMessage?: (messageId: number) => void;
  onDeleteMessageForMe?: (messageId: number) => void;
  onAddMembers?: () => void;
  onRemoveMember?: (memberId: number) => Promise<void> | void;
  onDeleteGroup?: () => Promise<void> | void;
  publicMembers?: any[];
  onKickPublic?: (userId: number) => void;
  onUnbanPublic?: (userId: number) => void;
  isSending?: boolean;
}

export interface ChatSidebarProps {
  contacts: ChatContact[];
  activeContact: ChatContact | null;
  onSelectContact: (contact: ChatContact) => void;
  unreadCounts?: Record<string | number, number>;
  currentUserRole?: string;
  currentUser?: any;
  onCreateGroup?: () => void;
}

export interface MessageActionMenuProps {
  message: Message;
  currentUserId?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onReply?: () => void;
}

export interface DeleteMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteForEveryone?: () => void;
  onDeleteForMe?: () => void;
  isMyMessage?: boolean;
}

export interface RemoveMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
}

export interface DeleteGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}
