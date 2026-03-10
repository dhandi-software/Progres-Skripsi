export interface User {
    id: string;
    email: string;
    role: "admin" | "writer" | "editor" | "mahasiswa" | "dosen" | "dosen_pembimbing" | "kaprodi" | "staf" | "staf_univ";
    token: string;
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
    role: "admin" | "writer" | "editor";
}

export interface RegisterResponse {
    code: number;
    status: string;
    message: string;
    data?: any;
}

// Password Types

export interface ProfileData {
    user_id: string;
    email: string;
    role: "admin" | "writer" | "editor";
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

// Password Types
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
// User Management Types

// User Management Types
export interface UserAccount {
    id: string;
    email: string;
    name: string;
    role: "admin" | "writer" | "editor";
    created_at: string;
    updated_at: string;
    avatar?: string;
    handle?: string;
    username?: string;
    password?: string;
    bio?: string;
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
        jurusan: string;
    };
    judul: string;
    peminatan: string;
    semester: string;
    tahunAkademik: string;
    ipk?: number;
    sksDicapai?: number;
    sksNilaiD?: number;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    dosenId: string;
    batasStudi?: string;
    createdAt?: string;
    updatedAt?: string;
}
