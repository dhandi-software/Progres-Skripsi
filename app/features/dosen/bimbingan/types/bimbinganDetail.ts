export interface BimbinganTask {
    id: number;
    mahasiswaId: string | number;
    mahasiswaNim: string;
    topik: string;
    versi: number;
    status: 'ASSIGNED' | 'SUBMITTED' | 'REVISION' | 'APPROVED';
    jadwalBimbingan?: string;
    tanggal?: string;
    catatan?: string;
    keteranganProgres?: string;
    fileMahasiswa?: string;
    anotasi?: any[];
}

export interface CatatanParseResult {
    nilai: number | null;
    text: string;
}

export interface TimeRemainingResult {
    text: string;
    isLate: boolean;
    isWarning: boolean;
}

export interface ChartDataPoint {
    name: string;
    score: number;
    fullTopic: string;
    diffDays: number;
    isSubmitted: boolean;
    isApproved?: boolean;
    statusText: string;
}

export interface ToastPropsState {
    title: string;
    variant?: "success" | "destructive" | "default";
}
