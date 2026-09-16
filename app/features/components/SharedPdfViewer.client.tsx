import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight } from "react-pdf-highlighter";
import type { IHighlight, NewHighlight } from "react-pdf-highlighter";
import "react-pdf-highlighter/dist/esm/style/AreaHighlight.css";
import "react-pdf-highlighter/dist/esm/style/Highlight.css";
import "react-pdf-highlighter/dist/esm/style/PdfHighlighter.css";
import { Loader2, Trash2, Maximize2, MessageSquarePlus } from "lucide-react";

interface SharedPdfViewerProps {
    url: string;
    readOnly?: boolean;
    initialHighlights?: IHighlight[];
    onAddHighlight?: (highlight: NewHighlight) => void;
    onDeleteHighlight?: (id: string) => void;
    showSidebar?: boolean;
    scrollRef?: (scrollTo: (highlight: any) => void) => void;
}

const getNextId = () => String(Math.random()).slice(2);

const GlobalPdfStyles = () => (
    <style>{`
        /* Fix for pdf.js textLayer causing stretched highlights & touch selection */
        .textLayer {
            opacity: 1 !important;
            line-height: 1.0 !important;
            pointer-events: auto !important;
        }
        .textLayer > span {
            color: transparent !important;
            position: absolute !important;
            white-space: pre !important;
            cursor: text !important;
            transform-origin: 0% 0% !important;
            user-select: text !important;
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            pointer-events: auto !important;
        }
        /* Custom highlight styling */
        .Highlight__part {
            background: rgba(255, 226, 0, 0.45) !important;
            border-bottom: 2px solid #f59e0b !important;
            cursor: pointer;
        }
        .PdfHighlighter {
            width: 100% !important;
            height: 100% !important;
            overflow: auto !important;
            -webkit-overflow-scrolling: touch !important;
        }
        .PdfHighlighter__tip-container {
            z-index: 9999 !important;
        }
    `}</style>
);

const HighlightPopup = ({
    comment,
}: {
    comment: { text: string };
}) =>
    comment?.text ? (
        <div className="p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl w-max max-w-[280px] break-words whitespace-normal z-[9999] relative border border-slate-700">
            {comment.text}
        </div>
    ) : null;

const TipComponent = ({ content, position, hideTipAndSelection, addHighlight, onStartSidebarComment }: any) => {
    const [commentText, setCommentText] = useState("");

    useEffect(() => {
        if (onStartSidebarComment) {
            onStartSidebarComment({ content, position, hideTipAndSelection });
        }
        return () => {
            if (onStartSidebarComment) onStartSidebarComment(null);
        };
    }, [content, position, hideTipAndSelection, onStartSidebarComment]);

    const handleSave = () => {
        if (commentText.trim()) {
            addHighlight({
                content,
                position,
                comment: { text: commentText.trim(), emoji: "" },
            });
            hideTipAndSelection();
        }
    };

    return (
        <div 
            className="p-3.5 bg-slate-900 text-white shadow-2xl rounded-2xl border border-slate-700 w-72 z-[9999] relative mt-2 animate-in fade-in zoom-in-95 duration-200"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#00bcd4] mb-2">
                <MessageSquarePlus className="w-4 h-4 text-[#00bcd4]" />
                <span>Tambah Catatan Anotasi</span>
            </div>
            {content?.text && (
                <blockquote className="border-l-2 border-amber-400 pl-2.5 py-1 text-[11px] text-amber-200/90 italic bg-amber-500/10 rounded-r-lg mb-2.5 line-clamp-3 break-words whitespace-normal font-serif">
                    "{content.text}"
                </blockquote>
            )}
            <textarea
                className="w-full text-xs p-2.5 bg-slate-950 text-white rounded-xl border border-slate-800 outline-none focus:border-[#00bcd4] min-h-[75px] resize-none"
                placeholder="Ketik catatan revisi untuk bagian ini..."
                autoFocus
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSave();
                    }
                }}
            />
            <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-slate-800">
                <button
                    onClick={hideTipAndSelection}
                    className="text-xs text-rose-400 font-bold hover:underline px-2 py-1"
                >
                    Batal
                </button>
                <button
                    onClick={handleSave}
                    disabled={!commentText.trim()}
                    className="text-xs bg-[#00bcd4] hover:bg-[#00acc1] disabled:opacity-50 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl shadow transition-all"
                >
                    Simpan Anotasi
                </button>
            </div>
        </div>
    );
};

const SharedPdfViewerComponent: React.FC<SharedPdfViewerProps> = ({
    url,
    readOnly = false,
    initialHighlights = [],
    onAddHighlight,
    onDeleteHighlight,
    showSidebar = true,
    scrollRef
}) => {
    const [highlights, setHighlights] = useState<IHighlight[]>(initialHighlights);
    const [pendingSidebarComment, setPendingSidebarComment] = useState<{
        content: any;
        position: any;
        hideTipAndSelection: () => void;
    } | null>(null);

    useEffect(() => {
        setHighlights(initialHighlights);
    }, [initialHighlights]);

    const addHighlight = (highlight: NewHighlight) => {
        const newHighlight: IHighlight = { ...highlight, id: getNextId() };
        setHighlights([newHighlight, ...highlights]);
        if (onAddHighlight) onAddHighlight(newHighlight);
    };

    const handleScrollChange = useCallback(() => {}, []);
    
    const scrollViewerTo = useRef<any>(null);
    const handleScrollRef = useCallback((scrollTo: any) => {
        scrollViewerTo.current = scrollTo;
        if (scrollRef) scrollRef(scrollTo);
    }, [scrollRef]);

    return (
        <div className="flex flex-col md:flex-row h-full w-full border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900 shadow-inner">
            <GlobalPdfStyles />
            <div className="flex-1 relative h-full">
                <PdfLoader 
                    url={url} 
                    workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js"
                    beforeLoad={
                        <div className="flex w-full h-full items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                        </div>
                    }
                    errorMessage={
                        <div className="flex flex-col items-center justify-center h-full p-2 text-center bg-white">
                            <iframe src={url} className="w-full h-full min-h-[500px] rounded-lg border border-gray-200" title="PDF Viewer" />
                        </div>
                    }
                >
                    {(pdfDocument) => (
                        <PdfHighlighter
                            pdfDocument={pdfDocument}
                            enableAreaSelection={(event) => event.altKey}
                            onScrollChange={handleScrollChange}
                            scrollRef={handleScrollRef}
                            onSelectionFinished={(
                                position,
                                content,
                                hideTipAndSelection,
                                transformSelection
                            ) => {
                                if (readOnly) return null;
                                
                                return (
                                    <TipComponent 
                                        content={content}
                                        position={position}
                                        hideTipAndSelection={hideTipAndSelection}
                                        addHighlight={addHighlight}
                                        onStartSidebarComment={setPendingSidebarComment}
                                    />
                                );
                            }}
                            highlightTransform={(
                                highlight,
                                index,
                                setTip,
                                hideTip,
                                viewportToScaled,
                                screenshot,
                                isScrolledTo
                            ) => {
                                const isTextHighlight = !highlight.content?.image;

                                const component = isTextHighlight ? (
                                    <Highlight
                                        isScrolledTo={isScrolledTo}
                                        position={highlight.position}
                                        comment={highlight.comment}
                                    />
                                ) : (
                                    <AreaHighlight
                                        isScrolledTo={isScrolledTo}
                                        highlight={highlight}
                                        onChange={(boundingRect) => {
                                            // Handling dynamic scaling
                                        }}
                                    />
                                );

                                return (
                                    <Popup
                                        popupContent={<HighlightPopup comment={highlight.comment as { text: string }} />}
                                        onMouseOver={(popupContent) =>
                                            setTip(highlight, (highlight) => popupContent)
                                        }
                                        onMouseOut={hideTip}
                                        key={index}
                                        children={component}
                                    />
                                );
                            }}
                            highlights={highlights}
                        />
                    )}
                </PdfLoader>
            </div>

            {/* Sidebar for highlights */}
            {showSidebar && (
                <div 
                    className="w-full md:w-80 bg-white border-l border-gray-200 h-full overflow-y-auto p-4 shrink-0 flex flex-col gap-3"
                    onMouseDown={(e) => e.stopPropagation()} // Prevent clicks here from unmounting the PDF tip!
                >
                    <h4 className="font-bold text-gray-800 text-sm border-b pb-2">Catatan Reviu ({(highlights || []).length})</h4>
                    
                    {pendingSidebarComment && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl relative shadow-sm">
                            <p className="text-xs text-orange-600 mb-2 font-semibold flex items-center gap-1">
                                <MessageSquarePlus className="w-3.5 h-3.5" />
                                Tambah Komentar Baru
                            </p>
                            {pendingSidebarComment.content?.text && (
                                <blockquote className="border-l-2 border-orange-300 pl-2 text-[10px] text-gray-500 italic mb-2 line-clamp-3 break-words whitespace-normal">
                                    "{pendingSidebarComment.content.text}"
                                </blockquote>
                            )}
                            <textarea
                                className="w-full text-sm p-2 bg-white rounded-lg border border-orange-200 outline-none focus:border-orange-500 min-h-[80px]"
                                placeholder="Ketik komentarmu di sini..."
                                autoFocus
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && !event.shiftKey) {
                                        event.preventDefault();
                                        const text = event.currentTarget.value;
                                        if (text.trim()) {
                                            addHighlight({
                                                content: pendingSidebarComment.content,
                                                position: pendingSidebarComment.position,
                                                comment: { text, emoji: "" },
                                            });
                                            pendingSidebarComment.hideTipAndSelection();
                                        }
                                    }
                                }}
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-[10px] text-gray-400">Tekan Enter untuk simpan</p>
                                <button 
                                  onClick={() => pendingSidebarComment.hideTipAndSelection()}
                                  className="text-xs text-red-500 font-medium hover:underline px-2 py-1 rounded"
                                >
                                  Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {highlights.length === 0 && !pendingSidebarComment ? (
                        <div className="text-gray-400 text-xs italic text-center mt-10">Belum ada coretan/anotasi</div>
                    ) : (
                        highlights.map((h, i) => (
                            <div 
                                key={h.id || i} 
                                onClick={() => scrollViewerTo.current && scrollViewerTo.current(h)}
                                className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl relative group cursor-pointer hover:bg-orange-100/50 transition-colors"
                            >
                                {h.content?.text && (
                                    <blockquote className="border-l-2 border-orange-400 pl-2 text-xs text-gray-500 italic mb-2 line-clamp-3 break-words whitespace-normal">
                                        "{h.content.text}"
                                    </blockquote>
                                )}
                                <div className="text-sm font-medium text-gray-800 break-words">
                                    {h.comment?.text || "Area disorot"}
                                </div>
                                {!readOnly && onDeleteHighlight && (
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation();
                                            setHighlights(prev => prev.filter(x => x.id !== h.id));
                                            onDeleteHighlight(h.id); 
                                        }}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer hover:cursor-grab active:cursor-grabbing"
                                        title="Hapus anotasi"
                                    >
                                        <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export const SharedPdfViewer = memo(SharedPdfViewerComponent, (prevProps, nextProps) => {
    if (prevProps.url !== nextProps.url) return false;
    if (prevProps.readOnly !== nextProps.readOnly) return false;
    if (prevProps.showSidebar !== nextProps.showSidebar) return false;
    if (prevProps.initialHighlights !== nextProps.initialHighlights) return false;
    return true;
});
