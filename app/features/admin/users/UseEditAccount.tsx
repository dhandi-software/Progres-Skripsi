import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { adminApi } from "~/api/admin";

interface ToastProps {
    title: string;
    variant: "success" | "destructive" | "default";
}

export const useEditAccount = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [formData, setFormData] = useState({
        email: "",
        name: "",
        password: "", // Optional for edit
        role: "mahasiswa",
        // Specific fields
        nim: "",
        jurusan: "",
        tahunMasuk: "",
        nidn: "",
        jabatan: "",
    });

    const [initialLoading, setInitialLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [toastProps, setToastProps] = useState<ToastProps | null>(null);

    const showToast = (
        title: string,
        variant: "success" | "destructive" | "default" = "success",
    ) => {
        setToastProps({ title, variant });
        setTimeout(() => setToastProps(null), 3000);
    };

    useEffect(() => {
        if (id) {
            fetchUser(id);
        }
    }, [id]);

    const fetchUser = async (userId: string) => {
        setInitialLoading(true);
        try {
            const res = await adminApi.getUserById(userId);
            const user = res.data;

            setFormData({
                email: user.email,
                name: user.nama || user.name || "",
                password: "********", // Show placeholder password
                role: user.role,
                nim: user.nim || "",
                jurusan: user.jurusan || "",
                tahunMasuk: user.tahunMasuk || "",
                nidn: user.nidn || "",
                jabatan: user.jabatan || "",
            });
        } catch (error) {
            console.error("Failed to fetch user", error);
            showToast("Failed to fetch user details", "destructive");
            navigate("/admin/users");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;

        // Numeric validation for NIM and NIDN
        if (
            (name === "nim" || name === "nidn") &&
            value &&
            !/^\d*$/.test(value)
        ) {
            return; // Ignore non-numeric input
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const generatePassword = () => {
        const length = 12;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let retVal = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        setFormData((prev) => ({ ...prev, password: retVal }));
        // Ensure visibility is on so user can see what was generated
        setShowPassword(true);
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const payload: any = {
                ...formData,
            };

            // If empty string (user cleared it) or default placeholder, we don't update password.
            if (!formData.password || formData.password === "********") {
                delete payload.password;
            }

            await adminApi.updateUser(id!, payload);
            showToast("User updated successfully", "success");

            setTimeout(() => {
                navigate(`/admin/users?tab=${formData.role}`);
            }, 1000);
        } catch (error: any) {
            console.error("Update failed", error);
            showToast(
                error.response?.data?.message || "Failed to update user",
                "destructive",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return {
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
    };
};
