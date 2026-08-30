import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { Toast } from "~/components/ui/toast";
import { Check, ChevronDown, Eye, EyeOff, Loader2, X, ArrowLeft, UploadCloud, FileSpreadsheet, Download } from "lucide-react";
import { useNavigate } from "react-router";
import { CustomSelect } from "~/components/ui/custom-select";
import { MultipleCombobox, type ComboboxOption } from "~/components/ui/Multiple-combobox";

import NotFoundRoute from "~/routes/$";

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
        {/* Registration Mode Selection */}
        {(formData.role === 'mahasiswa' || formData.role === 'dosen') && (
          <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setRegistrationMode('manual')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                registrationMode === 'manual' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Manual Input
            </button>
            <button
              type="button"
              onClick={() => setRegistrationMode('mass')}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                registrationMode === 'mass' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              Import Excel
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#18181B]">Role</label>
          <div className="flex gap-4">
            {['Mahasiswa', 'Dosen', 'Staf'].map((role) => (
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

        {registrationMode === 'manual' ? (
          <>
            <div className="flex flex-col gap-6">

              {/* Conditional Fields for Mahasiswa */}
              {formData.role === 'mahasiswa' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-base font-semibold text-[#18181B]">NIM / NPM</label>
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

                  {/* Data Akademik */}
                  <div className="p-4 bg-orange-50/40 border border-orange-100 rounded-xl flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-[#D25026]">Data Akademik Mahasiswa</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold text-gray-700">Jumlah SKS yang dicapai <span className="text-[11px] font-normal text-gray-500">(tanpa D, E, Blank)</span></label>
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
              {formData.role === 'dosen' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-base font-semibold text-[#18181B]">NIDN / NIP</label>
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
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-base font-semibold text-[#18181B]">Peminatan</label>
                    <MultipleCombobox
                      options={peminatanOptions}
                      onOptionsChange={handlePeminatanChange}
                      placeholder="Pilih Peminatan"
                      className="w-full"
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

              {/* Conditional Fields for Staf */}
              {formData.role === 'staf' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="text-base font-semibold text-[#18181B]">NIP</label>
                    <input
                      type="text"
                      name="nip"
                      value={formData.nip}
                      onChange={handleInputChange}
                      placeholder="e.g. 198801032019031002"
                      disabled={isLoading}
                      className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-base disabled:opacity-50 disabled:bg-gray-50 bg-white"
                    />
                  </div>
                </div>
              )}

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

            {/* Email Field with Domain Suffix */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-base font-semibold text-[#18181B]">Email</label>
                <span className="text-xs text-gray-500 font-medium">Domain otomatis terpasang</span>
              </div>
              <div className="flex rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-[#D25026]/10 focus-within:border-[#D25026] overflow-hidden bg-white shadow-sm transition-all">
                <input
                  type="text"
                  name="emailPrefix"
                  autoComplete="off"
                  value={formData.emailPrefix}
                  onChange={handleInputChange}
                  placeholder={formData.role === 'mahasiswa' ? "Username / NPM (misal: budi atau 4519210001)" : "Username / NIDN (misal: dosen.budi)"}
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
                Alamat Email: <span className="font-semibold text-gray-800">{(formData.emailPrefix || "username")}{formData.emailDomain}</span>
              </p>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#18181B]">Password</label>
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
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
          </>
        ) : (
          // MASS REGISTRATION VIEW
          <div className="flex flex-col gap-6 mt-4">
            
            {/* Guide Section */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col gap-4 text-blue-900">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-base">Panduan Format Kolom Excel ({formData.role})</h4>
              </div>
              <p className="opacity-90 text-sm">
                Pastikan baris pertama (header) pada file Excel Anda menggunakan format nama kolom berikut. Berikut adalah contohnya:
              </p>

              {formData.role !== 'dosen' ? (
                // Mahasiswa or Staf (1 Table)
                <div className="border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-[#f3f4f6]">
                      <tr>
                        <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 w-8 bg-[#e5e7eb] text-center"></th>
                        <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">A</th>
                        <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">B</th>
                        {formData.role === 'mahasiswa' && (
                          <>
                            <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">C</th>
                            <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">D</th>
                            <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">E</th>
                            <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">F</th>
                            <th className="px-3 py-2 border-r border-b border-gray-300 font-semibold text-gray-700 text-center">G</th>
                            <th className="px-3 py-2 border-b border-gray-300 font-semibold text-gray-700 text-center">H</th>
                          </>
                        )}
                        {formData.role === 'staf' && (
                           <th className="px-3 py-2 border-b border-gray-300 font-semibold text-gray-700 text-center">C</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-2 py-1 border-r border-b border-gray-300 bg-[#f3f4f6] text-gray-500 font-medium text-center">1</td>
                        <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">
                          {formData.role === 'mahasiswa' ? 'NPM' : 'NIP'}
                        </td>
                        <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">Nama Lengkap</td>
                        {formData.role === 'mahasiswa' && (
                          <>
                            <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">Email</td>
                            <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">Tahun Masuk</td>
                            <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">SKS Dicapai</td>
                            <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">IPK</td>
                            <td className="px-3 py-1.5 border-r border-b border-gray-300 font-bold bg-blue-50/50">SKS Tidak Lulus</td>
                            <td className="px-3 py-1.5 border-b border-gray-300 font-bold bg-blue-50/50">Batas Studi</td>
                          </>
                        )}
                        {formData.role === 'staf' && (
                           <td className="px-3 py-1.5 border-b border-gray-300 font-bold bg-blue-50/50">Email</td>
                        )}
                      </tr>
                      <tr>
                        <td className="px-2 py-1 border-r border-gray-300 bg-[#f3f4f6] text-gray-500 font-medium text-center">2</td>
                        <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600">
                          {formData.role === 'mahasiswa' ? '4519210001' : '198801032'}
                        </td>
                        <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600">
                          {formData.role === 'mahasiswa' ? 'Budi Santoso' : 'Gede Wahyu'}
                        </td>
                        {formData.role === 'mahasiswa' && (
                          <>
                            <td className="px-3 py-1.5 border-r border-gray-300 text-gray-400 italic">budi@student.univ.ac.id (ops)</td>
                            <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600 font-medium">2023 <span className="text-red-500 font-normal">(wajib)</span></td>
                            <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600 font-medium">110 <span className="text-red-500 font-normal">(wajib)</span></td>
                            <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600 font-medium">3.50 <span className="text-red-500 font-normal">(wajib)</span></td>
                            <td className="px-3 py-1.5 border-r border-gray-300 text-gray-600 font-medium">0 <span className="text-orange-600 font-normal">(isi 0 jika tidak ada)</span></td>
                            <td className="px-3 py-1.5 border-gray-300 text-gray-400 italic">2029 (ops)</td>
                          </>
                        )}
                        {formData.role === 'staf' && (
                           <td className="px-3 py-1.5 border-gray-300 text-gray-400 italic">wahyu@univ.ac.id (ops)</td>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                // Dosen (4 Tables in a 2x2 grid)
                <div className="grid grid-cols-2 gap-4">
                  {/* Table A */}
                  <div className="border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 border-b border-gray-300">A. Contoh: Pejabat Prodi (Masekpro)</div>
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-[#f3f4f6]">
                        <tr>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                          <th className="px-2 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-mono">031201</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Dr. Budi</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Pejabat Prodi</td>
                          <td className="px-2 py-1.5 text-gray-600 truncate max-w-[100px]">Software Engineering</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table B */}
                  <div className="border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 border-b border-gray-300">B. Contoh: Dosen Pembimbing</div>
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-[#f3f4f6]">
                        <tr>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                          <th className="px-2 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-mono">031202</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Prof. Siti</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Dosen Pembimbing</td>
                          <td className="px-2 py-1.5 text-gray-600 truncate max-w-[100px]">Artificial Intelligence</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table C */}
                  <div className="border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 border-b border-gray-300">C. Contoh: Koordinator KP</div>
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-[#f3f4f6]">
                        <tr>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                          <th className="px-2 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-mono">031203</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Pak Joko</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Koordinator KP</td>
                          <td className="px-2 py-1.5 text-gray-600 truncate max-w-[100px]">Network and Cyber Security</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Table D */}
                  <div className="border border-gray-300 bg-white rounded-md overflow-hidden shadow-sm">
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1.5 border-b border-gray-300">D. Contoh: Dosen Reguler (Multi-Peminatan)</div>
                    <table className="w-full text-left text-[11px] whitespace-nowrap">
                      <thead className="bg-[#f3f4f6]">
                        <tr>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">NIDN</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Nama</th>
                          <th className="px-2 py-1 border-r border-b border-gray-300 font-semibold">Jabatan</th>
                          <th className="px-2 py-1 border-b border-gray-300 font-semibold">Peminatan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-mono">031204</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Bu Ani</td>
                          <td className="px-2 py-1.5 border-r border-gray-300 text-gray-600">Dosen Reguler</td>
                          <td className="px-2 py-1.5 text-gray-600 truncate max-w-[100px]">Data Science, AI</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-1">Click to upload Excel file</p>
              <p className="text-gray-500 text-sm">
                Must contain {formData.role === 'mahasiswa' ? "NPM/NIM" : "NIDN/NIP"} and Nama columns (.xlsx, .xls)
              </p>
            </div>

            {fileName && (
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800">
                <FileSpreadsheet className="w-6 h-6 text-orange-600" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{fileName}</span>
                  <span className="text-xs opacity-80">{massData.length} records parsed</span>
                </div>
                <button
                  type="button"
                  onClick={clearExcel}
                  className="ml-auto p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition-colors group"
                  aria-label="Remove uploaded file"
                >
                  <X size={18} className="group-active:scale-95 transition-transform" />
                </button>
              </div>
            )}

            {massData.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-sm text-gray-700 flex justify-between items-center">
                  <span>Data Preview ({massData.length} records)</span>
                  <button
                    type="button"
                    onClick={handleDownloadPreview}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-700 bg-orange-100 hover:bg-orange-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download Excel
                  </button>
                </div>
                <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-gray-600 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider w-12 text-center">No</th>
                        <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">{formData.role === 'mahasiswa' ? 'NPM' : 'NIDN'}</th>
                        <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Nama</th>
                        <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Password</th>
                        {formData.role === 'mahasiswa' ? (
                          <>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Tahun Masuk</th>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">SKS</th>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">IPK</th>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">SKS D/E</th>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Batas Studi</th>
                          </>
                        ) : (
                          <>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Jabatan</th>
                            <th className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider">Peminatan</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {massData.map((user, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition-colors">
                          <td className="px-4 py-3 text-center font-medium text-gray-400 border-r border-gray-100">{idx + 1}</td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-700">{user.nim}</td>
                          <td className="px-4 py-3 truncate max-w-[150px] font-medium">{user.nama}</td>
                          <td className="px-4 py-3 truncate max-w-[150px] text-gray-500">{user.email}</td>
                          <td className="px-4 py-3 font-mono text-xs bg-gray-50/50 text-orange-600">{user.password}</td>
                          {formData.role === 'mahasiswa' ? (
                            <>
                              <td className="px-4 py-3 text-gray-600">{user.tahunMasuk}</td>
                              <td className="px-4 py-3 text-gray-600">{user.sksDicapai || "-"}</td>
                              <td className="px-4 py-3 text-gray-600">{user.ipk || "-"}</td>
                              <td className="px-4 py-3 text-gray-600">{user.sksNilaiD || "0"}</td>
                              <td className="px-4 py-3 text-gray-600">{user.batasStudi || "-"}</td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-gray-600">{user.jabatan}</td>
                              <td className="px-4 py-3 text-gray-600 truncate max-w-[200px]">
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
            title={toastProps?.title}
            variant={toastProps?.variant}
            onClose={() => setToastProps(null)}
          />
        </div>
      )}
    </div>
  );
};
