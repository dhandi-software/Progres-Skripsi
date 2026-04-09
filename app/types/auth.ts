export interface LoginCredentials {
    email?: string; // or username, backend accepts "username" but FE form has "email" field. We need to map it.
    username?: string; 
    password?: string;
}

export interface User {
    id: number;
    username: string;
    name: string;
    role: 'kaprodi' | 'dosen_pembimbing' | 'dosen' | 'staf_univ' | 'staf' | 'mahasiswa' | 'admin' | 'writer' | 'editor';
    token?: string; 
    email?: string;
    photo?: string;
    jabatan?: string;
    dosenId?: number;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}
