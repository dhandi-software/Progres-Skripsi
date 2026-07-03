const fs = require('fs');
const path = require('path');

const files = [
    'app/features/dosen/sidang/SidangDesktop.tsx',
    'app/features/dosen/sidang/SidangMobile.tsx',
    'app/features/dosen/sidang/SidangManagement.tsx',
    'app/features/staf/sidang/StafSidangDesktop.tsx',
    'app/features/staf/sidang/StafSidangMobile.tsx',
    'app/features/mahasiswa/sidang/SidangDesktop.tsx',
    'app/features/mahasiswa/sidang/SidangMobile.tsx'
];

files.forEach(file => {
    const fullPath = path.join('c:/Users/USER/Documents/Skripsi/Pemrograman/Skripsi-Fe', file);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');

    if (!content.includes('Toast from')) {
        content = content.replace(/import \{.*?\} from "lucide-react";/g, match => match + '\nimport { Toast } from "~/components/ui/toast";');
    }

    if (!content.includes('const [toast, setToast]')) {
        content = content.replace(/(const \[isLoading.*?\] = useState.*?;\n)/, match => match + '    const [toast, setToast] = useState<{title: string, variant: "success" | "destructive"} | null>(null);\n');
    }

    // Replace alert with setToast
    content = content.replace(/alert\("Gagal mengajukan sidang."\);/g, 'setToast({ title: "Gagal mengajukan sidang.", variant: "destructive" });');
    content = content.replace(/alert\("Gagal menyimpan jadwal."\);/g, 'setToast({ title: "Gagal menyimpan jadwal.", variant: "destructive" });');
    content = content.replace(/alert\("Gagal menolak."\);/g, 'setToast({ title: "Gagal menolak.", variant: "destructive" });');
    
    content = content.replace(/(setIsScheduling\(null\);\n\s*setIsPembimbingApproving\(false\);\n\s*fetchData\(\);\n\s*)} catch \(error\)/g, '({ title: "Berhasil menyimpan jadwal!", variant: "success" });\n        } catch (error)');
    content = content.replace(/(setIsApplying\(null\);\n\s*fetchData\(\);\n\s*)} catch \(error\)/g, '({ title: "Berhasil mengajukan sidang!", variant: "success" });\n        } catch (error)');
    
    const toastStr = '\n            {toast && (\n                <div className="fixed top-10 right-10 z-[300]">\n                    <Toast \n                        title={toast.title} \n                        variant={toast.variant} \n                        onClose={() => setToast(null)} \n                    />\n                </div>\n            )}\n</div>\n    );\n}';

    if (!content.includes('<Toast')) {
        content = content.replace(/(\s*)<\/div>\s*\)\s*;\s*}\s*$/, toastStr);
    }

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
});
