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

// News Article Types
export interface NewsRequest {
    title: string;
    sub_heading: string;
    set_headline: boolean;
    media_id: string;
    image_caption: string;
    body: string;
    status: "draft" | "published" | "scheduled";
    categories: number[];
    topics: number[];
    scheduled_at?: string | null;
}

export interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    sub_heading: string;
    set_headline: boolean;
    image_caption: string;
    body: string;
    status: "draft" | "published" | "scheduled";
    user_id: string;
    topics: number[] | null;
    categories: number[] | null;
    analytic: any | null;
    created_at: string;
    updated_at: string;
    scheduled_at: string | null;
    deleted_at: string | null;
}

export interface NewsResponse {
    status: string;
    data: NewsArticle;
}

// News List API Types
export interface NewsQuery {
    limit?: number;
    order?: "asc" | "desc";
    category?: string;
    topic?: string;
    isTrending?: boolean;
    status?: "draft" | "published" | "scheduled";
    page?: number;
    title?: string;
}

export interface NewsMediaResponse {
    id?: string;
    name?: string;
    path?: string;
}

export interface NewsCategoriesResponse {
    id: number;
    name: string;
    slug: string;
}

export interface NewsAnalyticResponse {
    id?: number;
    type?: string;
    count?: number;
}

export interface NewsListItem {
    id: string;
    title: string;
    slug: string;
    image_caption?: string;
    body?: string;
    user?: any;
    description?: string;
    media: NewsMediaResponse | null;
    categories: NewsCategoriesResponse[];
    topics?: NewsCategoriesResponse[];
    analytic?: NewsAnalyticResponse;
    status?: "draft" | "published" | "scheduled";
    created_at: string;
    updated_at: string;
    scheduled_at?: string;
}

export interface NewsListData {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
    rows: NewsListItem[];
}

export interface NewsListResponse {
    code: number;
    status: string;
    message: string;
    data: NewsListData;
}

// Published News Response (data is array directly, not object with rows)
export interface PublishedNewsResponse {
    code: number;
    status: string;
    message: string;
    data: NewsListItem[];
}

// Video API Types
export interface VideoListItem {
    id: number;
    yt_video_id: string;
    title: string;
    created_at: string;
    link?: string;
}

export interface VideoIndexQuery {
    page?: number;
    limit?: number;
    sort?: string;
    date?: number; // Unix timestamp
}

export interface VideoIndexResponse {
    code: number;
    status: string;
    message: string;
    data: {
        limit: number;
        page: number;
        sort: string;
        total_rows: number;
        total_pages: number;
        rows: VideoListItem[];
    };
}

export interface VideoListResponse {
    code: number;
    status: string;
    message: string;
    data: VideoListItem[];
}

export interface VideoQuery {
    limit?: number;
    order?: "asc" | "desc";
}

// Video Index API Types with Pagination
export interface VideoIndexQuery {
    limit?: number;
    page?: number;
}

export interface VideoIndexData {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
    rows: VideoListItem[];
}

export interface VideoIndexResponse {
    code: number;
    status: string;
    message: string;
    data: VideoIndexData;
}

// Headline News API Types
export interface HeadlineNewsResponse {
    code: number;
    status: string;
    message: string;
    data: NewsListItem[];
}

// Article Detail Types
export interface ArticleUser {
    id: string;
    name: string;
    email: string;
    password: string;
    is_verified: boolean;
    role: "admin" | "writer" | "editor";
    created_at: string;
    updated_at: string;
}

export interface ArticleTopic {
    id: number;
    news_id: string;
    topic: any | null;
}

export interface ArticleCategory {
    id: number;
    news_id: string;
    category: any | null;
}

export interface ArticleAnalytic {
    id: number;
    object: string;
    object_id: string;
    type: string;
    count: number;
    created_at: string;
    updated_at: string;
}

export interface ArticleDetail {
    id: string;
    title: string;
    slug: string;
    sub_heading: string;
    set_headline: boolean;
    image_caption: string;
    body: string;
    status: "draft" | "published" | "scheduled";
    user: ArticleUser;
    topics: ArticleTopic[];
    categories: ArticleCategory[];
    analytic: ArticleAnalytic | null;
    created_at: string;
    updated_at: string;
    scheduled_at: string;
    deleted_at: string | null;
}

export interface ArticleDetailResponse {
    code: number;
    status: string;
    message: string;
    data: ArticleDetail;
}

// News Index API Types with Pagination
export interface NewsIndexQuery {
    date?: number; // Unix timestamp
    category?: number; // Category ID
    limit?: number;
    page?: number;
    title?: string;
}

export interface NewsIndexData {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
    rows: NewsListItem[];
}

export interface NewsIndexResponse {
    code: number;
    status: string;
    message: string;
    data: NewsIndexData;
}

export interface NewsLatestActivitiesResponse {
    id: string;
    title: string;
    user: { id: string; name: string };
    topics: { id: number; name: string; slug: string }[];
    categories: { id: number; name: string; slug: string }[];
}

export interface PopularCategoryResponse {
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

// media

export interface PaginatedMediaData {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
    rows: MediaItem[];
}

export interface MediaResponse {
    code: number;
    status: string;
    message: string;
    data: MediaItem | MediaItem[] | PaginatedMediaData;
}

export interface MediaItem {
    id: string;
    name: string;
    path: string;
    photo?: string;
    created_at: string;
    updated_at: string;
}

export interface UpdateMediaRequest {
    name: string;
}

export interface DeleteMediaRequest {
    id: string[];
}

export interface FilterMediaQuery {
    type?: string | string[];
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateMediaRequest {
    file: File;
    name?: string;
}

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
// Advertisement Types
export interface AdvertisementRequest {
    media_id: string;
    news_id?: string | null;
    title: string;
    ads_type: "Hero Banner" | "Spotlight" | "Article";
    link_ads: string;
    period: string; // Format: DD-MM-YYYY
}

export interface AdvertisementResponse {
    id: string;
    news_id: string | null;
    media_path: string;
    ads_type: string;
    title: string;
    link_ads: string;
    period: number; // Unix timestamp
    created_at: number;
    updated_at: number;
}

export interface AdsListResponse {
    code: number;
    status: string;
    message: string;
    data: AdvertisementResponse[];
}

export interface AdsCreateResponse {
    code: number;
    status: string;
    message: string;
    data: AdvertisementResponse;
}

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

// Log Activity Types
export interface LogActivityItem {
    id: number;
    user_name: string;
    role: string;
    action_type: string;
    description: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    updated_at: string;
}

export interface LogActivityListData {
    limit: number;
    page: number;
    sort: string;
    total_rows: number;
    total_pages: number;
    rows: LogActivityItem[];
}

export interface LogActivityListResponse {
    code: number;
    status: string;
    message: string;
    data: LogActivityListData;
}

export interface LogActivityFilterQuery {
    role?: string;
    action?: string;
    date?: number; // Unix timestamp
    page?: number;
    limit?: number;
    sort?: string;
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
