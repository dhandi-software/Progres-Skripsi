import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { acaraApi } from "~/api/acaraApi";
import { UPLOADS_URL } from "~/api/client";

export function useCreateAcara() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const routePrefix = location.pathname.startsWith("/admin")
        ? "/admin/acara"
        : location.pathname.startsWith("/staf")
            ? "/staf/acara"
            : "/dosen/acara";

    const [isUploading, setIsUploading] = useState(false);
    const [toast, setToast] = useState<{ title: string; variant: "success" | "destructive" } | null>(null);
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const [isLoading, setIsLoading] = useState(isEditMode);

    // Custom Dropdown State
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsTypeDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Editor Refs & State
    const editorRef = useRef<HTMLDivElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type: "ANNOUNCEMENT"
    });

    const [activeStyles, setActiveStyles] = useState({
        bold: false,
        italic: false,
        underline: false,
        strikeThrough: false,
        insertUnorderedList: false,
        insertOrderedList: false,
        justifyLeft: false,
        justifyCenter: false,
        justifyRight: false,
    });

    useEffect(() => {
        if (isEditMode && id) {
            const fetchAcaraDetail = async () => {
                try {
                    const response = await acaraApi.getAcaraById(parseInt(id));
                    setFormData({
                        title: response.title,
                        content: response.content,
                        type: response.type
                    });
                    if (editorRef.current) {
                        editorRef.current.innerHTML = response.content;
                    }
                } catch (error) {
                    setToast({ title: "Gagal memuat data postingan.", variant: "destructive" });
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAcaraDetail();
        }
    }, [id, isEditMode]);

    useEffect(() => {
        if (!isLoading && editorRef.current && formData.content) {
            editorRef.current.innerHTML = formData.content;
        }
    }, [isLoading, formData.content]);

    const escapeHtml = (text: string) => {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    };

    const updateActiveStyles = () => {
        if (typeof document !== "undefined") {
            setActiveStyles({
                bold: document.queryCommandState("bold"),
                italic: document.queryCommandState("italic"),
                underline: document.queryCommandState("underline"),
                strikeThrough: document.queryCommandState("strikeThrough"),
                insertUnorderedList: document.queryCommandState("insertUnorderedList"),
                insertOrderedList: document.queryCommandState("insertOrderedList"),
                justifyLeft: document.queryCommandState("justifyLeft"),
                justifyCenter: document.queryCommandState("justifyCenter"),
                justifyRight: document.queryCommandState("justifyRight"),
            });
        }
    };

    const formatText = (command: string, value: string = "") => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            updateActiveStyles();
        }
    };

    const handleEditorFocus = () => {
        if (editorRef.current) {
            document.execCommand("defaultParagraphSeparator", false, "p");
        }
    };

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG") {
            if (selectedElement) selectedElement.style.outline = "none";
            setSelectedElement(target);
            target.style.outline = "4px solid #00bcd4";
            target.style.outlineOffset = "4px";
        } else {
            if (selectedElement) selectedElement.style.outline = "none";
            setSelectedElement(null);
        }
    };

    const removeSelectedElement = () => {
        if (selectedElement) {
            selectedElement.remove();
            setSelectedElement(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "IMAGE" | "DOC") => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const res = await acaraApi.uploadFile(file);
            const absoluteUrl = `${UPLOADS_URL.replace(/\/$/, "")}${res.url}`;

            if (editorRef.current) {
                editorRef.current.focus();
                const safeFileName = escapeHtml(res.originalName);

                if (type === "IMAGE") {
                    const img = `<img src="${absoluteUrl}" alt="${safeFileName}" class="w-full h-auto max-h-[500px] object-contain rounded-2xl my-8 shadow-xl transition-all cursor-pointer bg-slate-50/30" />`;
                    document.execCommand("insertHTML", false, img);
                } else {
                    const link = `<a href="${absoluteUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[#00bcd4] font-bold no-underline my-2 hover:bg-slate-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ${safeFileName}
                    </a>`;
                    document.execCommand("insertHTML", false, link);
                }
            }
        } catch (error) {
            alert("Gagal mengunggah file.");
        } finally {
            setIsUploading(false);
            if (mediaInputRef.current) mediaInputRef.current.value = "";
            if (docInputRef.current) docInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const content = editorRef.current?.innerHTML || "";
        try {
            if (isEditMode && id) {
                await acaraApi.updateAcara(parseInt(id), { ...formData, content });
                setToast({ title: "Berhasil memperbarui postingan!", variant: "success" });
            } else {
                await acaraApi.createAcara({ ...formData, content });
                setToast({ title: "Berhasil mempublish postingan ke timeline!", variant: "success" });
            }
            setTimeout(() => navigate(routePrefix), 1500);
        } catch (error) {
            setToast({ title: "Gagal menyimpan postingan.", variant: "destructive" });
        }
    };

    return {
        navigate,
        id,
        isEditMode,
        routePrefix,
        isUploading,
        toast,
        setToast,
        selectedElement,
        isLoading,
        isTypeDropdownOpen,
        setIsTypeDropdownOpen,
        dropdownRef,
        editorRef,
        mediaInputRef,
        docInputRef,
        formData,
        setFormData,
        activeStyles,
        formatText,
        updateActiveStyles,
        handleEditorFocus,
        handleEditorClick,
        removeSelectedElement,
        handleFileUpload,
        handleSubmit,
    };
}
