import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { adminApi } from "~/api/admin";
import { ChevronDown, Eye, EyeOff, Save, ArrowLeft, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";
import { CustomSelect } from "~/components/ui/custom-select";

interface ToastProps {
  title: string;
  variant: "success" | "destructive" | "default";
}

export default function EditAccountMobile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "", // Optional
    role: "mahasiswa",
    // Specific fields
    nim: "",
    jurusan: "",
    tahunMasuk: "",
    nidn: "",
    jabatan: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = (title: string, variant: "success" | "destructive" | "default" = "success") => {
    setToastProps({ title, variant });
    setTimeout(() => setToastProps(null), 3000);
  };

  useEffect(() => {
     if (id) {
         fetchUser(id);
     }
  }, [id]);

  const fetchUser = async (userId: string) => {
      setInitialLoading(true);
      try {
          const res = await adminApi.getUserById(userId);
          const user = res.data;
          
          setFormData({
              email: user.email,
              name: user.nama || "",
              password: "", 
              role: user.role,
              nim: user.nim || "",
              jurusan: user.jurusan || "",
              tahunMasuk: user.tahunMasuk || "",
              nidn: user.nidn || "",
              jabatan: user.jabatan || ""
          });
      } catch (error) {
          console.error("Failed to fetch user", error);
          showToast("Failed to fetch user", "destructive");
          navigate("/admin/users");
      } finally {
          setInitialLoading(false);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Numeric validation for NIM and NIDN
    if ((name === "nim" || name === "nidn") && value && !/^\d*$/.test(value)) {
        return; 
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
      setIsLoading(true);
      try {
          // Construct payload
          const payload: any = {
              email: formData.email,
              name: formData.name,
              role: formData.role,
              // Add specific fields based on role
              ...(formData.role === 'mahasiswa' ? {
                  nim: formData.nim,
                  jurusan: formData.jurusan,
                  tahunMasuk: formData.tahunMasuk
              } : {
                  nidn: formData.nidn,
                  jabatan: formData.jabatan
              })
          };

          if (formData.password) {
              payload.password = formData.password;
          }

          await adminApi.updateUser(id!, payload);
          showToast("User updated successfully", "success");
          
          setTimeout(() => {
              navigate(`/admin/users?tab=${formData.role}`);
          }, 1000);

      } catch (error: any) {
          console.error("Update failed", error);
          showToast(error.response?.data?.message || "Failed to update user", "destructive");
      } finally {
          setIsLoading(false);
      }
  };

  if (initialLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <Loader2 className="animate-spin text-pink-600" size={32} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-geist pb-20">
      {/* Toast Notification */}
      {toastProps && (
        <div className={cn(
          "fixed top-4 left-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-2",
          toastProps.variant === "success" ? "bg-white border-green-200 text-green-800" : 
          toastProps.variant === "destructive" ? "bg-white border-red-200 text-red-700" : "bg-white border-gray-300 text-gray-800"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            toastProps.variant === "success" ? "bg-green-500" : 
            toastProps.variant === "destructive" ? "bg-red-500" : "bg-gray-500"
          )} />
          <p className="text-sm font-medium">{toastProps.title}</p>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
         <button onClick={() => navigate(`/admin/users?tab=${formData.role}`)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
         </button>
         <h1 className="text-lg font-bold text-gray-900">Edit {formData.role === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}</h1>
      </div>

      <div className="p-4 flex flex-col gap-5">
         {/* Identification Card */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
             <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
                 <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full text-lg font-semibold text-gray-900 border-none p-0 focus:ring-0 placeholder:text-gray-300"
                    placeholder="Enter Name"
                 />
             </div>
             <div className="h-px bg-gray-100" />
             <div className="flex flex-col gap-1.5">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                 <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full text-base text-gray-700 border-none p-0 focus:ring-0 placeholder:text-gray-300"
                    placeholder="name@example.com"
                 />
             </div>
         </div>

         {/* Academic Info Card */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
             <h2 className="text-sm font-bold text-gray-900 mb-1">Academic Information</h2>
             
             {formData.role === 'mahasiswa' ? (
                 <>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">NIM</label>
                         <input 
                            type="text"
                            name="nim"
                            value={formData.nim}
                            onChange={handleInputChange}
                            placeholder="Numeric NIM"
                            inputMode="numeric"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm"
                         />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Jurusan</label>
                         <input 
                            type="text"
                            name="jurusan"
                            value={formData.jurusan}
                            onChange={handleInputChange}
                            placeholder="Department"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm"
                         />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Tahun Masuk</label>
                         <input 
                            type="text"
                            name="tahunMasuk"
                            value={formData.tahunMasuk}
                            onChange={handleInputChange}
                            placeholder="Year"
                            inputMode="numeric"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm"
                         />
                    </div>
                 </>
             ) : (
                 <>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">NIDN</label>
                         <input 
                            type="text"
                            name="nidn"
                            value={formData.nidn}
                            onChange={handleInputChange}
                            placeholder="Numeric NIDN"
                            inputMode="numeric"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm"
                         />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-gray-700">Jabatan</label>
                        <CustomSelect
                                value={formData.jabatan}
                                onChange={(value) => handleInputChange({ target: { name: "jabatan", value } } as any)}
                                options={[
                                    { label: "Dosen Reguler", value: "Dosen Reguler" },
                                    { label: "Pejabat Prodi", value: "Pejabat Prodi" },
                                    { label: "Koordinator KP", value: "Koordinator KP" },
                                    { label: "Dosen Pembimbing", value: "Dosen Pembimbing" },
                                ]}
                                placeholder="Select Jabatan"
                                className="w-full px-4 py-2.5 h-auto text-sm"
                            />
                    </div>
                 </>
             )}
         </div>

         {/* Security Card */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
             <h2 className="text-sm font-bold text-gray-900 mb-1">Security</h2>
             <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-gray-700">New Password (Optional)</label>
                 <div className="relative">
                     <input 
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Leave empty to keep"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm pr-10"
                     />
                     <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                     >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                 </div>
             </div>
         </div>
      </div>

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-10">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-pink-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-pink-600/20 active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isLoading ? "Saving Changes..." : "Save Changes"}
          </button>
      </div>
    </div>
  );
}
