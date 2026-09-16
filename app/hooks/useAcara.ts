import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { acaraApi, type Acara, type AcaraResponse } from "~/api/acaraApi";
import { UPLOADS_URL } from "~/api/client";
import { sanitizeHtml } from "~/lib/sanitize";

export function useAcara() {
    const { user } = useAuth();
    const currentUserPhoto = typeof window !== "undefined" ? (localStorage.getItem("userPhoto") || user?.photo) : user?.photo;
    const hasUserPhoto = currentUserPhoto && currentUserPhoto !== "null" && currentUserPhoto !== "undefined" && currentUserPhoto !== "/images/avatar.svg";
    const myName = user?.name || user?.username || "?";
    const myInitial = myName.charAt(0).toUpperCase();

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const routePrefix = location.pathname.startsWith("/admin")
        ? "/admin/acara"
        : location.pathname.startsWith("/staf")
            ? "/staf/acara"
            : location.pathname.startsWith("/mahasiswa")
                ? "/mahasiswa/acara"
                : "/dosen/acara";

    const [acaras, setAcaras] = useState<Acara[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAcara, setSelectedAcara] = useState<Acara | null>(null);
    const [newComment, setNewComment] = useState("");
    const [toast, setToast] = useState<{ title: string; variant: "success" | "destructive" } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<AcaraResponse["pagination"] | null>(null);
    const [isCopying, setIsCopying] = useState(false);

    const fetchData = async (currentPage: number) => {
        try {
            setIsLoading(true);
            const response = await acaraApi.getAcara(currentPage, 10);
            setAcaras(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Fetch Acara Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    // Handle deep linking from query param ?post=ID
    useEffect(() => {
        const postId = searchParams.get("post");
        if (postId && !selectedAcara) {
            const id = parseInt(postId);
            const localMatch = acaras.find((a) => a.id === id);
            if (localMatch) {
                setSelectedAcara(localMatch);
            } else if (!isLoading && acaras.length > 0) {
                acaraApi.getAcaraById(id)
                    .then((data) => {
                        setSelectedAcara(data);
                    })
                    .catch((err) => {
                        console.error("Gagal deep link acara:", err);
                        setSearchParams({});
                    });
            }
        }
    }, [searchParams, acaras.length, isLoading]);

    // Handle internal navigation state (e.g. from dashboard / notification)
    useEffect(() => {
        if (location.state?.selectedId && acaras.length > 0 && !selectedAcara) {
            const item = acaras.find((a) => a.id === location.state.selectedId);
            if (item) {
                setSelectedAcara(item);
                setSearchParams({ post: item.id.toString() });
                window.history.replaceState({}, document.title);
            }
        }
    }, [location.state, acaras]);

    const transformContent = (content: string, isMobile = false) => {
        if (!content) return "";
        const baseUploads = UPLOADS_URL.replace(/\/$/, "");
        const imgClasses = isMobile
            ? 'class="w-full h-auto max-h-[400px] rounded-2xl my-8 shadow-lg border border-slate-100 object-contain bg-slate-50/30 hover:scale-[1.02] transition-transform cursor-pointer" '
            : 'class="max-w-[800px] w-full h-auto max-h-[600px] mx-auto block rounded-[32px] my-12 shadow-2xl border border-slate-100 object-contain bg-slate-50/30 hover:scale-[1.01] transition-transform cursor-pointer" ';

        let transformed = content
            .replace(/src="\/uploads\//g, `src="${baseUploads}/uploads/`)
            .replace(/href="\/uploads\//g, `href="${baseUploads}/uploads/`)
            .replace(/<img([^>]*)src="([^">]+)"([^>]*)>/g, (match, p1, src, p2) => {
                const updatedImg = `<img${p1}src="${src}"${p2}`.replace(/<img /g, `<img ${imgClasses}`);
                return `<a href="${src}" target="_blank" rel="noopener noreferrer">${updatedImg}</a>`;
            });

        // Auto-link plain text URLs
        const parts = transformed.split(/(<[^>]+>)/g);
        for (let i = 0; i < parts.length; i++) {
            if (i % 2 === 0) {
                parts[i] = parts[i].replace(
                    /(https?:\/\/[^\s<]+)/g,
                    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[#00bcd4] font-bold underline">$1</a>'
                );
            }
        }
        transformed = parts.join('');

        return sanitizeHtml(transformed);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAcara || !newComment.trim()) return;
        try {
            const comment = await acaraApi.addComment(selectedAcara.id, newComment);
            const updatedAcara = {
                ...selectedAcara,
                comments: [...selectedAcara.comments, comment]
            };
            setSelectedAcara(updatedAcara);
            setNewComment("");

            setAcaras((prev) =>
                prev.map((item) => (item.id === selectedAcara.id ? updatedAcara : item))
            );
        } catch (error) {
            alert("Gagal menambah komentar.");
        }
    };

    const handleSelectAcara = async (item: Acara & { isReadByMe?: boolean }) => {
        setSelectedAcara(item);
        setSearchParams({ post: item.id.toString() });
        if (!item.isReadByMe) {
            setAcaras((prev) => prev.map((a) => (a.id === item.id ? { ...a, isReadByMe: true } : a)));
            try {
                await acaraApi.markAsRead(item.id);
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("update-unread-count"));
                }
            } catch (error) {
                console.error("Mark Read Error:", error);
                setAcaras((prev) => prev.map((a) => (a.id === item.id ? { ...a, isReadByMe: false } : a)));
            }
        }
    };

    const handleBack = () => {
        setSelectedAcara(null);
        setSearchParams({});
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}${window.location.pathname}?post=${selectedAcara?.id}`;
        navigator.clipboard.writeText(url);
        setIsCopying(true);
        setToast({ title: "Link berhasil disalin!", variant: "success" });
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleCopySpecificLink = (id: number) => {
        const url = `${window.location.origin}${window.location.pathname}?post=${id}`;
        navigator.clipboard.writeText(url);
        setIsCopying(true);
        setToast({ title: "Link berhasil disalin!", variant: "success" });
        setTimeout(() => setIsCopying(false), 2000);
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            await acaraApi.deleteAcara(deletingId);
            if (selectedAcara?.id === deletingId) setSelectedAcara(null);
            setToast({ title: "Postingan berhasil dihapus!", variant: "success" });
            fetchData(page);
        } catch (error) {
            setToast({ title: "Gagal menghapus postingan.", variant: "destructive" });
        } finally {
            setShowDeleteModal(false);
            setDeletingId(null);
        }
    };

    return {
        user,
        currentUserPhoto,
        hasUserPhoto,
        myName,
        myInitial,
        navigate,
        routePrefix,
        acaras,
        isLoading,
        selectedAcara,
        setSelectedAcara,
        newComment,
        setNewComment,
        toast,
        setToast,
        showDeleteModal,
        setShowDeleteModal,
        deletingId,
        setDeletingId,
        page,
        setPage,
        pagination,
        isCopying,
        fetchData,
        transformContent,
        handleAddComment,
        handleSelectAcara,
        handleBack,
        handleCopyLink,
        handleCopySpecificLink,
        handleDelete,
    };
}
