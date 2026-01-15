import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Book, Type, Layout, Image as ImageIcon } from "lucide-react";

export default function FormatMobile() {
    return (
        <div className="container mx-auto py-8 px-4 w-full">
             <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Link>
            </Button>

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground mb-2 uppercase">Format & Sistematika</h1>
                <p className="text-sm text-muted-foreground">Pedoman penyusunan Laporan Kerja Praktik.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* 1. Kertas & Jilid */}
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Book size={20} />
                            </div>
                            <CardTitle className="text-lg">Media & Penjilidan</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-2 list-disc pl-4 marker:text-blue-400">
                            <li>Kertas <strong>A4</strong> (80 gram).</li>
                            <li>Hardcover <strong>putih</strong>.</li>
                            <li>Pembatas/Pita: <strong>Biru</strong> + Logo UP.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 2. Tipografi */}
                <Card className="border-l-4 border-l-orange-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Type size={20} />
                            </div>
                            <CardTitle className="text-lg">Tipografi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-2 list-disc pl-4 marker:text-orange-400">
                            <li>Font: <strong>Times New Roman</strong> 12pt (Hitam).</li>
                            <li>Spasi: <strong>1.5</strong>.</li>
                            <li>Judul Bab: 16pt Bold UPPER.</li>
                            <li>Sub Judul: 12pt Bold Sentence.</li>
                            <li>Istilah asing: <em>Italic</em>.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 3. Layout Margin */}
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Layout size={20} />
                            </div>
                            <CardTitle className="text-lg">Margin & Halaman</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                         <div className="bg-slate-50 p-3 rounded-md mb-2 text-xs">
                            <p><strong>Margin:</strong> Atas/Kiri 3cm, Bawah/Kanan 2.5cm.</p>
                            <p><strong>Hal:</strong> Judul (Tengah-Bawah), Isi (Kanan-Atas).</p>
                        </div>
                         <ul className="space-y-1 list-disc pl-4 marker:text-green-400 text-xs">
                            <li>Indentasi: 1.27 cm.</li>
                            <li>Alinea: Justified.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 4. Tabel & Gambar */}
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <ImageIcon size={20} />
                            </div>
                            <CardTitle className="text-lg">Tabel & Gambar</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-3 list-none">
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-[10px] shrink-0">1</div>
                                <span>Judul Tabel: <strong>ATAS</strong> (Tengah).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-[10px] shrink-0">2</div>
                                <span>Judul Gambar: <strong>BAWAH</strong> (Tengah).</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
