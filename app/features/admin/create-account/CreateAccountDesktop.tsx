import { useCreateAccount } from "./UseCreateAccount";
import { cn } from "~/lib/utils";
import { useState } from "react";
import { Toast } from "~/components/ui/toast";
import { Check, ChevronDown, Eye, EyeOff, Loader2, X } from "lucide-react";

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
  } = useCreateAccount();

  const [isRoleOpen, setIsRoleOpen] = useState(false);

  return (
    <div className="p-10 max-w-[77.5rem] font-geist">
      <div className="mb-10">
        <h1 className="text-[2.5rem] font-semibold text-[#18181B] leading-tight mb-3">
          Create New User Account
        </h1>
        <p className="text-[#71717A] text-[1rem]">
          Create a new user account for the news portal management system. Select the appropriate access role.
        </p>
      </div>

      <div className="flex flex-col gap-8 max-w-[56.25rem]">
        {/* Email Field */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[1.125rem] font-medium text-[#18181B]">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="johndoe@gmail.com"
            disabled={isLoading}
            className="w-full px-5 py-3.5 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[1rem] disabled:opacity-50 disabled:bg-gray-50"
          />
        </div>

        {/* Name Field */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[1.125rem] font-medium text-[#18181B]">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter name"
            disabled={isLoading}
            className="w-full px-5 py-3.5 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[1rem] disabled:opacity-50 disabled:bg-gray-50"
          />
          <p className="text-[#71717A] text-[0.8125rem] leading-relaxed">
            Please fill in your real name. This name will become your permanent account identity and cannot be changed after registration.
          </p>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[1.125rem] font-medium text-[#18181B]">Password</label>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full px-5 py-3.5 pr-14 rounded-xl border border-[#E4E4E7] focus:outline-none focus:ring-2 focus:ring-[#D25026]/10 focus:border-[#D25026] transition-all text-[#18181B] placeholder:text-[#A1A1AA] text-[1rem] disabled:opacity-50 disabled:bg-gray-50"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#71717A] transition-colors disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            <button
              type="button"
              onClick={generatePassword}
              disabled={isLoading}
              className="px-6 py-3.5 rounded-xl border border-[#E4E4E7] text-[0.875rem] font-medium text-[#18181B] hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap disabled:opacity-50"
            >
              Generate Password
            </button>
          </div>

          {/* Password Validation Checklist */}
          <div className="mt-3 flex flex-col gap-2">
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
          </div>
        </div>

        {/* Role Field */}
        <div className="flex flex-col gap-2.5">
          <label className="text-[1.125rem] font-medium text-[#18181B]">Role</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleOpen(!isRoleOpen)}
              disabled={isLoading}
              className={cn(
                "w-full px-5 py-3.5 rounded-xl border flex items-center justify-between bg-white transition-all disabled:opacity-50 disabled:bg-gray-50",
                isRoleOpen ? "border-[#D25026] ring-2 ring-[#D25026]/10" : "border-[#E4E4E7]"
              )}
            >
              <span className={cn("text-[1rem]", formData.role ? "text-[#18181B]" : "text-[#A1A1AA]")}>
                {formData.role || "Select a role"}
              </span>
              <ChevronDown className={cn("text-[#A1A1AA] transition-transform duration-200", isRoleOpen && "rotate-180")} size={22} />
            </button>

            {isRoleOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E4E4E7] rounded-xl shadow-lg overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                {["Writer", "Editor"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      handleRoleChange(role);
                      setIsRoleOpen(false);
                    }}
                    className={cn(
                      "w-full px-5 py-3.5 text-left text-[1rem] transition-colors first:border-b first:border-[#F4F4F5]",
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
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            className="px-8 py-3 rounded-xl border border-[#E4E4E7] text-[1rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm disabled:opacity-50"
            disabled={isLoading}
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
            {isLoading ? "Processing..." : "Confirm"}
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
