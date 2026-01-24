# ✨ Skripsi Frontend Features

This document outlines the key features of the application, including the real-time communication module.

## 💬 Live Chat Feature

The application includes a fully featured real-time chat system inspired by modern messaging apps (WhatsApp/Telegram).

### Key Capabilities
- **Real-time Messaging**: Instant message delivery using Socket.IO.
- **Attachments**: Support for sending images and documents.
- **Read Receipts**: Double blue ticks to indicate message read status.
- **Message Deletion**:
  - **Delete for Everyone**: Retracts message for all participants.
  - **Delete for Me**: Hides message only for the current user.
- **Unread Counters**: Real-time green badge notifications for unread messages in the sidebar.
- **Notifications**: Browser system notifications and sound alerts (configurable) for incoming messages.
- **Typing Status**: (Planned/In Progress)

### Technical Implementation
- **Protocol**: WebSockets (Socket.IO Client)
- **Libraries**:
  - **Backend**: `socket.io` (^4.8.3)
  - **Frontend**: `socket.io-client` (^4.8.3)
- **State Management**: React Hooks (`useChat`) managing socket connection, message state, and optimistic updates.
- **UI Components**:
  - `ChatWindow`: Main message list with customized background and bubble styles.
  - `ChatSidebar`: Contact list with real-time unread badges and last message preview.

---

## 🔐 Other Features

### Role-Based Access Control (RBAC)
- **Mahasiswa**: Access to Dashboard, Academic Guidance, Chat, and Schedule.
- **Dosen**: Access to Student Management, Grading, Chat, and Validation.
- **Admin**: Full system oversight.

### Academic Guidance (Bimbingan)
- Digital submission of guidance progress.
- Supervisor approval workflow.
- History tracking.

### Grading System (Penilaian)
- Digital grade input for seminars and final defense.
- Automated calculation and result display.
