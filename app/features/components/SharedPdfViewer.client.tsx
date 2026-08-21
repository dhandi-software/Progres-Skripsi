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
}

const getNextId = () => String(Math.random()).slice(2);

const GlobalPdfStyles = () => (
    <style>{`
        /* Fix for pdf.js textLayer causing stretched highlights */
        .textLayer {
            opacity: 1 !important;
            line-height: 1.0;
        }
        .textLayer > span {
            color: transparent !important;
            position: absolute !important;
            white-space: pre !important;
            cursor: text;
            transform-origin: 0% 0%;
        }
        /* Prevent highlight from extending to the end of the line (usually caused by br tags or trailing space) */
        .textLayer br {
            display: none !important;
        }
        .textLayer ::selection {
            background: rgba(255, 255, 0, 0.3) !important;
        }
        /* Make highlight thicker (solid) */
        .Highlight__part {
            background-color: #facc15 !important; /* Tailwind yellow-400 for a solid, thick yellow */
            mix-blend-mode: multiply !important;
            border-radius: 2px !important;
        }
    `}</style>
);

const HighlightPopup = ({
    comment,
}: {
    comment: { text: string };
}) =>
    comment?.text ? (
        <div className="p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-max max-w-[280px] break-words whitespace-normal z-[200] relative">
            {comment.text}
        </div>
    ) : null;

const TipComponent = ({ content, position, hideTipAndSelection, addHighlight, onStartSidebarComment }: any) => {
    const [isCommenting, setIsCommenting] = useState(false);

    // Automatically prepare the sidebar comment when this tip is mounted
    useEffect(() => {
        onStartSidebarComment({ content, position, hideTipAndSelection });
        return () => {
            // When TipComponent unmounts (because user clicked away or started a new selection),
            // we MUST clear the sidebar comment so they don't get locked!
            onStartSidebarComment(null);
        };
    }, [content, position, hideTipAndSelection, onStartSidebarComment]);

    if (!isCommenting) {
        return (
            <div className="flex gap-2 z-[200] relative group mt-1">
                <div 
                    className="bg-white shadow-xl rounded-full px-4 py-2 cursor-pointer hover:bg-gray-50 border border-gray-200 flex items-center justify-center gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCommenting(true);
                        // If they choose to comment here, we can hide the sidebar one to avoid confusion
                        onStartSidebarComment(null);
                    }}
                >
                    <MessageSquarePlus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">Komentar di Sini</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-3 bg-white shadow-xl rounded-xl border border-gray-100 w-64 z-[100] relative mt-2">
            <textarea
                className="w-full text-sm p-2 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-orange-500 min-h-[80px]"
                placeholder="Tambahkan komentar..."
                autoFocus
                onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        const text = event.currentTarget.value;
                        if (text.trim()) {
                            addHighlight({
                                content,
                                position,
                                comment: { text, emoji: "" },
                            });
                            hideTipAndSelection();
                        }
                    }
                }}
            />
            <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-gray-400">Tekan Enter untuk simpan</p>
                <button 
                  onClick={hideTipAndSelection}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Batal
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
    onDeleteHighlight
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
    }, []);

    return (
        <div className="flex flex-col md:flex-row h-[70vh] w-full border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
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
        </div>
    );
};

export const SharedPdfViewer = memo(SharedPdfViewerComponent, (prevProps, nextProps) => {
    if (prevProps.url !== nextProps.url) return false;
    if (prevProps.readOnly !== nextProps.readOnly) return false;
    if (prevProps.initialHighlights !== nextProps.initialHighlights) return false;
    return true;
});
