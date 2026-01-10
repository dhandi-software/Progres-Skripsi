import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import type { User } from "~/api/types";

interface RoleGuardProps {
  allowedRoles: User["role"][];
  children?: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
