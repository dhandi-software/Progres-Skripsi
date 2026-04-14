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
    email: "",
    name: "",
    password: "",
    role: "mahasiswa", 
    // Specific fields
    nim: "",
    jurusan: "",
    tahunMasuk: "",
    nidn: "",
    jabatan: "",
  });

  // Sync role with URL param on mount
  useEffect(() => {
    if (roleParam && (roleParam === "mahasiswa" || roleParam === "dosen")) {
        setFormData(prev => ({ ...prev, role: roleParam }));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Numeric validation for NIM and NIDN
    if ((name === "nim" || name === "nidn") && value && !/^\d*$/.test(value)) {
        return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous data before parsing new file
    setMassData([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        let headerRowIdx = -1;
        let idColIdx = -1; // NIM or NIDN
        let namaColIdx = -1;
        let emailColIdx = -1;
        let jabatanColIdx = -1;
        
        const isMahasiswa = formData.role === 'mahasiswa';

        for (let i = 0; i < data.length; i++) {
             const row = data[i] as any[];
             if (!row || !Array.isArray(row)) continue;
             
             for (let j = 0; j < row.length; j++) {
                  const cellText = String(row[j] || '').toLowerCase().trim();
                  
                  // ID detection (NIM/NPM or NIDN/NIP)
                  if (isMahasiswa) {
                      if (cellText === 'npm' || cellText === 'nim') {
                          idColIdx = j;
                          headerRowIdx = i;
                      }
                  } else {
                      if (cellText === 'nidn' || cellText === 'nip') {
                          idColIdx = j;
                          headerRowIdx = i;
                      }
                  }

                  if (cellText === 'nama' || cellText === 'name') {
                       namaColIdx = j;
                  }
                  if (cellText === 'email') {
                       emailColIdx = j;
                  }
                  if (!isMahasiswa && (cellText === 'jabatan' || cellText === 'position')) {
                       jabatanColIdx = j;
                  }
             }
             if (idColIdx !== -1 && namaColIdx !== -1) break;
        }

        if (headerRowIdx === -1 || idColIdx === -1 || namaColIdx === -1) {
             const idLabel = isMahasiswa ? "NIM/NPM" : "NIDN/NIP";
             showToast(`Could not find ${idLabel} and Nama columns in Excel`, "destructive");
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

             // Tahun Masuk & Jurusan for Mahasiswa
             let tahunMasuk = "";
             if (isMahasiswa) {
                 const yearDigits = idVal.length >= 4 ? idVal.substring(2, 4) : "";
                 tahunMasuk = yearDigits ? `20${yearDigits}` : "2024";
             }

             // Password Generation
             const length = 12;
             const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
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
                 item.jurusan = "Teknik Informatika";
                 item.tahunMasuk = tahunMasuk;
             } else {
                 item.jabatan = jabatan;
             }

             mappedData.push(item);
        }

        setMassData(mappedData);
    } catch (error) {
        console.error("Error parsing excel:", error);
        showToast("Failed to parse Excel file. Make sure format is correct.", "destructive");
      }
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
    if (!formData.email) {
      showToast("Email is required", "destructive");
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
        if (!formData.jurusan) { showToast("Jurusan is required", "destructive"); return false; }
        if (!formData.tahunMasuk) { showToast("Tahun Masuk is required", "destructive"); return false; }
    }

    if (formData.role.toLowerCase() === 'dosen') {
        if (!formData.nidn) { showToast("NIDN is required", "destructive"); return false; }
        if (!formData.jabatan) { showToast("Jabatan is required", "destructive"); return false; }
    }

    // if (!passwordValidation.length || !passwordValidation.pattern || !passwordValidation.number || !passwordValidation.symbol) {
    //   showToast("Password does not meet requirements", "destructive");
    //   return false;
    // }
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
              await userApi.createMahasiswaMassal(massData);
          } else {
              await userApi.createDosenMassal(massData);
          }
      } else {
          if (formData.role.toLowerCase() === 'mahasiswa') {
              await userApi.createMahasiswa({
                  email: formData.email,
                  password: formData.password,
                  nama: formData.name,
                  nim: formData.nim,
                  jurusan: formData.jurusan,
                  tahunMasuk: formData.tahunMasuk
              });
          } else if (formData.role.toLowerCase() === 'dosen') {
              await userApi.createDosen({
                  email: formData.email,
                  password: formData.password,
                  nama: formData.name,
                  nidn: formData.nidn,
                  jabatan: formData.jabatan
              });
          } else {
            throw new Error("Invalid role selected");
          }
      }

      showToast("Account created successfully", "success");

      // Wait for toast to be visible before redirecting
      setTimeout(() => {
          navigate(`/admin/users?tab=${formData.role}`);
      }, 1500);

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
                Jurusan: user.jurusan
            };
        } else {
            return {
                NIDN: user.nim,
                Nama: user.nama,
                Email: user.email,
                Password: user.password,
                Jabatan: user.jabatan
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
  };
};
