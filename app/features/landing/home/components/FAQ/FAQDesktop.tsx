import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function FAQDesktop() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-7xl">
      <div className="mb-8">
          <Button asChild variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-brand-primary">
            <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
            </Link>
          </Button>

          <div className="flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-brand-primary" />
              <h1 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h1>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-3 text-foreground">Berapa lama durasi minimal Kerja Praktek?</h3>
          <p className="text-muted-foreground leading-relaxed">Durasi minimal pelaksanaan Kerja Praktek adalah 1 bulan atau setara dengan 160 jam kerja efektif di perusahaan.</p>
        </div>
        <div className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-3 text-foreground">Apakah boleh KP di perusahaan startup?</h3>
          <p className="text-muted-foreground leading-relaxed">Boleh, selama perusahaan tersebut memiliki badan hukum yang jelas (PT/CV) dan kegiatan yang dilakukan relevan dengan program studi.</p>
        </div>
        <div className="border rounded-xl p-6 bg-card hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg mb-3 text-foreground">Bagaimana jika saya ditolak oleh perusahaan?</h3>
          <p className="text-muted-foreground leading-relaxed">Anda dapat mengajukan surat pengantar baru untuk perusahaan lain. Hubungi Koordinator KP untuk prosedur pembatalan surat sebelumnya.</p>
        </div>
        {/* Added placeholder for more Q&A if needed to show grid effect */}
      </div>
    </div>
  );
}
