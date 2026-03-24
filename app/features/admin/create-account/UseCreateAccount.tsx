import { useState, useEffect } from "react";
import { userApi } from "~/api/userApi";
import { useNavigate, useSearchParams } from "react-router";

interface ToastProps {
  title: string;
  variant: "success" | "destructive" | "default";
}

export const useCreateAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");

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
    if (!validate()) return;

    setIsLoading(true);
    try {
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

      showToast("Account created successfully", "success");

      // Redirect back to list immediately
      navigate(`/admin/users?tab=${formData.role}`);

    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to create account";
      showToast(message, "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
