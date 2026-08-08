import { useNavigate, useParams } from "react-router"; // Keep for types if needed, or remove if unused. Hook handles it.
import { ArrowLeft, ChevronDown, Eye, EyeOff, Save } from "lucide-react";
import { cn } from "~/lib/utils";
import { CustomSelect } from "~/components/ui/custom-select";
import { MultipleCombobox } from "~/components/ui/Multiple-combobox";
import { useEditAccount } from "./UseEditAccount";

export function EditAccountDesktop() {
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
            <div className="p-8 flex justify-center text-gray-500">
                Loading user data...
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 w-full font-geist bg-white">
            {/* Toast Notification */}
            {toastProps && (
                <div
                    className={cn(
                        "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 animate-in slide-in-from-top-2",
                        toastProps.variant === "success"
                            ? "bg-white border-[#22C55E]/20 text-[#18181B]"
                            : toastProps.variant === "destructive"
                              ? "bg-red-50 border-red-200 text-red-700"
                              : "bg-white border-gray-200 text-gray-800",
                    )}
                >
                    <div
                        className={cn(
                            "w-2 h-2 rounded-full",
                            toastProps.variant === "success"
                                ? "bg-[#22C55E]"
                                : toastProps.variant === "destructive"
                                  ? "bg-red-500"
                                  : "bg-gray-500",
                        )}
                    />
                    <p className="text-sm font-medium">{toastProps.title}</p>
                </div>
            )}

            <div className="mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        onClick={() =>
                            navigate(`/admin/users?tab=${formData.role}`)
                        }
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-[#18181B] leading-tight">
                        Edit User Account
                    </h1>
                </div>
                <p className="text-[#71717A] text-sm ml-8">
                    Update the details for this {formData.role} account.
                </p>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-5xl">
                <div className="flex flex-col gap-6">
                    {/* Email Field */}
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email address"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>

                    {/* Name Field */}
                    <div className="flex flex-col gap-3">
                        <label className="text-base font-semibold text-[#18181B]">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full name"
                            disabled={isLoading}
                            className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                        />
                    </div>
                </div>

                {/* Conditional Fields for Mahasiswa */}
                {formData.role === "mahasiswa" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-base font-semibold text-[#18181B]">
                                NIM
                            </label>
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
                            <label className="text-base font-semibold text-[#18181B]">
                                Tahun Masuk
                            </label>
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
                {formData.role === "dosen" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-3">
                            <label className="text-base font-semibold text-[#18181B]">
                                NIDN
                            </label>
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
                            <label className="text-base font-semibold text-[#18181B]">
                                Jabatan
                            </label>
                            <div className="relative">
                                <CustomSelect
                                    value={formData.jabatan}
                                    onChange={(value) =>
                                        handleInputChange({
                                            target: { name: "jabatan", value },
                                        } as any)
                                    }
                                    options={[
                                        {
                                            label: "Dosen Reguler",
                                            value: "Dosen Reguler",
                                        },
                                        {
                                            label: "Pejabat Prodi (Masekpro)",
                                            value: "Pejabat Prodi",
                                        },
                                        {
                                            label: "Koordinator KP",
                                            value: "Koordinator KP",
                                        },
                                        {
                                            label: "Dosen Pembimbing",
                                            value: "Dosen Pembimbing",
                                        },
                                    ]}
                                    placeholder="Select Jabatan"
                                    className="w-full px-5 py-3 h-auto"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-base font-semibold text-[#18181B]">
                                Peminatan
                            </label>
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
                        <div className="flex flex-col gap-3">
                            <label className="text-base font-semibold text-[#18181B]">
                                Kuota Maksimal Bimbingan
                            </label>
                            <input
                                type="number"
                                name="maxBimbingan"
                                value={formData.maxBimbingan}
                                onChange={handleInputChange}
                                placeholder="6"
                                disabled={isLoading}
                                className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                            />
                            <p className="text-xs text-gray-500">Kosongkan jika ingin menggunakan kuota default (6 mahasiswa).</p>
                        </div>
                    </div>
                )}

                {/* Change Password Checkbox or Section */}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
                    <label className="text-sm font-semibold text-[#18181B]">
                        Change Password (Optional)
                    </label>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Leave empty to keep current password"
                                disabled={isLoading}
                                className="w-full px-4 py-2.5 pr-14 rounded-lg border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-sm disabled:opacity-50 disabled:bg-gray-50 bg-white"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                disabled={isLoading}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] transition-colors disabled:opacity-50"
                                aria-label={
                                    showPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
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
                    <p className="text-xs text-gray-500 mt-1">
                        Password is encrypted and hidden for security. Leave unchanged to keep current password.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        className="px-8 py-3 rounded-xl border border-[#E4E4E7] text-[1rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() =>
                            navigate(`/admin/users?tab=${formData.role}`)
                        }
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-8 py-3 rounded-xl bg-[#D25026] text-[1rem] font-medium text-white hover:bg-[#B9441F] transition-all active:scale-95 shadow-md shadow-[#D25026]/20 disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                    >
                        {isLoading ? (
                            "Saving..."
                        ) : (
                            <>
                                <Save size={18} /> Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
