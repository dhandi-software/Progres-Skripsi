import { Eye, EyeOff, Check, X, ChevronDown, Menu, Loader2 } from "lucide-react";
import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { useSidebar } from "~/components/ui/sidebar";
import { Toast } from "~/components/ui/toast";

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
            Create New User Account
          </h1>
        </div>
        <p className="text-[0.75rem] text-[#71717A] pl-9 leading-relaxed">
          Create a new user account for the news portal management system. Select the appropriate access role.
        </p>
      </div>

      <div className="px-6 flex flex-col gap-6">
        {/* Email Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="johndoe@gmail.com"
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
          />
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
            className="w-full px-4 py-3 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
          />
          <p className="text-[#71717A] text-[0.75rem] leading-snug">
            Real name is permanent and cannot be changed after registration.
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
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full px-4 py-3 pr-12 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50"
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
              className="w-full py-3.5 rounded-xl border border-[#E4E4E7] text-[0.8125rem] font-medium text-[#18181B] hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            >
              Generate Password
            </button>
          </div>

          {/* Password Validation Checklist */}
          <div className="mt-2 flex flex-col gap-2">
            {[
              { label: "Consists of at least 8 characters.", valid: passwordValidation.length },
              { label: "Must begin with an uppercase letter [A-Z] followed by lowercase letters [a-z].", valid: passwordValidation.pattern },
              { label: "Contains at least one number (0-9).", valid: passwordValidation.number },
              { label: "Contains at least one symbol (e.g., !, @, #, $, %, &, *).", valid: passwordValidation.symbol },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[0.75rem] leading-tight">
                <div className={cn(
                  "mt-0.5 transition-colors",
                  item.valid ? "text-[#22C55E]" : "text-[#EF4444]"
                )}>
                  {item.valid ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                </div>
                <span className={cn(
                  "transition-colors",
                  item.valid ? "text-[#22C55E]" : "text-[#71717A]"
                )}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Field */}
        <div className="flex flex-col gap-2">
          <label className="text-[0.875rem] font-medium text-[#18181B]">Role</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 rounded-xl border flex items-center justify-between bg-white transition-all text-[0.875rem] disabled:opacity-50 disabled:bg-gray-50",
                isRoleOpen ? "border-[#D25026] ring-2 ring-[#D25026]/10" : "border-[#E4E4E7]"
              )}
            >
              <span className={cn(formData.role ? "text-[#18181B]" : "text-[#A1A1AA]")}>
                {formData.role || "Select a role"}
              </span>
              <ChevronDown className={cn("text-[#A1A1AA] transition-transform duration-200", isRoleOpen && "rotate-180")} size={18} />
            </button>

            {isRoleOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-xl shadow-lg overflow-hidden z-20">
                {["Writer", "Editor"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      handleRoleChange(role);
                      setIsRoleOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3.5 text-left text-[0.875rem] transition-colors first:border-b first:border-[#F4F4F5]",
                      formData.role === role ? "bg-[#F4F4F5] text-[#18181B]" : "hover:bg-gray-50 text-[#18181B]"
                    )}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex justify-end gap-3">
          <button
            type="button"
            className="px-6 py-2.5 rounded-xl border border-[#E4E4E7] text-[0.8125rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
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
