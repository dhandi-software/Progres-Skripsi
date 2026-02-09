export interface Message {
  id: number;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'document' | 'none' | null;
  senderId: number;
  receiverId: number;
  createdAt: string;
  sender?: {
    username: string;
    role: string;
  };
  receiver?: {
    username: string;
    role: string;
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
  id: number;
  username: string;
  role: string;
  email: string;
  lastMessage?: Message; // Optional, for list display if needed
}

export interface SendMessagePayload {
  senderId: number;
  receiverId: number; // For public chat, this can be ignored or set to 0/null but our type says number. We'll handle logic in hook.
  content?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'none';
  isPublic?: boolean;
}
