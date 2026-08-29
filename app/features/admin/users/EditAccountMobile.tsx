import { ArrowLeft, ChevronDown, Eye, EyeOff, Loader2, Save } from "lucide-react";
import { cn } from "~/lib/utils";
import { CustomSelect } from "~/components/ui/custom-select";
import { MultipleCombobox } from "~/components/ui/Multiple-combobox";
import { useEditAccount } from "./UseEditAccount";

export function EditAccountMobile() {
  const {
      formData,
      initialLoading,
      isLoading,
      showPassword,
      toastProps,
      handleInputChange,
      togglePasswordVisibility,
      generatePassword,
      handleSubmit,
      navigate
  } = useEditAccount();

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
         <h1 className="text-lg font-bold text-gray-900">Edit {formData.role === 'mahasiswa' ? 'Mahasiswa' : formData.role === 'dosen' ? 'Dosen' : 'Staf'}</h1>
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
                 <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#D25026]/10 focus-within:border-[#D25026] overflow-hidden bg-white">
                     <input
                         type="text"
                         name="emailPrefix"
                         autoComplete="off"
                         value={formData.emailPrefix}
                         onChange={handleInputChange}
                         placeholder="Username / NPM"
                         disabled={isLoading}
                         className="flex-1 px-3 py-2.5 outline-none text-gray-700 placeholder:text-gray-300 text-sm min-w-0"
                     />
                     <div className="bg-gray-100 border-l border-gray-200 flex items-center px-2 shrink-0">
                         <select
                             name="emailDomain"
                             value={formData.emailDomain}
                             onChange={handleInputChange}
                             disabled={isLoading}
                             className="bg-transparent font-medium text-xs text-gray-700 outline-none cursor-pointer px-1"
                         >
                             <option value="@univpancasila.ac.id">@univpancasila.ac.id</option>
                             <option value="@student.univpancasila.ac.id">@student.univpancasila.ac.id</option>
                             <option value="@student.univ.ac.id">@student.univ.ac.id</option>
                             <option value="@univ.ac.id">@univ.ac.id</option>
                             <option value="@gmail.com">@gmail.com</option>
                         </select>
                     </div>
                 </div>
                 <p className="text-[0.7rem] text-gray-500">
                     Email: <span className="font-semibold text-gray-700">{(formData.emailPrefix || "username").toLowerCase()}{formData.emailDomain}</span>
                 </p>
             </div>
         </div>

         {/* Academic Info Card */}
         {formData.role !== 'staf' && (
             <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                 <h2 className="text-sm font-bold text-gray-900 mb-1">Academic Information</h2>
                 
                 {formData.role === 'mahasiswa' ? (
                     <>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">NIM / NPM</label>
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

                        <div className="pt-2 border-t border-gray-100 flex flex-col gap-3">
                             <span className="text-xs font-bold text-orange-600">Data Akademik</span>

                             <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-medium text-gray-700">SKS Dicapai</label>
                                 <input 
                                     type="number"
                                     name="sksDicapai"
                                     value={formData.sksDicapai}
                                     onChange={handleInputChange}
                                     placeholder="e.g. 110"
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                                 />
                             </div>

                             <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-medium text-gray-700">SKS Tidak Lulus (D/E)</label>
                                 <input 
                                     type="number"
                                     name="sksNilaiD"
                                     value={formData.sksNilaiD}
                                     onChange={handleInputChange}
                                     placeholder="e.g. 0"
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                                 />
                             </div>

                             <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-medium text-gray-700">IPK</label>
                                 <input 
                                     type="text"
                                     name="ipk"
                                     value={formData.ipk}
                                     onChange={handleInputChange}
                                     placeholder="Ketik 3 angka (cth: 350 -> 3.50)"
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                                 />
                             </div>

                             <div className="flex flex-col gap-1.5">
                                 <label className="text-xs font-medium text-gray-700">Batas Studi</label>
                                 <input 
                                     type="text"
                                     name="batasStudi"
                                     value={formData.batasStudi || (formData.tahunMasuk && !isNaN(parseInt(formData.tahunMasuk)) ? (parseInt(formData.tahunMasuk) + 6).toString() : "")}
                                     onChange={handleInputChange}
                                     placeholder="Tahun Masuk + 6"
                                     className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs"
                                 />
                             </div>
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
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Peminatan</label>
                            <MultipleCombobox
                                options={[
                                    { label: "Software Engineering", id: "Software Engineering", checked: formData.peminatan.includes("Software Engineering") },
                                    { label: "Artificial Intelligence", id: "Artificial Intelligence", checked: formData.peminatan.includes("Artificial Intelligence") },
                                    { label: "Cyber Security", id: "Cyber Security", checked: formData.peminatan.includes("Cyber Security") },
                                    { label: "Data Science", id: "Data Science", checked: formData.peminatan.includes("Data Science") },
                                ]}
                                onOptionsChange={(newOptions) => {
                                    const selected = newOptions.filter(o => o.checked).map(o => o.id);
                                    handleInputChange({
                                        target: { name: "peminatan", value: selected },
                                    } as any);
                                }}
                                placeholder="Select peminatan..."
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Kuota Maks. Bimbingan</label>
                             <input 
                                type="number"
                                name="maxBimbingan"
                                value={formData.maxBimbingan}
                                onChange={handleInputChange}
                                placeholder="6"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500/10 focus:border-pink-500 transition-all text-sm"
                             />
                             <p className="text-xs text-gray-500">Kosongkan untuk default (6).</p>
                        </div>
                     </>
                 )}
             </div>
         )}

         {/* Security Card */}
         <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
             <h2 className="text-sm font-bold text-gray-900 mb-1">Security</h2>
             <div className="flex flex-col gap-2">
                 <label className="text-sm font-medium text-gray-700">New Password (Optional)</label>
                 <div className="flex gap-2">
                     <div className="relative flex-1">
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
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                     >
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                     </button>
                     </div>
                     <button
                        type="button"
                        onClick={generatePassword}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 text-gray-700"
                     >
                        Generate
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
