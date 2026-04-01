import { Eye, EyeOff, Check, X, ChevronDown, Menu, Loader2 } from "lucide-react";
import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { Toast } from "~/components/ui/toast";
import { CustomSelect } from "~/components/ui/custom-select";

export const CreateAccountMobile = () => {
  const { setOpenMobile } = useSidebar();
  const {
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
  } = useCreateAccount();

  const [isRoleOpen, setIsRoleOpen] = useState(false);

  return (
    <div className="w-full min-h-screen pt-4 pb-12 bg-white flex flex-col font-geist">
      {/* Header Section */}
      <div className="px-6 mb-8 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenMobile(true)}
            className="p-1 -ml-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-[#0D0D12]" />
          </button>
          <h1 className="text-[1.25rem] font-bold text-[#0D0D12]">
            Create Account
          </h1>
        </div>
        <p className="text-[0.75rem] text-[#71717A] pl-9 leading-relaxed">
          Create new user account (Mahasiswa/Dosen).
        </p>
      </div>

      <div className="px-6 flex flex-col gap-6">

        {/* Role Selection */}
        <div className="flex flex-col gap-2">
           <label className="text-[0.875rem] font-medium text-[#18181B]">Role</label>
           <div className="flex gap-3">
               {['Mahasiswa', 'Dosen'].map((role) => (
                   <button
                       key={role}
                       type="button"
                       onClick={() => handleRoleChange(role.toLowerCase())}
                       className={cn(
                           "flex-1 py-2 rounded-xl border transition-all text-[0.875rem] font-medium",
                           formData.role === role.toLowerCase()
                               ? "bg-[#D25026] text-white border-[#D25026]"
                               : "bg-white text-[#71717A] border-gray-300"
                       )}
                   >
                       {role}
                   </button>
               ))}
           </div>
        </div>

        {/* Name Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter name"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>

        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
             placeholder={formData.role === 'mahasiswa' ? "mahasiswa@student.univ.ac.id" : "dosen@univ.ac.id"}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>

        {/* Conditional Fields: Mahasiswa */}
        {formData.role === 'mahasiswa' && (
            <>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">NIM</label>
                    <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleInputChange}
                        placeholder="NPM"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">Jurusan</label>
                    <input
                        type="text"
                        name="jurusan"
                        value={formData.jurusan}
                        onChange={handleInputChange}
                        placeholder="Jurusan"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">Tahun Masuk</label>
                    <input
                        type="text"
                        name="tahunMasuk"
                        value={formData.tahunMasuk}
                        onChange={handleInputChange}
                        placeholder="Tahun"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>
            </>
        )}

        {/* Conditional Fields: Dosen */}
        {formData.role === 'dosen' && (
            <>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">NIDN</label>
                    <input
                        type="text"
                        name="nidn"
                        value={formData.nidn}
                        onChange={handleInputChange}
                        placeholder="NIDN"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">Jabatan</label>
                     <CustomSelect
                        value={formData.jabatan}
                        onChange={(value) => handleInputChange({ target: { name: "jabatan", value } } as any)}
                        options={[
                            { label: "Dosen Reguler", value: "Dosen Reguler" },
                            { label: "Pejabat Prodi (Masekpro)", value: "Pejabat Prodi" },
                            { label: "Koordinator KP", value: "Koordinator KP" },
                            { label: "Dosen Pembimbing", value: "Dosen Pembimbing" },
                        ]}
                        placeholder="Select Jabatan"
                        className="w-full px-4 py-3 h-auto"
                    />
                </div>
            </>
        )}

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Password</label>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] transition-colors disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="button"
              onClick={generatePassword}
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl border border-gray-300 text-[0.8125rem] font-medium text-[#18181B] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Generate Password
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-[0.8125rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-[#FDBC74] text-white text-[0.8125rem] font-semibold hover:bg-[#FDB15A] transition-all active:scale-95 shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {isLoading ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastProps && (
        <div className="fixed bottom-10 left-6 right-6 z-[100]">
          <Toast
            title={toastProps.title}
            variant={toastProps.variant}
            onClose={() => setToastProps(null)}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
