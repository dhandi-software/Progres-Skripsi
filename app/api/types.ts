// ==========================================
// CENTRALIZED TYPES DEFINITION (app/api/types.ts)
// ==========================================

// ------------------------------------------
// 1. User & Auth Types
// ------------------------------------------
export interface User {
    id: string;
    email: string;
    role: "admin" | "mahasiswa" | "dosen" | "dosen_pembimbing" | "kaprodi" | "staf" | "staf_univ";
    token: string;
    name?: string;
    nama?: string;
    refresh_token?: string;
    last_login?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    status: string;
    message?: string;
    data: User;
}

export interface ErrorResponse {
    success: boolean;
    message: string;
    error?: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: "admin" | "mahasiswa" | "dosen" | "staf";
}

export interface RegisterResponse {
    code: number;
    status: string;
    message: string;
    data?: any;
}

// ------------------------------------------
// 2. Profile Types
// ------------------------------------------
export interface ProfileData {
    user_id: string;
    email: string;
    role: "admin" | "mahasiswa" | "dosen" | "staf";
    name: string;
    username: string;
    photo: string;
    bio: string;
    created_at?: string;
    updated_at?: string;
}

export interface ProfileResponse {
    code: number;
    status: string;
    message: string;
    data: ProfileData;
}

export interface ProfileUpdateRequest {
    username?: string;
    bio?: string;
    photo?: string | File;
    name?: string;
    email?: string;
}

// ------------------------------------------
// 3. Password Types
// ------------------------------------------
export interface ChangePasswordRequest {
    old_password: string;
    new_password: string;
}

export interface ChangePasswordResponse {
    code: number;
    status: string;
    message: string;
    data?: any;
}

export interface UpdatePasswordRequest {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

// ------------------------------------------
// 4. User Account Management Types
// ------------------------------------------
export interface UserAccount {
    id: string;
    email: string;
    name: string;
    role: "admin" | "mahasiswa" | "dosen" | "staf";
    created_at: string;
    updated_at: string;
    avatar?: string;
    handle?: string;
    username?: string;
    password?: string;
    bio?: string;
    mahasiswa?: any;
    dosen?: any;
    staf?: any;
}

export interface UserAccountResponse {
    code: number;
    status: string;
    message: string;
    data: UserAccount[] | UserAccount;
}

export interface UpdateRoleRequest {
    role: string;
}

// ------------------------------------------
// 5. Create Account Types
// ------------------------------------------
export interface CreateAccountFormData {
    emailPrefix: string;
    emailDomain: string;
    name: string;
    password: string;
    role: string;
    nim: string;
    tahunMasuk: string;
    sksDicapai: string;
    ipk: string;
    sksNilaiD: string;
    batasStudi: string;
    nidn: string;
    nip: string;
    jabatan: string;
    peminatan: string[];
    maxBimbingan: string;
}

export interface CreateAccountToastProps {
    title: string;
    variant: "success" | "destructive" | "default";
}

export interface CreateAccountPasswordValidation {
    length: boolean;
    pattern: boolean;
    number: boolean;
    symbol: boolean;
}

export interface CreateMahasiswaRequest {
    email: string;
    password: string;
    nama: string;
    nim: string;
    tahunMasuk: string;
    sksDicapai?: string;
    ipk?: string;
    sksNilaiD?: string;
    batasStudi?: string;
}

export interface CreateDosenRequest {
    email: string;
    password: string;
    nama: string;
    nidn: string;
    nip?: string;
    jabatan: string;
    peminatan?: string[];
    maxBimbingan?: string;
}

export interface CreateStafRequest {
    email: string;
    password: string;
    nama: string;
    nip: string;
}

export interface CreateMahasiswaMassalItem {
    nim: string;
    nama: string;
    email: string;
    password?: string;
    tahunMasuk?: string;
    sksDicapai?: string;
    ipk?: string;
    sksNilaiD?: string;
    batasStudi?: string;
}

export interface CreateDosenMassalItem {
    nim: string;
    nama: string;
    email: string;
    password?: string;
    jabatan?: string;
    peminatan?: string[];
}

// ------------------------------------------
// 6. Pengajuan & Peninjauan Types
// ------------------------------------------
export interface PengajuanPayload {
    dosenId: string;
    judul: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    sksDicapai: string;
    sksNilaiD: string;
    ipk: string;
    batasStudi: string;
}

export interface PengajuanResponse {
    message: string;
    data: any;
}

export interface Pengajuan {
    id: number;
    mahasiswa: {
        nama: string;
        nim: string;
    };
    judul: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk?: number;
    sksDicapai?: number;
    sksNilaiD?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION' | 'PENDING_KOORDINATOR' | 'REVISION_KOORDINATOR' | 'REJECTED_KOORDINATOR';
    dosenId: string;
    batasStudi?: string;
    remarks?: string;
    deadlineRevisi?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PengajuanDetail extends Pengajuan {
    filePengajuan?: string;
    historiCatatan?: Array<{
        tanggal: string;
        catatan: string;
        oleh: string;
    }>;
}

export type PengajuanActionStatus = 'APPROVED' | 'REJECTED' | 'REVISION' | 'PENDING' | 'PENDING_KOORDINATOR';

// ------------------------------------------
// 7. Bimbingan & Monitoring Types
// ------------------------------------------
export interface BimbinganTask {
    id: number;
    topik: string;
    catatan: string;
    versi: number;
    tanggal: string;
    status: 'SUBMITTED' | 'REVISION' | 'APPROVED' | 'ASSIGNED';
    fileMahasiswa?: string;
    fileDosen?: string;
    jadwalBimbingan?: string;
    deadlineRevisi?: string;
    mahasiswaId?: number;
}

export interface BimbinganData {
    dosen: {
        id: number;
        nama: string;
        username: string;
        photo?: string;
    };
    students: any[];
    totalStudents: number;
    activeProgress: number;
}

export interface CatatanParseResult {
    catatanUtama: string;
    targetSelanjutnya: string;
    jadwalBimbinganStr: string;
    deadlineStr: string;
    sudahPernahRevisi: boolean;
}

export interface TimeRemainingResult {
    days: number;
    hours: number;
    text: string;
    isOverdue: boolean;
}

export interface ChartDataPoint {
    submission: string;
    durasiHari: number;
    status: string;
}

export interface SidangItem {
    id: number;
    mahasiswa: {
        nama: string;
        nim: string;
    };
    judul: string;
    tanggalSidang?: string;
    ruangan?: string;
    status: string;
    penguji1?: string;
    penguji2?: string;
    nilai?: number;
}

// ------------------------------------------
// 8. Penilaian Types
// ------------------------------------------
export interface PenilaianItem {
    id: number;
    nama: string;
    nim: string;
    prodi: string;
    perusahaan: string;
    tglMulai: string;
    tglSelesai: string;
    status: "SUDAH_DINILAI" | "BELUM_DINILAI";
    nilaiPenguji?: number;
    nilaiPembimbing?: number;
    nilaiLapangan?: number;
    nilaiAkhir?: number;
    grade?: string;
    roleInSidang?: "PENGUJI" | "PEMBIMBING" | "Keduanya";
}

export interface PenilaianFormState {
    nilaiPenguji: string;
    nilaiPembimbing: string;
    catatan: string;
}

export interface ConfirmModalState {
    isOpen: boolean;
    student: PenilaianItem | null;
}

// ------------------------------------------
// 9. Sanksi Types
// ------------------------------------------
export interface SanksiAdministrasi {
    id: number;
    mahasiswaId?: string;
    mahasiswaNim?: string;
    dosenId?: string;
    dosenNidn?: string;
    nama: string;
    nim: string;
    hariSidang: string;
    tanggalSidang: string;
    hariTenggat: string;
    tanggalSurat: string;
    status?: string;
    tenggatWaktu?: string;
    tanggalKonfirmasi?: string;
    denda?: number;
    keterlambatanMinggu?: number;
    createdAt?: string;
    updatedAt?: string;
    namaMahasiswa?: string;
    jenisSanksi?: string;
    alasan?: string;
    tanggalMulai?: string;
    tanggalSelesai?: string;
    mahasiswa?: {
        id: string | number;
        nama: string;
        nim: string;
    };
    dosen?: {
        id: number;
        nama: string;
        nidn: string;
    };
}

export interface SupervisedStudent {
    id: string | number;
    nama: string;
    nim: string;
    tanggalSidang?: string | null;
    statusSidang?: string | null;
}

export interface SanksiFormState {
    mahasiswaId: string;
    jenisSanksi: string;
    alasan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
}

// ------------------------------------------
// 10. Laporan Types
// ------------------------------------------
export interface TempatKPItem {
    namaPerusahaan: string;
    alamat: string;
    pembimbingLapangan: string;
}

export interface LogbookItem {
    id: number;
    tanggal: string;
    kegiatan: string;
    status: string;
}

export interface BimbinganDetailItem {
    id: number;
    topik: string;
    tanggal: string;
    status: string;
    catatan?: string;
}

export interface LaporanItem {
    id: number;
    mahasiswa: {
        nama: string;
        nim: string;
    };
    tempatKp: TempatKPItem;
    logbook: LogbookItem[];
    bimbingan: BimbinganDetailItem[];
}

// ------------------------------------------
// 11. Chat Types
// ------------------------------------------
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

// ------------------------------------------
// 12. Acara & Jadwal KP Types
// ------------------------------------------
export interface Acara {
    id: number;
    judul: string;
    deskripsi: string;
    tanggal: string;
    waktu: string;
    lokasi: string;
    kategori: string;
    pembicara?: string;
    bannerUrl?: string;
    commentsCount?: number;
}

export interface AcaraComment {
    id: number;
    acaraId: number;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
}

export interface AcaraResponse {
    code: number;
    status: string;
    message: string;
    data: Acara[] | Acara;
}

export interface JadwalKp {
    id: number;
    kegiatan: string;
    tanggalMulai: string;
    tanggalSelesai: string;
    keterangan?: string;
}

// ------------------------------------------
// 13. News & Video Types
// ------------------------------------------
export interface NewsListItem {
    id: string | number;
    title: string;
    slug?: string;
    summary?: string;
    content?: string;
    category?: string;
    imageUrl?: string;
    publishedAt?: string;
    createdAt?: string;
    author?: string;
}

export interface VideoListItem {
    id: string | number;
    title: string;
    youtubeUrl?: string;
    thumbnailUrl?: string;
    duration?: string;
    publishedAt?: string;
    createdAt?: string;
}

