import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";

interface ProdiGuardProps {
  children?: React.ReactNode;
}

export function ProdiGuard({ children }: ProdiGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
          <p className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">Menghubungkan ke Pusat Prodi...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userJabatan = (user.jabatan || "").toLowerCase().trim();
  
  // Strict check for Prodi membership or Dosen Reguler (Viewer role)
  const isAuthorized = userJabatan === "pejabat prodi" || 
                      userJabatan === "penjabat prodi" || 
                      userJabatan === "dosen reguler";

  if (!isAuthorized) {
    // If not a prodi member, send them back to the lecturer dashboard
    return <Navigate to="/dosen" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
