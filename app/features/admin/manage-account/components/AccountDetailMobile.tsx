import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useManageAccount, type UserAccount } from "../UseManageAccount";
import { cn } from "~/lib/utils";
import { useSidebar } from "~/components/ui/sidebar";
import { Toast } from "~/components/ui/toast";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { Button } from "~/components/ui/button";
import { MultipleCombobox, type ComboboxOption } from "~/components/ui/Multiple-combobox";

export const AccountDetailMobile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setOpenMobile } = useSidebar();
  const { getUserById, updateUserRole, updateUser, deleteAccount } = useManageAccount();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserAccount["role"] | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [peminatanOptions, setPeminatanOptions] = useState<ComboboxOption[]>([
    { id: "ds", label: "Data Science", checked: false },
    { id: "ai", label: "Artificial Intelligence", checked: false },
    { id: "se", label: "Software Engineering", checked: false },
    { id: "ncs", label: "Network and Cyber Security", checked: false },
  ]);

  const handlePeminatanChange = (newOptions: ComboboxOption[]) => {
    setPeminatanOptions(newOptions);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        setIsLoading(true);
        const data = await getUserById(id);
        if (data) {
          setUser(data);
          setSelectedRole(data.role);
          if (data.peminatan) {
            setPeminatanOptions(prev => prev.map(opt => ({
              ...opt,
              checked: data.peminatan.includes(opt.label)
            })));
          }
        }
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsRoleOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center text-center h-screen bg-white">
        <h2 className="text-[1.25rem] font-bold text-[#18181B] mb-4">User not found</h2>
        <button
          onClick={() => navigate("/admin/manage-account")}
          className="w-full py-3.5 bg-[#FDBC74] text-white rounded-xl font-bold"
        >
          Back to Manage Account
        </button>
      </div>
    );
  }

  const handleRoleChange = (role: UserAccount["role"]) => {
    setSelectedRole(role);
    setIsRoleOpen(false);
  };

  const handleConfirmChange = async () => {
    if (id) {
      let dataToUpdate: any = {};
      if (selectedRole !== user.role) {
        dataToUpdate.role = selectedRole;
      }
      
      const selectedPeminatan = peminatanOptions.filter(opt => opt.checked).map(opt => opt.label);
      
      let isPeminatanChanged = false;
      if (user.role === 'dosen') {
        const initialPeminatan = (user as any).peminatan || [];
        isPeminatanChanged = JSON.stringify(selectedPeminatan.sort()) !== JSON.stringify(initialPeminatan.sort());
        if (isPeminatanChanged) {
          dataToUpdate.peminatan = selectedPeminatan;
        }
      }

      if (Object.keys(dataToUpdate).length > 0) {
        const success = await updateUser(id, dataToUpdate);
        if (success) {
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      }
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (id) {
      const success = await deleteAccount(id);
      if (success) {
        navigate("/admin/manage-account", {
          state: {
            toast: {
              title: "Account successfully deleted!",
              variant: "success"
            }
          }
        });
      }
    }
  };

  const roles: UserAccount["role"][] = ["admin", "writer", "editor"];

  return (
    <div className="w-full min-h-screen pt-4 pb-20 bg-white flex flex-col font-geist relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 w-auto">
          <Toast
            title="Account updated successfully!"
            variant="success"
            className="shadow-md border border-[#22C55E]/10 px-4 py-3 rounded-xl bg-white/95 backdrop-blur-sm"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}

      {/* Modal Section */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={
          <span>
            Delete <span className="font-bold">{user.name}</span>
          </span>
        }
        description={
          <span>
            Are you sure you want to delete this Account? This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        cancelText="Cancel"
      />
      
      {/* Header Section */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/manage-account")}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#0D0D12]" />
        </button>
        <h1 className="text-[1.25rem] font-bold text-[#0D0D12]">
          Account Detail
        </h1>
      </div>

      <div className="px-6 flex flex-col gap-8">
        {/* Avatar Section */}
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#E4E4E7] shadow-sm">
          <img
            src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-6">
          {/* Role Dropdown */}
          <div className="flex flex-col gap-2">
            <label className="text-[0.875rem] font-medium text-[#18181B]">Role</label>
            <div className="relative w-full" ref={filterRef}>
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3.5 rounded-xl border border-[#E4E4E7] bg-white text-[0.875rem] transition-all",
                  isRoleOpen ? "ring-2 ring-[#D25026]/10 border-[#D25026]" : ""
                )}
              >
                <span className="text-[#18181B] font-medium capitalize">{selectedRole}</span>
                <ChevronDown className={cn("w-4 h-4 text-[#71717A] transition-transform", isRoleOpen && "rotate-180")} />
              </button>

              {isRoleOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E4E4E7] rounded-xl shadow-xl z-20 overflow-hidden">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "w-full px-4 py-4 text-left text-[0.875rem] transition-colors border-b border-[#F4F4F5] last:border-0 capitalize",
                        selectedRole === role ? "bg-[#F4F4F5] text-[#18181B] font-bold" : "hover:bg-gray-50 text-[#18181B]"
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email || (user as any).mahasiswa?.email || (user as any).dosen?.email || (user as any).staf?.email },
            { label: "Username", value: user.username },
            { label: "Password", value: user.password },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-medium text-[#18181B]">{field.label}</label>
              <div className="w-full px-4 py-3.5 rounded-xl border border-[#F4F4F5] bg-[#FAFAFA] text-[#18181B] text-[0.875rem]">
                {field.label === "Password" ? "•".repeat(16) : field.value}
              </div>
            </div>
          ))}

          {user.role === "dosen" && (
            <div className="flex flex-col gap-2">
              <label className="text-[0.875rem] font-medium text-[#18181B]">Peminatan</label>
              <MultipleCombobox
                options={peminatanOptions}
                onOptionsChange={handlePeminatanChange}
                placeholder="Pilih Peminatan"
                className="w-full"
              />
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[0.875rem] font-medium text-[#18181B]">Bio</label>
            <div className="w-full px-4 py-3.5 rounded-xl border border-[#F4F4F5] bg-[#FAFAFA] text-[#18181B] text-[0.875rem] leading-relaxed min-h-[6rem]">
              {user.bio}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-4 no-scrollbar">
          <Button
            onClick={() => navigate("/admin/manage-account")}
            variant="outline"
            className="h-[2.625rem] px-4 rounded-xl border-[#E4E4E7] text-[0.8125rem] font-semibold text-[#18181B] flex-shrink-0"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="h-[2.625rem] px-4 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-[0.8125rem] font-semibold flex-shrink-0"
          >
            Delete
          </Button>
          <Button
            onClick={handleConfirmChange}
            className="h-[2.625rem] px-4 rounded-xl bg-[#FDBC74] hover:bg-[#FDB15A] text-white text-[0.8125rem] font-semibold whitespace-nowrap flex-shrink-0"
            disabled={
              selectedRole === user.role && 
              (user.role !== 'dosen' || JSON.stringify(peminatanOptions.filter(opt => opt.checked).map(opt => opt.label).sort()) === JSON.stringify(((user as any).peminatan || []).sort()))
            }
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};
