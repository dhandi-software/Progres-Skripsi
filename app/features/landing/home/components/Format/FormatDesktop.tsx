import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, Book, Type, Layout, Image as ImageIcon } from "lucide-react";

export default function FormatDesktop() {
    return (
        <div className="container mx-auto py-12 px-4 max-w-7xl">
             <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>

            <div className="mb-10">
                <h1 className="text-3xl font-bold text-foreground mb-2 uppercase">Format dan Sistematika Penulisan Kerja Praktik</h1>
                <p className="text-muted-foreground">Pedoman standar penyusunan Laporan Kerja Praktik Program Studi Teknik Informatika</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* 1. Kertas & Jilid */}
                <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <Book size={24} />
                            </div>
                            <CardTitle className="text-xl">Media & Penjilidan</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-2 list-disc pl-4 marker:text-blue-400">
                            <li>Ukuran kertas <strong>A4</strong> (210 x 297 mm), bobot <strong>80 gram</strong>.</li>
                            <li>Warna hardcover untuk halaman depan dan belakang adalah <strong>putih</strong>.</li>
                            <li>Pita pembatas halaman berwarna <strong>biru</strong>.</li>
                            <li>Kertas pembatas (separator) antar bab berwarna <strong>biru</strong> dengan logo Universitas Pancasila.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 2. Tipografi */}
                <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                <Type size={24} />
                            </div>
                            <CardTitle className="text-xl">Aturan Tipografi</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-2 list-disc pl-4 marker:text-orange-400">
                            <li>Font: <strong>Times New Roman</strong>, Warna: <strong>Hitam</strong>.</li>
                            <li>Teks Normal: <strong>12 pt</strong>, Spasi <strong>1.5</strong>.</li>
                            <li>Judul Bab: <strong>16 pt</strong>, Bold, UPPERCASE.</li>
                            <li>Sub Judul: <strong>12 pt</strong>, Bold, Sentence Case.</li>
                            <li>Jarak Judul Bab ke teks: <strong>2 baris</strong> (12 pt).</li>
                            <li>Istilah asing dicetak <em>miring (Italic)</em>.</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 3. Layout Margin */}
                <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <Layout size={24} />
                            </div>
                            <CardTitle className="text-xl">Margin & Halaman</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="bg-slate-50 p-3 rounded-md">
                                <p className="font-semibold text-xs uppercase text-slate-400 mb-1">Margin</p>
                                <p>Atas/Kiri: <strong>3 cm</strong></p>
                                <p>Bawah/Kanan: <strong>2.5 cm</strong></p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md">
                                <p className="font-semibold text-xs uppercase text-slate-400 mb-1">Nomor Hal.</p>
                                <p>Atas: <strong>1.5 cm</strong></p>
                                <p>Bawah: <strong>2 cm</strong></p>
                            </div>
                        </div>
                        <ul className="space-y-2 list-disc pl-4 marker:text-green-400">
                            <li><strong>Halaman Judul Bab:</strong> Nomor di Tengah-Bawah.</li>
                            <li><strong>Halaman Lain:</strong> Nomor di Kanan-Atas.</li>
                            <li>Indentasi Paragraf: <strong>1.27 cm</strong> (0.5 inch).</li>
                            <li>Alinea: <strong>Justified</strong> (Rata Kiri-Kanan).</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 4. Tabel & Gambar */}
                <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                <ImageIcon size={24} />
                            </div>
                            <CardTitle className="text-xl">Tabel & Gambar</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-700 leading-relaxed">
                        <ul className="space-y-4 list-none">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">1</div>
                                <span><strong>Judul Tabel</strong> diletakkan di <strong>ATAS</strong> tabel (Alinea Tengah).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">2</div>
                                <span><strong>Judul Gambar</strong> diletakkan di <strong>BAWAH</strong> gambar (Alinea Tengah).</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">3</div>
                                <span>Pemotongan kata tepi kanan disesuaikan kaidah Bahasa Indonesia.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
