import { Eye, EyeOff, Check, X, ChevronDown, Menu, Loader2, UploadCloud, FileSpreadsheet, Download } from "lucide-react";
import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { Toast } from "~/components/ui/toast";
import { CustomSelect } from "~/components/ui/custom-select";
import { MultipleCombobox, type ComboboxOption } from "~/components/ui/Multiple-combobox";

import NotFoundRoute from "~/routes/$";

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
    registrationMode,
    setRegistrationMode,
    handleFileUpload,
    fileName,
    massData,
    handleDownloadPreview,
    clearExcel,
    isValidRole,
  } = useCreateAccount();

  if (!isValidRole) {
    return <NotFoundRoute />;
  }

  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const [peminatanOptions, setPeminatanOptions] = useState<ComboboxOption[]>([
    { id: "ds", label: "Data Science", checked: false },
    { id: "ai", label: "Artificial Intelligence", checked: false },
    { id: "se", label: "Software Engineering", checked: false },
    { id: "ncs", label: "Network and Cyber Security", checked: false },
  ]);

  const handlePeminatanChange = (newOptions: ComboboxOption[]) => {
    setPeminatanOptions(newOptions);
    const selected = newOptions.filter(opt => opt.checked).map(opt => opt.label);
    handleInputChange({ target: { name: 'peminatan', value: selected } } as any);
  };

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
        {/* Registration Mode Selection */}
        {(formData.role === 'mahasiswa' || formData.role === 'dosen') && (
           <div className="flex bg-gray-100 p-1 rounded-xl w-full">
              <button
                 type="button"
                 onClick={() => setRegistrationMode('manual')}
                 className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all text-center",
                    registrationMode === 'manual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                 )}
              >
                 Manual Input
              </button>
              <button
                 type="button"
                 onClick={() => setRegistrationMode('mass')}
                 className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all text-center",
                    registrationMode === 'mass' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                 )}
              >
                 Import Excel
              </button>
           </div>
        )}

        {/* Role Selection */}
        <div className="flex flex-col gap-2">
           <label className="text-[0.875rem] font-medium text-[#18181B]">Role</label>
           <div className="flex gap-3">
               {['Mahasiswa', 'Dosen', 'Staf'].map((role) => (
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

        {registrationMode === 'manual' ? (
            <>
        {/* Conditional Fields: Mahasiswa */}
        {formData.role === 'mahasiswa' && (
            <>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">NIM / NPM</label>
                    <input
                        type="text"
                        name="nim"
                        value={formData.nim}
                        onChange={handleInputChange}
                        placeholder="NPM"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50 bg-white"
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
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50 bg-white"
                    />
                </div>

                {/* Data Akademik Mobile */}
                <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-[#D25026]">Data Akademik Mahasiswa</h3>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.75rem] font-semibold text-gray-700">Jumlah SKS yang dicapai <span className="font-normal text-gray-500">(tanpa D, E, Blank)</span></label>
                        <input
                            type="number"
                            name="sksDicapai"
                            value={formData.sksDicapai}
                            onChange={handleInputChange}
                            placeholder="e.g. 110"
                            disabled={isLoading}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#D25026]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.75rem] font-semibold text-gray-700">Jumlah SKS Tidak Lulus (D dan E)</label>
                        <input
                            type="number"
                            name="sksNilaiD"
                            value={formData.sksNilaiD}
                            onChange={handleInputChange}
                            placeholder="e.g. 0"
                            disabled={isLoading}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#D25026]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.75rem] font-semibold text-gray-700">Indeks Prestasi Komulatif (IPK)</label>
                        <input
                            type="text"
                            name="ipk"
                            value={formData.ipk}
                            onChange={handleInputChange}
                            placeholder="Ketik 3 angka (cth: 350 -> 3.50)"
                            disabled={isLoading}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#D25026]"
                        />
                        <p className="text-[10px] text-gray-500">Otomatis memasukkan titik (misal ketik 350 jadi 3.50)</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[0.75rem] font-semibold text-gray-700">Batas Studi (Tahun)</label>
                        <input
                            type="text"
                            name="batasStudi"
                            value={formData.batasStudi || (formData.tahunMasuk && !isNaN(parseInt(formData.tahunMasuk)) ? (parseInt(formData.tahunMasuk) + 6).toString() : "")}
                            onChange={handleInputChange}
                            placeholder="e.g. 2029 (Otomatis Tahun Masuk + 6)"
                            disabled={isLoading}
                            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:border-[#D25026]"
                        />
                    </div>
                </div>
            </>
        )}

        {/* Conditional Fields: Dosen */}
        {formData.role === 'dosen' && (
            <>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">NIDN / NIP</label>
                    <input
                        type="text"
                        name="nidn"
                        value={formData.nidn}
                        onChange={handleInputChange}
                        placeholder="NIDN / NIP"
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
                 <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">Peminatan</label>
                    <MultipleCombobox
                        options={peminatanOptions}
                        onOptionsChange={handlePeminatanChange}
                        placeholder="Pilih Peminatan"
                        className="w-full"
                    />
                </div>
                 <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">Kuota Maks. Bimbingan</label>
                    <input
                        type="number"
                        name="maxBimbingan"
                        value={formData.maxBimbingan}
                        onChange={handleInputChange}
                        placeholder="6"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                    <p className="text-[0.65rem] text-gray-500">Kosongkan untuk default (6).</p>
                </div>
            </>
        )}

        {/* Conditional Fields: Staf */}
        {formData.role === 'staf' && (
            <>
                <div className="flex flex-col gap-2">
                    <label className="text-[0.875rem] font-medium text-[#18181B]">NIP</label>
                    <input
                        type="text"
                        name="nip"
                        value={formData.nip}
                        onChange={handleInputChange}
                        placeholder="NIP"
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
                    />
                </div>
            </>
        )}

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

        {/* Email Field with Suffix Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Email</label>
          <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#D25026]/10 focus-within:border-[#D25026] overflow-hidden bg-white transition-all">
            <input
              type="text"
              name="emailPrefix"
              autoComplete="off"
              value={formData.emailPrefix}
              onChange={handleInputChange}
              placeholder={formData.role === 'mahasiswa' ? "Username / NPM" : "Username / NIDN"}
              disabled={isLoading}
              className="flex-1 px-4 py-3 outline-none text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] min-w-0"
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

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Password</label>
          <div className="flex flex-col gap-3">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
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
        </>
        ) : (
            // MASS REGISTRATION VIEW MOBILE
            <div className="flex flex-col gap-6 mt-2">
                
                {/* Guide Section */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-900">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex flex-col gap-1 text-[0.8125rem]">
                    <h4 className="font-bold">Panduan Kolom Excel ({formData.role})</h4>
                    <p className="opacity-90 leading-tight mb-2">
                      Pastikan baris pertama (header) file Excel Anda menggunakan format berikut.
                    </p>

                    {formData.role !== 'dosen' ? (
                      <div className="mt-1 border border-gray-300 bg-white rounded-md overflow-hidden max-w-full overflow-x-auto shadow-sm">
                        <table className="w-full text-left text-[10px] whitespace-nowrap">
                          <thead className="bg-[#f3f4f6]">
                            <tr>
                              <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 w-6 bg-[#e5e7eb] text-center"></th>
                              <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">A</th>
                              <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">B</th>
                              {formData.role === 'mahasiswa' && (
                                <>
                                  <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">C</th>
                                  <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">D</th>
                                  <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">E</th>
                                  <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">F</th>
                                  <th className="px-2 py-1.5 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">G</th>
                                  <th className="px-2 py-1.5 border-b border-gray-300 font-semibold text-gray-700 text-center">H</th>
                                </>
                              )}
                              {formData.role === 'staf' && (
                                 <th className="px-2 py-1.5 border-b border-gray-300 font-semibold text-gray-700 text-center">C</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-1.5 py-1 border-r border-b border-gray-300 bg-[#f3f4f6] text-gray-500 font-medium text-center w-6">1</td>
                              <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">
                                {formData.role === 'mahasiswa' ? 'NPM' : 'NIP'}
                              </td>
                              <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">Nama Lengkap</td>
                              {formData.role === 'mahasiswa' && (
                                <>
                                  <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">Email</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">Tahun Masuk</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">SKS Dicapai</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">IPK</td>
                                  <td className="px-2 py-1 border-r border-b border-gray-300 font-bold bg-blue-50/50">SKS Tidak Lulus</td>
                                  <td className="px-2 py-1 border-b border-gray-300 font-bold bg-blue-50/50">Batas Studi</td>
                                </>
                              )}
                              {formData.role === 'staf' && (
                                 <td className="px-2 py-1 border-b border-gray-300 font-bold bg-blue-50/50">Email</td>
                              )}
                            </tr>
                            <tr>
                              <td className="px-1.5 py-1 border-r border-gray-300 bg-[#f3f4f6] text-gray-500 font-medium text-center w-6">2</td>
                              <td className="px-2 py-1 border-r border-gray-300 text-gray-600">
                                {formData.role === 'mahasiswa' ? '4519...' : '1988...'}
                              </td>
                              <td className="px-2 py-1 border-r border-gray-300 text-gray-600">
                                {formData.role === 'mahasiswa' ? 'Budi S.' : 'Gede W.'}
                              </td>
                              {formData.role === 'mahasiswa' && (
                                 <>
                                   <td className="px-2 py-1 border-r border-gray-300 text-gray-400 italic">budi@student.. (ops)</td>
                                   <td className="px-2 py-1 border-r border-gray-300 text-gray-600 font-medium">2023 <span className="text-red-500 font-normal">(wajib)</span></td>
                                   <td className="px-2 py-1 border-r border-gray-300 text-gray-600 font-medium">110 <span className="text-red-500 font-normal">(wajib)</span></td>
                                   <td className="px-2 py-1 border-r border-gray-300 text-gray-600 font-medium">3.50 <span className="text-red-500 font-normal">(wajib)</span></td>
                                   <td className="px-2 py-1 border-r border-gray-300 text-gray-600 font-medium">0 <span className="text-orange-600 font-normal">(isi 0 jika tidak ada)</span></td>
                                   <td className="px-2 py-1 border-gray-300 text-gray-400 italic">2029</td>
                                 </>
                              )}
                              {formData.role === 'staf' && (
                                 <td className="px-2 py-1 border-gray-300 text-gray-400 italic">wahyu@..</td>
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      // Dosen (4 Tables stacked in Mobile)
                      <div className="flex flex-col gap-3 mt-1">
                        {/* Table A */}
                        <div className="border border-gray-300 bg-white rounded-md overflow-hidden max-w-full overflow-x-auto shadow-sm">
                          <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 border-b border-gray-300">A. Pejabat Prodi (Masekpro)</div>
                          <table className="w-full text-left text-[9px] whitespace-nowrap">
                            <thead className="bg-[#f3f4f6]">
                              <tr>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                                <th className="px-1.5 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-1.5 py-1 border-r border-gray-300 font-mono">031201</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Dr. Budi</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Pejabat Prodi</td>
                                <td className="px-1.5 py-1">Software Eng..</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Table B */}
                        <div className="border border-gray-300 bg-white rounded-md overflow-hidden max-w-full overflow-x-auto shadow-sm">
                          <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 border-b border-gray-300">B. Dosen Pembimbing</div>
                          <table className="w-full text-left text-[9px] whitespace-nowrap">
                            <thead className="bg-[#f3f4f6]">
                              <tr>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                                <th className="px-1.5 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-1.5 py-1 border-r border-gray-300 font-mono">031202</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Prof. Siti</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Dosen Pemb.</td>
                                <td className="px-1.5 py-1">Artificial Intel..</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Table C */}
                        <div className="border border-gray-300 bg-white rounded-md overflow-hidden max-w-full overflow-x-auto shadow-sm">
                          <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 border-b border-gray-300">C. Koordinator KP</div>
                          <table className="w-full text-left text-[9px] whitespace-nowrap">
                            <thead className="bg-[#f3f4f6]">
                              <tr>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                                <th className="px-1.5 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-1.5 py-1 border-r border-gray-300 font-mono">031203</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Pak Joko</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Koord. KP</td>
                                <td className="px-1.5 py-1">Network/Cyber..</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Table D */}
                        <div className="border border-gray-300 bg-white rounded-md overflow-hidden max-w-full overflow-x-auto shadow-sm">
                          <div className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 border-b border-gray-300">D. Dosen Reguler (Multi-Peminatan)</div>
                          <table className="w-full text-left text-[9px] whitespace-nowrap">
                            <thead className="bg-[#f3f4f6]">
                              <tr>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                                <th className="px-1.5 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                                <th className="px-1.5 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="px-1.5 py-1 border-r border-gray-300 font-mono">031204</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Bu Ani</td>
                                <td className="px-1.5 py-1 border-r border-gray-300">Dosen Reguler</td>
                                <td className="px-1.5 py-1">Data Science, AI</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                       type="file" 
                       accept=".xlsx, .xls" 
                       onChange={handleFileUpload}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="text-gray-700 text-sm font-medium mb-1">Upload Excel file</p>
                    <p className="text-gray-500 text-[11px] text-center">
                        Must contain {formData.role === 'mahasiswa' ? "NPM/NIM" : "NIDN/NIP"} and Nama columns
                    </p>
                </div>

                {fileName && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl text-orange-800">
                        <FileSpreadsheet className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div className="flex flex-col">
                            <span className="font-semibold text-xs truncate max-w-[150px]">{fileName}</span>
                            <span className="text-[10px] opacity-80">{massData.length} records parsed</span>
                        </div>
                        <button 
                            type="button"
                            onClick={clearExcel}
                            className="ml-auto p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors group"
                            aria-label="Remove uploaded file"
                        >
                            <X size={16} className="group-active:scale-95 transition-transform" />
                        </button>
                    </div>
                )}

                {massData.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                        <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 font-semibold text-xs text-gray-700 flex justify-between items-center">
                            <span>Preview ({massData.length} records)</span>
                            <button
                                type="button"
                                onClick={handleDownloadPreview}
                                className="px-2 py-1 text-[10px] font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-md transition-colors flex items-center gap-1"
                            >
                                <Download size={12} /> Download Excel
                            </button>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto max-h-[300px]">
                            <table className="w-full text-left text-[11px] text-gray-600">
                                <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                                    <tr>
                                        <th className="px-2 py-2 font-bold text-[9px] uppercase tracking-wider w-8 text-center">No</th>
                                        <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">{formData.role === 'mahasiswa' ? 'NPM' : 'NIDN'}</th>
                                        <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Nama</th>
                                        <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Email</th>
                                        <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Password</th>
                                        {formData.role === 'mahasiswa' ? (
                                            <>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Masuk</th>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">SKS</th>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">IPK</th>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">D/E</th>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Batas</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Jabatan</th>
                                                <th className="px-3 py-2 font-bold text-[9px] uppercase tracking-wider">Peminatan</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {massData.map((user, idx) => (
                                        <tr key={idx} className="active:bg-orange-50 transition-colors">
                                            <td className="px-2 py-2 text-center text-gray-400 font-medium border-r border-gray-100">{idx + 1}</td>
                                            <td className="px-3 py-2 font-mono text-gray-700">{user.nim}</td>
                                            <td className="px-3 py-2 truncate max-w-[80px] font-medium">{user.nama}</td>
                                            <td className="px-3 py-2 truncate max-w-[80px] text-gray-500">{user.email}</td>
                                            <td className="px-3 py-2 font-mono text-orange-600 bg-gray-50/50">{user.password}</td>
                                            {formData.role === 'mahasiswa' ? (
                                                <>
                                                    <td className="px-3 py-2 text-gray-600">{user.tahunMasuk}</td>
                                                    <td className="px-3 py-2 text-gray-600">{user.sksDicapai || "-"}</td>
                                                    <td className="px-3 py-2 text-gray-600">{user.ipk || "-"}</td>
                                                    <td className="px-3 py-2 text-gray-600">{user.sksNilaiD || "0"}</td>
                                                    <td className="px-3 py-2 text-gray-600">{user.batasStudi || "-"}</td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-3 py-2 text-gray-600">{user.jabatan}</td>
                                                    <td className="px-3 py-2 text-gray-600 truncate max-w-[100px]">
                                                        {user.peminatan && Array.isArray(user.peminatan) && user.peminatan.length > 0
                                                            ? user.peminatan.join(", ")
                                                            : (typeof user.peminatan === 'string' && user.peminatan ? user.peminatan : "-")}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        )}

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
        <div className="fixed top-12 left-6 right-6 z-[100]">
          <Toast
            title={toastProps?.title}
            variant={toastProps?.variant}
            onClose={() => setToastProps(null)}
            className="w-full shadow-lg"
          />
        </div>
      )}
    </div>
  );
};
