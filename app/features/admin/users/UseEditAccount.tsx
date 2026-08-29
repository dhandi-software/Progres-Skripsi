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
        emailPrefix: "",
        emailDomain: "@univpancasila.ac.id",
        email: "",
        name: "",
        password: "", // Optional for edit
        role: "mahasiswa",
        // Specific fields
        nim: "",
        tahunMasuk: "",
        sksDicapai: "",
        ipk: "",
        sksNilaiD: "",
        batasStudi: "",
        nidn: "",
        jabatan: "",
        peminatan: [] as string[],
        maxBimbingan: "",
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

            const fullEmail = user.mahasiswa?.email || user.dosen?.email || user.staf?.email || user.email || "";
            const parts = fullEmail.split("@");
            const emailPrefix = parts[0] ? parts[0].toLowerCase() : "";
            const emailDomain = parts[1] ? `@${parts[1]}` : "@univpancasila.ac.id";

            setFormData({
                emailPrefix,
                emailDomain,
                email: fullEmail,
                name: user.nama || user.name || "",
                password: "********", // Show placeholder password
                role: user.role,
                nim: user.nim || user.mahasiswa?.nim || "",
                tahunMasuk: user.tahunMasuk || user.mahasiswa?.tahunMasuk || "",
                sksDicapai: user.sksDicapai || user.mahasiswa?.sksDicapai || "",
                ipk: user.ipk || user.mahasiswa?.ipk || "",
                sksNilaiD: user.sksNilaiD !== undefined && user.sksNilaiD !== null ? String(user.sksNilaiD) : (user.mahasiswa?.sksNilaiD !== undefined && user.mahasiswa?.sksNilaiD !== null ? String(user.mahasiswa.sksNilaiD) : ""),
                batasStudi: user.batasStudi || user.mahasiswa?.batasStudi || "",
                nidn: user.nidn || "",
                jabatan: user.jabatan || "",
                peminatan: user.peminatan || [],
                maxBimbingan: user.dosen?.maxBimbingan !== undefined ? String(user.dosen.maxBimbingan) : user.maxBimbingan !== undefined ? String(user.maxBimbingan) : "",
            });
        } catch (error) {
            console.error("Failed to fetch user", error);
            showToast("Failed to fetch user details", "destructive");
            navigate("/admin/users");
        } finally {
            setInitialLoading(false);
        }
    };

    const formatIpk = (val: string) => {
        let clean = val.replace(/[^\d.]/g, '');
        if (clean.includes('.')) {
            const parts = clean.split('.');
            const intPart = parts[0].slice(0, 1);
            const decPart = parts[1].slice(0, 2);
            return `${intPart}.${decPart}`;
        }
        if (clean.length === 0) return '';
        if (clean.length === 1) return clean;
        if (clean.length === 2) return `${clean[0]}.${clean[1]}`;
        if (clean.length >= 3) return `${clean[0]}.${clean.slice(1, 3)}`;
        return clean;
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        let { name, value } = e.target;

        // Numeric validation for NIM, NIDN, and SKS
        if (
            (name === "nim" || name === "nidn" || name === "sksDicapai" || name === "sksNilaiD") &&
            value &&
            !/^\d*$/.test(value)
        ) {
            return;
        }

        if (name === "ipk") {
            value = formatIpk(value);
        }

        if (name === "emailPrefix") {
            value = value.toLowerCase().replace(/\s+/g, "").replace(/@.*/g, "");
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
        const fullEmail = `${(formData.emailPrefix || "").toLowerCase()}${formData.emailDomain || "@univpancasila.ac.id"}`;
        const allowedDomains = ["@univpancasila.ac.id", "@student.univpancasila.ac.id", "@student.univ.ac.id", "@univ.ac.id", "@gmail.com"];
        const isValidDomain = allowedDomains.some(domain => fullEmail.endsWith(domain));
        if (!isValidDomain) {
            showToast("Email harus berakhiran @univpancasila.ac.id, @student.univpancasila.ac.id, @student.univ.ac.id, @univ.ac.id, atau @gmail.com", "destructive");
            return;
        }

        setIsLoading(true);
        try {
            const payload: any = {
                ...formData,
                email: fullEmail
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
        navigate,
        setFormData
    };
};
