import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { PdfLoader, PdfHighlighter, Highlight, Popup, AreaHighlight } from "react-pdf-highlighter";
import type { IHighlight, NewHighlight } from "react-pdf-highlighter";
import { Loader2, Trash2, Maximize2, MessageSquarePlus } from "lucide-react";

interface SharedPdfViewerProps {
    url: string;
    readOnly?: boolean;
    initialHighlights?: IHighlight[];
    onAddHighlight?: (highlight: NewHighlight) => void;
    onDeleteHighlight?: (id: string) => void;
}

const getNextId = () => String(Math.random()).slice(2);

const HighlightPopup = ({
    comment,
}: {
    comment: { text: string };
}) =>
    comment?.text ? (
        <div className="p-2 bg-gray-800 text-white text-xs rounded shadow-lg w-max max-w-[280px] break-words z-[200] relative">
            {comment.text}
        </div>
    ) : null;

const TipComponent = ({ content, position, hideTipAndSelection, addHighlight }: any) => {
    const [isCommenting, setIsCommenting] = useState(false);

    if (!isCommenting) {
        return (
            <div 
                className="bg-white shadow-xl rounded-full p-2 cursor-pointer hover:bg-gray-100 border border-gray-200 flex items-center justify-center w-12 h-12 z-[200] relative group mt-2"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsCommenting(true);
                }}
            >
                <MessageSquarePlus className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
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
            <div className="flex-1 relative h-full">
                <PdfLoader 
                    url={url} 
                    workerSrc="https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js"
                    beforeLoad={
                        <div className="flex w-full h-full items-center justify-center">
                            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
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
            <div className="w-full md:w-80 bg-white border-l border-gray-200 h-full overflow-y-auto p-4 shrink-0 flex flex-col gap-3">
                <h4 className="font-bold text-gray-800 text-sm border-b pb-2">Catatan Reviu ({(highlights || []).length})</h4>
                {highlights.length === 0 ? (
                    <div className="text-gray-400 text-xs italic text-center mt-10">Belum ada coretan/anotasi</div>
                ) : (
                    highlights.map((h, i) => (
                        <div 
                            key={h.id || i} 
                            onClick={() => scrollViewerTo.current && scrollViewerTo.current(h)}
                            className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl relative group cursor-pointer hover:bg-orange-100/50 transition-colors"
                        >
                            {h.content?.text && (
                                <blockquote className="border-l-2 border-orange-400 pl-2 text-xs text-gray-500 italic mb-2 line-clamp-3">
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
    // We don't check function references like onAddHighlight because they might be inline in parent
    if (prevProps.initialHighlights !== nextProps.initialHighlights) return false;
    return true;
});
