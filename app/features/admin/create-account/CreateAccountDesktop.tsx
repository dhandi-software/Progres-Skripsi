import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { Toast } from "~/components/ui/toast";
import { Check, ChevronDown, Eye, EyeOff, Loader2, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { CustomSelect } from "~/components/ui/custom-select";

export const CreateAccountDesktop = () => {
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
    handleCancel,
  } = useCreateAccount();

  const [isRoleOpen, setIsRoleOpen] = useState(false);

  return (
    <div className="p-6 md:p-8 w-full font-geist bg-white">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2 mb-2">
            <button
                onClick={handleCancel}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <ArrowLeft size={20} className="text-gray-500" />
            </button>
            <h1 className="text-2xl font-bold text-[#18181B] leading-tight">
            Create New User Account
            </h1>
        </div>
        <p className="text-[#71717A] text-sm ml-8">
          Select role and fill in the details to create a new account.
        </p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Role Selection */}
        <div className="flex flex-col gap-2">
           <label className="text-sm font-semibold text-[#18181B]">Role</label>
           <div className="flex gap-4">
               {['Mahasiswa', 'Dosen'].map((role) => (
                   <button
                       key={role}
                       type="button"
                       onClick={() => handleRoleChange(role.toLowerCase())}
                       className={cn(
                           "flex-1 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium",
                           formData.role === role.toLowerCase()
                               ? "bg-[#D25026] text-white border-[#D25026]"
                               : "bg-white text-[#71717A] border-gray-300 hover:bg-gray-50"
                       )}
                   >
                       {role}
                   </button>
               ))}
           </div>
        </div>

            <div className="flex flex-col gap-6">

                {/* Name Field */}
                <div className="flex flex-col gap-3">
                <label className="text-base font-semibold text-[#18181B]">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    disabled={isLoading}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                />
                </div>
            </div>

                 {/* Email Field */}
                <div className="flex flex-col gap-3">
                <label className="text-base font-semibold text-[#18181B]">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={formData.role === 'mahasiswa' ? "mahasiswa@student.univ.ac.id" : "dosen@univ.ac.id"}
                    disabled={isLoading}
                    className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                />
                </div>

            {/* Conditional Fields for Mahasiswa */}
            {formData.role === 'mahasiswa' && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">NIM</label>
                        <input
                            type="text"
                            name="nim"
                            value={formData.nim}
                            onChange={handleInputChange}
                            placeholder="e.g. 4519210001"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">Jurusan</label>
                        <input
                            type="text"
                            name="jurusan"
                            value={formData.jurusan}
                            onChange={handleInputChange}
                            placeholder="e.g. Teknik Informatika"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">Tahun Masuk</label>
                        <input
                            type="text"
                            name="tahunMasuk"
                            value={formData.tahunMasuk}
                            onChange={handleInputChange}
                            placeholder="e.g. 2023"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>
                </div>
            )}

            {/* Conditional Fields for Dosen */}
            {formData.role === 'dosen' && (
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">NIDN</label>
                        <input
                            type="text"
                            name="nidn"
                            value={formData.nidn}
                            onChange={handleInputChange}
                            placeholder="e.g. 0312098801"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">Jabatan</label>
                        <div className="relative">
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
                                className="w-full px-5 py-3 h-auto"
                            />
                        </div>
                    </div>
                </div>
            )}

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#18181B]">Password</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full px-4 py-2.5 pr-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-sm disabled:opacity-50 disabled:bg-gray-50 bg-white"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button
              type="button"
              onClick={generatePassword}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-[#18181B] hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              Generate
            </button>
          </div>

          {/* Password Validation Checklist */}
          {/* <div className="mt-3 flex flex-col gap-2">
            {[
              { label: "Consists of at least 8 characters.", valid: passwordValidation.length },
              { label: "Must begin with an uppercase letter [A-Z] followed by lowercase letters [a-z].", valid: passwordValidation.pattern },
              { label: "Contains at least one number (0-9).", valid: passwordValidation.number },
              { label: "Contains at least one symbol (e.g., !, @, #, $, %, &, *).", valid: passwordValidation.symbol },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-[0.8125rem]">
                <div className={cn(
                  "flex items-center justify-center rounded-full transition-colors",
                  item.valid ? "text-[#22C55E]" : "text-[#EF4444]"
                )}>
                  {item.valid ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                </div>
                <span className={cn(
                  "transition-colors",
                  item.valid ? "text-[#22C55E]" : "text-[#71717A]"
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div> */}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-8 py-3 rounded-xl border border-gray-300 text-[1rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl bg-[#FDBC74] text-white text-[1rem] font-semibold hover:bg-[#FDB15A] transition-all active:scale-95 shadow-sm disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastProps && (
        <div className="fixed top-20 right-10 z-[100]">
          <Toast
            title={toastProps.title}
            variant={toastProps.variant}
            onClose={() => setToastProps(null)}
          />
        </div>
      )}
    </div>
  );
};
