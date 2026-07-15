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
    
    // Add success toast to handleSchedule and others
    content = content.replace(/(fetchData\(\);\n\s*)} catch \(error\)/g, match => {
        if (content.includes('Berhasil menyimpan jadwal')) return match;
        return 'setToast({ title: "Berhasil menyimpan perubahan!", variant: "success" });\n' + match;
    });
    
    const toastStr = '\n            {toast && (\n                <div className="fixed top-10 right-10 z-[300]">\n                    <Toast \n                        title={toast.title} \n                        variant={toast.variant} \n                        onClose={() => setToast(null)} \n                    />\n                </div>\n            )}\n</div>\n    );\n}';

    if (!content.includes('<Toast')) {
        content = content.replace(/(\s*)<\/div>\s*\)\s*;\s*}\s*$/, toastStr);
    }

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
});
