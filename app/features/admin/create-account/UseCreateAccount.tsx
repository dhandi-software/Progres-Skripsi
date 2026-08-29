import { useState, useEffect } from "react";
import { userApi } from "~/api/userApi";
import { useNavigate, useSearchParams } from "react-router";
import * as XLSX from 'xlsx';

interface ToastProps {
  title: string;
  variant: "success" | "destructive" | "default";
}

export const useCreateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");

  const [registrationMode, setRegistrationMode] = useState<"manual" | "mass">("manual");
  const [massData, setMassData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    emailPrefix: "",
    emailDomain: "@univpancasila.ac.id",
    name: "",
    password: "",
    role: "mahasiswa", 
    // Specific fields
    nim: "",
    tahunMasuk: "",
    sksDicapai: "",
    ipk: "",
    sksNilaiD: "",
    batasStudi: "",
    nidn: "",
    nip: "",
    jabatan: "",
    peminatan: [] as string[],
    maxBimbingan: "",
  });

  const [isValidRole, setIsValidRole] = useState(true);

  // Sync role with URL param on mount
  useEffect(() => {
    if (roleParam) {
        if (roleParam === "mahasiswa" || roleParam === "dosen" || roleParam === "staf") {
            setIsValidRole(true);
            setFormData(prev => ({ 
                ...prev, 
                role: roleParam,
                emailDomain: prev.emailDomain || "@univpancasila.ac.id",
                jabatan: roleParam === 'dosen' ? "Dosen Reguler" : prev.jabatan
            }));
        } else {
            setIsValidRole(false);
        }
    } else {
        setIsValidRole(true);
    }
  }, [roleParam]);

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = (
    title: string,
    variant: "success" | "destructive" | "default" = "success"
  ) => {
    setToastProps({ title, variant });
    setTimeout(() => {
      setToastProps(null);
    }, 5000);
  };

  const formatIpk = (val: string) => {
    let clean = val.replace(/[^\d.]/g, '');
    if (clean.includes('.')) {
        const parts = clean.split('.');
        const intPart = parts[0].slice(0, 1);
        const decPart = parts[1].slice(0, 2);
        return `${intPart}.${decPart}`;
    }
    if (clean.length === 0) return '';
    if (clean.length === 1) return clean;
    if (clean.length === 2) return `${clean[0]}.${clean[1]}`;
    if (clean.length >= 3) return `${clean[0]}.${clean.slice(1, 3)}`;
    return clean;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    
    // Numeric validation for NIM, NIDN, NIP, SKS
    if ((name === "nim" || name === "nidn" || name === "nip" || name === "sksDicapai" || name === "sksNilaiD") && value && !/^\d*$/.test(value)) {
        return;
    }

    if (name === "ipk") {
        value = formatIpk(value);
    }

    if (name === "emailPrefix") {
        value = value.toLowerCase().replace(/\s+/g, "").replace(/@.*/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [rawExcelBinary, setRawExcelBinary] = useState<any>(null);

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ 
        ...prev, 
        role,
        emailDomain: prev.emailDomain || "@univpancasila.ac.id",
        jabatan: role === 'dosen' ? "Dosen Reguler" : prev.jabatan
    }));
    // User requested to reset the excel file when switching roles
    setMassData([]);
    setFileName(null);
    setRawExcelBinary(null);
  };

  const clearExcel = () => {
    setMassData([]);
    setFileName(null);
    setRawExcelBinary(null);
  };

  const parseExcelData = (bstr: any, role: string) => {
    try {
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        let headerRowIdx = -1;
        let idColIdx = -1; // NIM or NIDN
        let namaColIdx = -1;
        let emailColIdx = -1;
        let jabatanColIdx = -1;
        let peminatanColIdx = -1;
        let sksColIdx = -1;
        let ipkColIdx = -1;
        let sksNilaiDColIdx = -1;
        let batasStudiColIdx = -1;
        
        const isMahasiswa = role === 'mahasiswa';

        for (let i = 0; i < data.length; i++) {
             const row = data[i] as any[];
             if (!row || !Array.isArray(row)) continue;
             
             for (let j = 0; j < row.length; j++) {
                  const cellText = String(row[j] || '').toLowerCase().trim();
                  
                  // ID detection (NIM/NPM or NIDN/NIP)
                  if (isMahasiswa) {
                      if (cellText.includes('npm') || cellText.includes('nim') || cellText.includes('n p m') || cellText.includes('n.p.m') || cellText.includes('n.i.m') || cellText.includes('no mhs') || cellText.includes('no mahasiswa') || cellText.includes('nomor mahasiswa') || cellText === 'no') {
                          idColIdx = j;
                          headerRowIdx = i;
                      }
                      if (cellText.includes('sks dicapai') || cellText === 'sks' || cellText.includes('sks (tanpa')) {
                          sksColIdx = j;
                      }
                      if (cellText === 'ipk' || cellText.includes('indeks prestasi')) {
                          ipkColIdx = j;
                      }
                      if (cellText.includes('tidak lulus') || cellText.includes('d dan e') || cellText.includes('sks d') || cellText.includes('nilai d')) {
                          sksNilaiDColIdx = j;
                      }
                      if (cellText.includes('batas studi') || cellText.includes('batas')) {
                          batasStudiColIdx = j;
                      }
                  } else {
                      if (cellText.includes('nidn') || cellText.includes('nip') || cellText.includes('n.i.d.n') || cellText.includes('n.i.p') || cellText.includes('no dosen')) {
                          idColIdx = j;
                          headerRowIdx = i;
                      }
                  }

                  if (cellText.includes('nama') || cellText.includes('name')) {
                       namaColIdx = j;
                  }
                  if (cellText.includes('email') || cellText.includes('e-mail') || cellText === 'mail') {
                       emailColIdx = j;
                  }
                  if (!isMahasiswa && (cellText === 'jabatan' || cellText === 'position' || cellText.includes('jabat'))) {
                       jabatanColIdx = j;
                  }
                  if (!isMahasiswa && (cellText.includes('peminatan') || cellText.includes('minat') || cellText.includes('keahlian') || cellText.includes('bidang') || cellText.includes('topik'))) {
                       peminatanColIdx = j;
                  }
             }
             if (idColIdx !== -1 && namaColIdx !== -1) break;
        }

        if (headerRowIdx === -1 || idColIdx === -1 || namaColIdx === -1) {
             const idLabel = isMahasiswa ? "NIM/NPM" : "NIDN/NIP";
             showToast(`Could not find ${idLabel} and Nama columns in Excel`, "destructive");
             setMassData([]);
             return;
        }

        const mappedData = [];
        for (let i = headerRowIdx + 1; i < data.length; i++) {
             const row = data[i] as any[];
             if (!row || row.length === 0) continue;

             const idVal = String(row[idColIdx] || '').trim();
             const nama = String(row[namaColIdx] || '').trim();

             if (!idVal || !nama) continue; 
             
             // Skip if it looks like header again
             if (idVal.toLowerCase() === 'nim' || idVal.toLowerCase() === 'npm' || 
                 idVal.toLowerCase() === 'nidn' || idVal.toLowerCase() === 'nip' || 
                 nama.toLowerCase() === 'nama') continue;

             // Generate Email
             let email = emailColIdx !== -1 ? String(row[emailColIdx] || '').trim() : "";
             if (!email) {
                 email = isMahasiswa ? `${idVal}@student.univ.ac.id` : `${idVal}@univ.ac.id`;
             }

             // Handle Jabatan for Dosen
             let jabatan = "Dosen";
             if (!isMahasiswa && jabatanColIdx !== -1) {
                 jabatan = String(row[jabatanColIdx] || '').trim() || "Dosen";
             }

             // Handle Peminatan for Dosen
             let peminatan: string[] = [];
             if (!isMahasiswa && peminatanColIdx !== -1) {
                 const rawPeminatan = String(row[peminatanColIdx] || '').trim();
                 if (rawPeminatan) {
                     peminatan = rawPeminatan.split(/[,;/]+/).map(p => p.trim()).filter(Boolean);
                 }
             }

             // Tahun Masuk for Mahasiswa
             let tahunMasuk = "";
             if (isMahasiswa) {
                 const yearDigits = idVal.length >= 4 ? idVal.substring(2, 4) : "";
                 tahunMasuk = yearDigits ? `20${yearDigits}` : "2024";
             }

             // Password Generation
             const length = 12;
             const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
             let generatedPassword = "";
             for (let j = 0; j < length; ++j) {
                 generatedPassword += charset.charAt(Math.floor(Math.random() * charset.length));
             }

             const item: any = {
                 nim: idVal, // using 'nim' as a generic ID field for massData state
                 nama,
                 email,
                 password: generatedPassword, 
             };

             if (isMahasiswa) {
                 item.tahunMasuk = tahunMasuk;
                 if (sksColIdx !== -1) item.sksDicapai = String(row[sksColIdx] || '').trim();
                 if (ipkColIdx !== -1) item.ipk = String(row[ipkColIdx] || '').trim();
                 
                 const rawSksD = sksNilaiDColIdx !== -1 ? String(row[sksNilaiDColIdx] || '').trim() : "";
                 item.sksNilaiD = rawSksD !== "" ? rawSksD : "0";

                 if (batasStudiColIdx !== -1 && row[batasStudiColIdx]) {
                     item.batasStudi = String(row[batasStudiColIdx] || '').trim();
                 } else if (tahunMasuk) {
                     const startYear = parseInt(tahunMasuk);
                     if (!isNaN(startYear)) item.batasStudi = (startYear + 6).toString();
                 }
             } else {
                 item.jabatan = jabatan;
                 item.peminatan = peminatan;
             }

             mappedData.push(item);
        }

        setMassData(mappedData);
        if (mappedData.length > 0) {
            showToast(`Berhasil membaca ${mappedData.length} baris data dari file Excel!`, "success");
        } else {
            showToast("Tidak ada data valid yang ditemukan di file Excel.", "destructive");
        }
    } catch (error) {
        console.error("Error parsing excel:", error);
        showToast("Failed to parse Excel file. Make sure format is correct.", "destructive");
        setMassData([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous data before parsing new file
    setMassData([]);
    setFileName(file.name);
    setRawExcelBinary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target?.result;
        setRawExcelBinary(bstr);
        parseExcelData(bstr, formData.role);
    };
    reader.readAsBinaryString(file);
    
    // Reset the input value so the same file selection triggers onChange again
    e.target.value = "";
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData((prev) => ({ ...prev, password: retVal }));
  };

  const passwordValidation = {
    length: formData.password.length >= 8,
    pattern: /^[A-Z][a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[!@#$%&*]/.test(formData.password),
  };

  const validate = () => {
    if (!formData.emailPrefix) {
      showToast("Username/Email Prefix is required", "destructive");
      return false;
    }

    const fullEmail = (formData.emailPrefix + formData.emailDomain).toLowerCase().trim();
    const allowedDomains = ["@univpancasila.ac.id", "@student.univpancasila.ac.id", "@student.univ.ac.id", "@univ.ac.id", "@gmail.com"];
    const isValidDomain = allowedDomains.some(domain => fullEmail.endsWith(domain));
    if (!isValidDomain) {
      showToast("Email harus berakhiran @univpancasila.ac.id, @student.univpancasila.ac.id, @student.univ.ac.id, @univ.ac.id, atau @gmail.com", "destructive");
      return false;
    }

    if (!formData.name) {
      showToast("Name is required", "destructive");
      return false;
    }
    if (!formData.password) {
      showToast("Password is required", "destructive");
      return false;
    }
    
    if (formData.role.toLowerCase() === 'mahasiswa') {
        if (!formData.nim) { showToast("NIM is required", "destructive"); return false; }
        if (!formData.tahunMasuk) { showToast("Tahun Masuk is required", "destructive"); return false; }

        if (!formData.sksDicapai) {
            showToast("Jumlah SKS yang dicapai wajib diisi.", "destructive");
            return false;
        }

        if (Number(formData.sksDicapai) < 100) {
            showToast("Jumlah SKS yang dicapai minimal 100 SKS untuk mengajukan KP.", "destructive");
            return false;
        }

        if (formData.sksNilaiD && Number(formData.sksNilaiD) > 0) {
            showToast("Mahasiswa harus memperbaiki nilai yang tidak lulus (D dan E) terlebih dahulu.", "destructive");
            return false;
        }

        if (!formData.ipk) {
            showToast("IPK wajib diisi.", "destructive");
            return false;
        }

        if (Number(formData.ipk) < 2.00 || Number(formData.ipk) > 4.00) {
            showToast("IPK minimal 2.00 dan maksimal 4.00 untuk mengajukan KP.", "destructive");
            return false;
        }
    }

    if (formData.role.toLowerCase() === 'dosen') {
        if (!formData.nidn) { showToast("NIDN / NIP is required", "destructive"); return false; }
        if (!formData.jabatan) { showToast("Jabatan is required", "destructive"); return false; }
    }

    if (formData.role.toLowerCase() === 'staf') {
        if (!formData.nip) { showToast("NIP is required", "destructive"); return false; }
    }

    return true;
  };

  const handleCancel = () => {
      navigate(`/admin/users?tab=${formData.role}`);
  };

  const handleSubmit = async () => {
    if (registrationMode === 'manual') {
      if (!validate()) return;
    } else {
      if (massData.length === 0) {
        showToast("Please upload a valid Excel file first", "destructive");
        return;
      }
      if (formData.role !== 'mahasiswa' && formData.role !== 'dosen') {
        showToast("Mass registration is not available for this role", "destructive");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (registrationMode === 'mass') {
          if (formData.role === 'mahasiswa') {
              for (const mhs of massData) {
                  if (!mhs.sksDicapai) {
                      showToast(`Kolom SKS Dicapai wajib diisi pada file Excel (Mahasiswa: ${mhs.nama} - ${mhs.nim})`, "destructive");
                      setIsLoading(false);
                      return;
                  }
                  if (Number(mhs.sksDicapai) < 100) {
                      showToast(`SKS Dicapai minimal 100 SKS untuk mengajukan KP (Mahasiswa: ${mhs.nama} - ${mhs.nim})`, "destructive");
                      setIsLoading(false);
                      return;
                  }
                  if (!mhs.ipk) {
                      showToast(`Kolom IPK wajib diisi pada file Excel (Mahasiswa: ${mhs.nama} - ${mhs.nim})`, "destructive");
                      setIsLoading(false);
                      return;
                  }
                  if (Number(mhs.ipk) < 2.00 || Number(mhs.ipk) > 4.00) {
                      showToast(`IPK minimal 2.00 dan maksimal 4.00 (Mahasiswa: ${mhs.nama} - ${mhs.nim})`, "destructive");
                      setIsLoading(false);
                      return;
                  }
                  if (mhs.sksNilaiD && Number(mhs.sksNilaiD) > 0) {
                      showToast(`Mahasiswa ${mhs.nama} (${mhs.nim}) memiliki ${mhs.sksNilaiD} SKS tidak lulus (D/E). Mahasiswa harus memperbaikinya terlebih dahulu.`, "destructive");
                      setIsLoading(false);
                      return;
                  }
                  if (mhs.sksNilaiD === undefined || mhs.sksNilaiD === null || mhs.sksNilaiD === "") {
                      mhs.sksNilaiD = "0";
                  }
              }
              await userApi.createMahasiswaMassal(massData);
          } else {
              await userApi.createDosenMassal(massData);
          }
      } else {
          const fullEmail = (formData.emailPrefix + formData.emailDomain).toLowerCase().trim();
          if (formData.role.toLowerCase() === 'mahasiswa') {
              const calculatedBatasStudi = formData.batasStudi || (formData.tahunMasuk && !isNaN(parseInt(formData.tahunMasuk)) ? (parseInt(formData.tahunMasuk) + 6).toString() : "");
              await userApi.createMahasiswa({
                  email: fullEmail,
                  password: formData.password,
                  nama: formData.name,
                  nim: formData.nim,
                  tahunMasuk: formData.tahunMasuk,
                  sksDicapai: formData.sksDicapai || undefined,
                  ipk: formData.ipk || undefined,
                  sksNilaiD: formData.sksNilaiD || undefined,
                  batasStudi: calculatedBatasStudi || undefined
              });
          } else if (formData.role.toLowerCase() === 'dosen') {
              await userApi.createDosen({
                  email: fullEmail,
                  password: formData.password,
                  nama: formData.name,
                  nidn: formData.nidn,
                  nip: formData.nip || undefined,
                  jabatan: formData.jabatan,
                  peminatan: formData.peminatan,
                  maxBimbingan: formData.maxBimbingan
              });
          } else if (formData.role.toLowerCase() === 'staf') {
              await userApi.createStaf({
                  email: fullEmail,
                  password: formData.password,
                  nama: formData.name,
                  nip: formData.nip
              });
          } else {
            throw new Error("Invalid role selected");
          }
      }

      // Pass toast in state so it shows up on the next page immediately
      navigate(`/admin/users?tab=${formData.role}`, {
          state: {
              toast: { title: "Account created successfully", variant: "success" }
          }
      });

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create account";
      showToast(message, "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPreview = () => {
    if (massData.length === 0) {
      showToast("No data to download", "destructive");
      return;
    }
    
    const isMahasiswa = formData.role === 'mahasiswa';
    const formattedData = massData.map(user => {
        if (isMahasiswa) {
            return {
                NPM: user.nim,
                Nama: user.nama,
                Email: user.email,
                Password: user.password,
                "Tahun Masuk": user.tahunMasuk,
                "SKS Dicapai": user.sksDicapai || "",
                "IPK": user.ipk || "",
                "SKS Tidak Lulus (D/E)": user.sksNilaiD || "",
                "Batas Studi": user.batasStudi || ""
            };
        } else {
            return {
                NIDN: user.nim,
                Nama: user.nama,
                Email: user.email,
                Password: user.password,
                Jabatan: user.jabatan,
                Peminatan: user.peminatan && Array.isArray(user.peminatan) ? user.peminatan.join(", ") : ""
            };
        }
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Akun ${isMahasiswa ? 'Mahasiswa' : 'Dosen'}`);
    XLSX.writeFile(wb, `Data_Password_${isMahasiswa ? 'Mahasiswa' : 'Dosen'}_Baru.xlsx`);
  };

  return {
    registrationMode,
    setRegistrationMode,
    massData,
    fileName,
    handleFileUpload,
    formData,
    showPassword,
    isLoading,
    toastProps,
    setToastProps,
    handleInputChange,
    handleRoleChange,
    togglePasswordVisibility,
    generatePassword,
    passwordValidation,
    handleSubmit,
    handleCancel,
    handleDownloadPreview,
    clearExcel,
    isValidRole,
  };
};
