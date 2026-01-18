export interface LoginCredentials {
    email?: string; // or username, backend accepts "username" but FE form has "email" field. We need to map it.
    username?: string; 
    password?: string;
}

export interface User {
    id: number;
    username: string;
    name: string;
    role: 'kaprodi' | 'dosen_pembimbing' | 'staf_univ' | 'mahasiswa' | 'admin' | 'writer' | 'editor';
    token?: string; 
    email?: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    user: User;
}
