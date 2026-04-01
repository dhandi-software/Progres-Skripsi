export interface Message {
  id: number;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: 'image' | 'document' | 'none' | null;
  senderId: number;
  receiverId?: number;
  roomId?: number;
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
  id: number | string;
  realId?: number;
  isGroup?: boolean;
  username: string;
  role: string;
  email: string;
  lastMessage?: Message; // Optional, for list display if needed
  adminId?: number;
  members?: { id: number; username: string; role: string }[];
}

export interface SendMessagePayload {
  senderId: number;
  receiverId?: number; // Optional for group messages
  roomId?: number;     // Used for group messages
  content?: string;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'document' | 'none';
  isPublic?: boolean;
}
