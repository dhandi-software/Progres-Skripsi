import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import type { ChatContact } from "~/types/chat";
import { Search, X } from "lucide-react";
import Avatar from "~/components/ui/avatar";

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    contacts: ChatContact[];
    currentMemberIds: number[];
    onAdd: (participantIds: number[]) => Promise<void>;
}

export function AddMemberModal({ isOpen, onClose, contacts, currentMemberIds, onAdd }: AddMemberModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedIds([]);
            setSearchQuery("");
        }
    }, [isOpen]);

    const availableContacts = useMemo(() => {
        // Hanya tampilkan mahasiswa yang belum bergabung di dalam grup
        return contacts.filter((c) => 
            c.role?.toUpperCase() === "MAHASISWA" && 
            !currentMemberIds.includes(c.id as number)
        );
    }, [contacts, currentMemberIds]);
    
    const filteredContacts = availableContacts.filter((c) =>
        c.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedContacts = useMemo(() => {
        return availableContacts.filter(c => selectedIds.includes(c.id as number));
    }, [availableContacts, selectedIds]);

    const handleToggle = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleRemoveSelected = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIds(prev => prev.filter(i => i !== id));
    };

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        
        setIsSubmitting(true);
        try {
            await onAdd(selectedIds);
            onClose();
        } catch (error) {
            console.error("Failed to add members:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tambah Anggota Grup</DialogTitle>
                    <DialogDescription>
                        Pilih mahasiswa yang ingin Anda tambahkan ke dalam grup ini.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Pilih Mahasiswa ({selectedIds.length} dipilih)</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari nama mahasiswa..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        {/* Selected Badges Area */}
                        {selectedContacts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 max-h-[80px] overflow-y-auto custom-scrollbar">
                                {selectedContacts.map(sc => (
                                    <div key={`badge-${sc.id}`} className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full text-xs font-medium">
                                        <span className="max-w-[80px] truncate">{sc.username}</span>
                                        <button 
                                            onClick={(e) => handleRemoveSelected(sc.id as number, e)}
                                            className="ml-0.5 hover:bg-green-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div className="h-[250px] overflow-y-auto border rounded-md p-2 mt-2 flex flex-col gap-1 custom-scrollbar">
                            {filteredContacts.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground p-4">
                                    {availableContacts.length === 0 ? "Tidak ada mahasiswa tersisa untuk ditambahkan." : "Tidak ada mahasiswa yang ditemukan."}
                                </p>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <div 
                                        key={contact.id} 
                                        className="flex items-center space-x-3 p-2 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
                                        onClick={() => handleToggle(contact.id as number)}
                                    >
                                        <Checkbox 
                                            id={`contact-${contact.id}`} 
                                            checked={selectedIds.includes(contact.id as number)}
                                            className="pointer-events-none"
                                            tabIndex={-1}
                                        />
                                        <Avatar 
                                            className="h-8 w-8 bg-[#dfe3e5]"
                                            src=""
                                            fallback={!contact.username ? "M" : contact.username.substring(0,2).toUpperCase()}
                                        />
                                        <label
                                            htmlFor={`contact-${contact.id}`}
                                            className="text-sm font-medium leading-none flex-1 pointer-events-none"
                                        >
                                            {contact.username}
                                        </label>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Batal</Button>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={selectedIds.length === 0 || isSubmitting}
                        className="bg-[#00a884] hover:bg-[#008f6f]"
                    >
                        {isSubmitting ? "Menambahkan..." : "Tambah Anggota"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
