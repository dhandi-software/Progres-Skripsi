/**
 * Centralized Hooks Registry
 * All application custom hooks in one single directory (`app/hooks/`)
 * for easy access, documentation, and maintainability.
 */

// Global Utility & Auth Hooks
export { useAuth } from "./useAuth";
export { useMediaQuery } from "./useMediaQuery";
export { useProfile } from "./useProfile";

// Feature Hooks - Chat
export { useChat } from "./useChat";
export { useChatWindow } from "./useChatWindow";
export { useChatSidebar } from "./useChatSidebar";

// Feature Hooks - Dosen Bimbingan
export { useSanksi } from "./useSanksi";
export { usePenilaian } from "./usePenilaian";
export { useLaporan } from "./useLaporan";
export { usePeninjauan } from "./usePeninjauan";
export { usePeninjauanDetail } from "./usePeninjauanDetail";
export { useBimbingan } from "./useBimbingan";
export { useBimbinganDetail } from "./useBimbinganDetail";

// Feature Hooks - Landing & Articles
export { useHome } from "./useHome";
export { useArticle } from "./useArticle";

// Feature Hooks - Admin
export { useCreateAccount } from "./useCreateAccount";
export { useEditAccount } from "./useEditAccount";

// Feature Hooks - Prodi
export { useProdiBimbingan } from "./useProdiBimbingan";
export { useProdiSidang } from "./useProdiSidang";

// Feature Hooks - Acara
export { useAcara } from "./useAcara";
export { useCreateAcara } from "./useCreateAcara";


