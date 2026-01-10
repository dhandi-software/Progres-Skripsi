import { Link } from "react-router";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function NewFooter() {
    return (
        <footer className="w-full bg-white border-t border-zinc-200 py-12">
            <div className="container mx-auto px-4 md:px-6 flex flex-col gap-12">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-3">
                         <img 
                            src="https://upload.wikimedia.org/wikipedia/id/thumb/4/46/Logo_Universitas_Pancasila.png/250px-Logo_Universitas_Pancasila.png" 
                            alt="Logo UP" 
                            className="h-12 w-auto"
                        />
                        <span className="text-xl font-bold text-zinc-950">SIKP Pertambangan</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-8 text-sm font-medium text-gray-500">
                        <Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link>
                        <Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link>
                        <Link to="/privacy" className="hover:text-orange-500 transition-colors">Terms & Privacy</Link>
                    </div>
                </div>

                {/* Partners/Copyright Section */}
                <div className="flex flex-col md:flex-row justify-between items-end border-t border-zinc-100 pt-8 gap-6">
                    <div className="text-xs text-gray-400">
                        © 2026 Mining Engineering Universitas Pancasila. All rights reserved.
                    </div>

                    <div className="flex flex-col items-start gap-2">
                         <span className="text-sm font-medium text-zinc-900">Follow us on</span>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer">
                                <Facebook className="w-4 h-4 text-zinc-700" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer">
                                <Instagram className="w-4 h-4 text-zinc-700" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center hover:bg-orange-100 transition-colors cursor-pointer">
                                <Linkedin className="w-4 h-4 text-zinc-700" />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
