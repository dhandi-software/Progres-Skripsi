import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useManageAccount, type UserAccount } from "../UseManageAccount";
import { cn } from "~/lib/utils";
import { Toast } from "~/components/ui/toast";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

export const AccountDetailDesktop = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getUserById, updateUserRole, deleteAccount } = useManageAccount();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserAccount["role"] | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        setIsLoading(true);
        const data = await getUserById(id);
        if (data) {
          setUser(data);
          setSelectedRole(data.role);
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
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center h-full">
        <h2 className="text-[1.5rem] font-semibold text-[#18181B] mb-4">User not found</h2>
        <button
          onClick={() => navigate("/admin/manage-account")}
          className="px-6 py-2.5 bg-[#FDBC74] text-white rounded-xl font-semibold"
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
    if (selectedRole && id) {
      const success = await updateUserRole(id, selectedRole);
      if (success) {
        setShowToast(true);
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
    <div className="p-10 w-full font-geist relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 right-10 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <Toast
            title="Role successfully changed!"
            variant="success"
            onClose={() => setShowToast(false)}
          />
        </div>
      )}

      {/* Modal Section */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <div className="mb-10 flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/manage-account")}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-[#18181B]" />
        </button>
        <h1 className="text-[2rem] font-semibold text-[#18181B] leading-tight">
          Account Detail
        </h1>
      </div>

      <div className="flex flex-col gap-8 max-w-[62.5rem]">
        {/* Avatar Section */}
        <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#E4E4E7] shadow-sm">
          <img
            src={user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder"}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Input Fields */}
        <div className="grid grid-cols-1 gap-8">
          {/* Role Filter */}
          <div className="flex flex-col gap-2.5">
            <label className="text-[1.125rem] font-medium text-[#18181B]">Role</label>
            <div className="relative w-full max-w-[25rem]" ref={filterRef}>
              <button
                onClick={() => setIsRoleOpen(!isRoleOpen)}
                className={cn(
                  "flex items-center justify-between w-full px-5 py-3.5 rounded-xl border border-[#E4E4E7] bg-white text-[1rem] transition-all",
                  isRoleOpen ? "ring-2 ring-[#D25026]/10 border-[#D25026]" : "hover:border-gray-300"
                )}
              >
                <span className="text-[#18181B] capitalize">{selectedRole}</span>
                <ChevronDown className={cn("w-5 h-5 text-[#A1A1AA] transition-transform", isRoleOpen && "rotate-180")} />
              </button>

              {isRoleOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#E4E4E7] rounded-xl shadow-lg z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(role)}
                      className={cn(
                        "w-full px-5 py-4 text-left text-[1rem] transition-colors border-b border-[#F4F4F5] last:border-0 capitalize",
                        selectedRole === role ? "bg-[#F4F4F5] text-[#18181B] font-medium" : "hover:bg-gray-50 text-[#18181B]"
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
            { label: "Email", value: user.email || user.mahasiswa?.email || user.dosen?.email || user.staf?.email },
            { label: "Username", value: user.username },
            { label: "Password", value: user.password },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-2.5">
              <label className="text-[1.125rem] font-medium text-[#18181B]">{field.label}</label>
              <div className="w-full px-5 py-4 rounded-xl border border-[#F4F4F5] bg-[#FAFAFA] text-[#18181B] text-[1rem]">
                {field.label === "Password" ? "•".repeat(16) : field.value}
              </div>
            </div>
          ))}

          <div className="flex flex-col gap-2.5">
            <label className="text-[1.125rem] font-medium text-[#18181B]">Bio</label>
            <div className="w-full px-5 py-4 rounded-xl border border-[#F4F4F5] bg-[#FAFAFA] text-[#18181B] text-[1rem] leading-relaxed min-h-[7.5rem]">
              {user.bio}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex justify-end items-center gap-4">
          <button
            onClick={() => navigate("/admin/manage-account")}
            className="px-8 py-3.5 rounded-xl border border-[#E4E4E7] text-[1rem] font-medium text-[#18181B] hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-8 py-3.5 rounded-xl bg-[#EF4444] text-white text-[1rem] font-semibold hover:bg-[#DC2626] transition-all active:scale-95 shadow-sm flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Account
          </button>
          <button
            onClick={handleConfirmChange}
            className="px-8 py-3.5 rounded-xl bg-[#FDBC74] text-white text-[1rem] font-semibold hover:bg-[#FDB15A] transition-all active:scale-95 shadow-sm disabled:opacity-50"
            disabled={selectedRole === user.role}
          >
            Confirmation of Role Change
          </button>
        </div>
      </div>
    </div>
  );
};
