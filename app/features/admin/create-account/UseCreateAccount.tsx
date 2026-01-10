import { useState } from "react";
import { userApi } from "~/api/userApi";
import type { RegisterRequest } from "~/api/types";

interface ToastProps {
  title: string;
  variant: "success" | "destructive" | "default";
}

export const useCreateAccount = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  const showToast = (
    title: string,
    variant: "success" | "destructive" | "default" = "success"
  ) => {
    setToastProps({ title, variant });
    setTimeout(() => {
      setToastProps(null);
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setFormData((prev) => ({ ...prev, password: retVal }));
  };

  const passwordValidation = {
    length: formData.password.length >= 8,
    pattern: /^[A-Z][a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    symbol: /[!@#$%&*]/.test(formData.password),
  };

  const validate = () => {
    if (!formData.email) {
      showToast("Email is required", "destructive");
      return false;
    }
    if (!formData.name) {
      showToast("Name is required", "destructive");
      return false;
    }
    if (!formData.password) {
      showToast("Password is required", "destructive");
      return false;
    }
    if (!formData.role) {
      showToast("Role is required", "destructive");
      return false;
    }
    if (!passwordValidation.length || !passwordValidation.pattern || !passwordValidation.number || !passwordValidation.symbol) {
      showToast("Password does not meet requirements", "destructive");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: RegisterRequest = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase() as "admin" | "writer" | "editor",
      };

      await userApi.register(payload);
      showToast("Account created successfully", "success");

      // Reset form
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "",
      });
    } catch (error: any) {
      const message = error.message || "Failed to create account";
      showToast(message, "destructive");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
};
