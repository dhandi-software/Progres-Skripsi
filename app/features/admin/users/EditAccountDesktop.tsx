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

            <div className="flex flex-col gap-6 w-full">
                <div className="flex flex-col gap-6">
                    {/* Email Field */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <label className="text-base font-semibold text-[#18181B]">
                                Email
                            </label>
                            <span className="text-xs text-gray-500 font-medium">Domain otomatis terpasang</span>
                        </div>
                        <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#D25026]/10 focus-within:border-[#D25026] overflow-hidden bg-white shadow-sm transition-all">
                            <input
                                type="text"
                                name="emailPrefix"
                                autoComplete="off"
                                value={formData.emailPrefix}
                                onChange={handleInputChange}
                                placeholder="Username / NPM / NIDN"
                                disabled={isLoading}
                                className="flex-1 px-5 py-3 outline-none text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50"
                            />
                            <div className="bg-gray-100 border-l border-gray-200 flex items-center px-4 shrink-0">
                                <select
                                    name="emailDomain"
                                    value={formData.emailDomain}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className="bg-transparent font-semibold text-sm text-gray-700 outline-none cursor-pointer px-1"
                                >
                                    <option value="@univpancasila.ac.id">@univpancasila.ac.id</option>
                                    <option value="@student.univpancasila.ac.id">@student.univpancasila.ac.id</option>
                                    <option value="@student.univ.ac.id">@student.univ.ac.id</option>
                                    <option value="@univ.ac.id">@univ.ac.id</option>
                                    <option value="@gmail.com">@gmail.com</option>
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            Alamat Email: <span className="font-semibold text-gray-800">{(formData.emailPrefix || "username").toLowerCase()}{formData.emailDomain}</span>
                        </p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-base font-semibold text-[#18181B]">
                                    NIM / NPM
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

                        {/* Data Akademik Edit Section */}
                        <div className="p-5 bg-orange-50/40 border border-orange-100 rounded-2xl flex flex-col gap-4">
                            <h3 className="text-sm font-bold text-[#D25026]">Data Akademik Mahasiswa</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-gray-700">Jumlah SKS yang dicapai <span className="font-normal text-gray-500">(tanpa D, E, Blank)</span></label>
                                    <input
                                        type="number"
                                        name="sksDicapai"
                                        value={formData.sksDicapai}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 110"
                                        disabled={isLoading}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] text-sm bg-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-gray-700">Jumlah SKS Tidak Lulus (D dan E)</label>
                                    <input
                                        type="number"
                                        name="sksNilaiD"
                                        value={formData.sksNilaiD}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 0"
                                        disabled={isLoading}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] text-sm bg-white"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-gray-700">Indeks Prestasi Komulatif (IPK)</label>
                                    <input
                                        type="text"
                                        name="ipk"
                                        value={formData.ipk}
                                        onChange={handleInputChange}
                                        placeholder="Ketik 3 angka (cth: 350 -> 3.50)"
                                        disabled={isLoading}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] text-sm bg-white"
                                    />
                                    <p className="text-[10px] text-gray-500">Otomatis memasukkan titik (misal ketik 350 jadi 3.50)</p>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-semibold text-gray-700">Batas Studi (Tahun)</label>
                                    <input
                                        type="text"
                                        name="batasStudi"
                                        value={formData.batasStudi || (formData.tahunMasuk && !isNaN(parseInt(formData.tahunMasuk)) ? (parseInt(formData.tahunMasuk) + 6).toString() : "")}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 2029 (Otomatis Tahun Masuk + 6)"
                                        disabled={isLoading}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] text-sm bg-white"
                                    />
                                </div>
                            </div>
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
