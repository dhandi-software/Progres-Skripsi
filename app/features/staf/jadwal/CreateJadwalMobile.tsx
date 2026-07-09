import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, Save, CalendarIcon, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Strikethrough, Undo2, Redo2, Indent, Outdent } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { jadwalKpApi } from '~/api/jadwalKpApi';
import type { JadwalKp } from '~/api/jadwalKpApi';
import { CustomSelect } from '~/components/ui/custom-select';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

export function CreateJadwalMobile() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const defaultTipe = searchParams.get('tipe') || 'PENGARAHAN_KP';

    const [formData, setFormData] = useState<Partial<JadwalKp>>({
        tipe: defaultTipe,
        judul: '',
        deskripsi: '',
    });

    const [endDate, setEndDate] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Editor Logic
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeStyles, setActiveStyles] = useState({
        bold: false, italic: false, underline: false, strikeThrough: false,
        insertUnorderedList: false, insertOrderedList: false,
        justifyLeft: false, justifyCenter: false, justifyRight: false,
    });

    const formatText = (command: string, value: string = "") => {
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            updateActiveStyles();
        }
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

    const handleEditorFocus = () => {
        if (editorRef.current) {
            document.execCommand("defaultParagraphSeparator", false, "p");
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const content = editorRef.current?.innerHTML || "";
        try {
            await jadwalKpApi.createJadwalKp({
                ...formData,
                deskripsi: content,
                tanggal: endDate,
                waktu: endTime,
            } as any);
            navigate(`/staf/jadwal?tab=${formData.tipe}&success=true`);
        } catch (error) {
            console.error('Error saving jadwal:', error);
            alert('Gagal menyimpan jadwal');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 font-inter">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-8 h-8 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full flex items-center justify-center transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Tambah Jadwal Baru</h1>
                        <p className="text-xs text-gray-500 mt-1">Lengkapi form di bawah ini untuk membuat jadwal.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4">
                <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <form className="space-y-5 w-full" onSubmit={(e) => e.preventDefault()}>
                        <div className="w-full">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Jadwal</label>
                            <CustomSelect
                                options={[
                                    { label: 'Pengarahan KP', value: 'PENGARAHAN_KP' },
                                    { label: 'Pengumpulan Sidang', value: 'PENGARAHAN_SIDANG' },
                                ]}
                                value={formData.tipe || defaultTipe}
                                onChange={(value) => setFormData({ ...formData, tipe: value })}
                                placeholder="Pilih Tipe Jadwal"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judul / Nama Jadwal</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 text-sm"
                                value={formData.judul}
                                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                                required
                                placeholder="Contoh: Batas Akhir Pengumpulan Berkas Sidang"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Informasi</label>
                            
                            {/* Rich Text Editor Container */}
                            <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:border-[#119DA4] focus-within:ring-1 focus-within:ring-[#119DA4] transition-all group shadow-sm bg-white">
                                {/* Toolbar */}
                                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 transition-colors group-focus-within:bg-white overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5">
                                        <button type="button" onClick={() => formatText("undo")} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-all"><Undo2 size={14} /></button>
                                        <button type="button" onClick={() => formatText("redo")} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-all"><Redo2 size={14} /></button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5">
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("bold")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.bold ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <Bold size={14} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("italic")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.italic ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <Italic size={14} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("underline")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.underline ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <Underline size={14} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("strikeThrough")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.strikeThrough ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <Strikethrough size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1 border-r border-gray-300 pr-1.5">
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("insertUnorderedList")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.insertUnorderedList ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <List size={14} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => formatText("insertOrderedList")} 
                                            className={cn("p-1.5 rounded-lg transition-all", activeStyles.insertOrderedList ? "bg-[#119DA4]/10 text-[#119DA4] shadow-inner" : "hover:bg-gray-200 text-gray-600")}
                                        >
                                            <ListOrdered size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => formatText("outdent")} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-all"><Outdent size={14} /></button>
                                        <button type="button" onClick={() => formatText("indent")} className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-600 transition-all"><Indent size={14} /></button>
                                    </div>
                                </div>

                                {/* ContentEditable Editor */}
                                <div 
                                    ref={editorRef}
                                    contentEditable
                                    onFocus={handleEditorFocus}
                                    onKeyUp={updateActiveStyles}
                                    onMouseUp={updateActiveStyles}
                                    onInput={updateActiveStyles}
                                    className="p-4 max-h-[300px] min-h-[150px] overflow-y-auto outline-none text-gray-900 bg-white leading-relaxed text-sm prose prose-slate max-w-none content-editor custom-scrollbar"
                                    data-placeholder="Tulis informasi jadwal secara lengkap di sini..."
                                />
                                
                                <style dangerouslySetInnerHTML={{ __html: `
                                    [contenteditable]:empty:before {
                                        content: attr(data-placeholder);
                                        color: #9ca3af;
                                        pointer-events: none;
                                        font-style: italic;
                                    }
                                `}} />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-5">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    Tanggal Batas Akhir
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button type="button" className="flex justify-between items-center w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-900 hover:bg-gray-50 focus:ring-2 focus:ring-[#119DA4] outline-none transition-all">
                                            <span>{endDate ? format(new Date(endDate), "dd MMMM yyyy") : "Pilih Tanggal"}</span>
                                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate ? new Date(endDate) : undefined}
                                            onSelect={(date) => date && setEndDate(format(date, "yyyy-MM-dd"))}
                                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                            startMonth={new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">
                                    Waktu Batas Akhir
                                </label>
                                <input
                                    type="time"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#119DA4] outline-none text-gray-900 text-sm h-[46px]"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => navigate(-1)}
                                disabled={isSubmitting}
                                className="w-full"
                            >
                                Batal
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button 
                                        type="button" 
                                        disabled={isSubmitting || !endDate || !endTime || !formData.judul}
                                        className="gap-2 bg-[#119DA4] hover:bg-[#0f8b91] text-white w-full"
                                    >
                                        <Save className="w-4 h-4" /> 
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="w-[90%] max-w-sm rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-sm">
                                            Jadwal baru akan dibuat dan diumumkan.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col gap-2 mt-4">
                                        <AlertDialogAction onClick={handleSubmit} className="bg-[#119DA4] hover:bg-[#0f8b91] text-white w-full m-0">
                                            Yakin & Simpan
                                        </AlertDialogAction>
                                        <AlertDialogCancel className="w-full m-0">Batal</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
