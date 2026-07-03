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

    // handleSchedule success
    content = content.replace(/fetchData\(\);\n\s*\} catch/g, match => {
        if (content.includes('Berhasil menyimpan perubahan!')) return match;
        return 'fetchData();\n            setToast({ title: "Berhasil menyimpan perubahan!", variant: "success" });\n        } catch';
    });

    fs.writeFileSync(fullPath, content);
    console.log('Updated ' + file);
});
