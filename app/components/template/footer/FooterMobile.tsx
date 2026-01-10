import { Link } from "react-router";
import { Facebook, Instagram, Linkedin, Twitter, MapPin, Mail, Phone } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export default function FooterMobile() {
    return (
        <footer className="bg-foreground text-background py-10 px-4">
            <div className="flex flex-col items-center text-center space-y-6">
                <div>
                     <span className="text-xl font-bold text-white">Sistem KP</span>
                     <p className="text-gray-400 text-sm mt-3 max-w-xs mx-auto">
                        Platform terintegrasi untuk pengelolaan Kerja Praktek.
                    </p>
                </div>
                
                <div className="flex gap-4">
                     <a href="#" className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"><Facebook size={18} /></a>
                     <a href="#" className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"><Twitter size={18} /></a>
                     <a href="#" className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"><Instagram size={18} /></a>
                     <a href="#" className="p-2 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors"><Linkedin size={18} /></a>
                </div>

                <div className="w-full space-y-4 text-sm text-gray-400">
                    <Separator className="bg-white/10" />
                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="space-y-3">
                            <h5 className="font-semibold text-white">Menu</h5>
                            <ul className="space-y-2">
                                <li><Link to="/">Beranda</Link></li>
                                <li><Link to="/news">Berita</Link></li>
                                <li><Link to="/guide">Panduan</Link></li>
                                <li><Link to="/login">Login</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h5 className="font-semibold text-white">Kontak</h5>
                            <ul className="space-y-2">
                                <li>admin@prodi.ac.id</li>
                                <li>(021) 1234-5678</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-gray-500 pt-6">
                    &copy; {new Date().getFullYear()} Sistem Informasi Kerja Praktek.
                </div>
            </div>
        </footer>
    );
}