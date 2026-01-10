import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { authApi } from "~/api/auth";
import type { User, LoginRequest } from "~/api/types";
import { useNavigate, useLocation } from "react-router";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("jwt");
      if (token) {
        try {
          const userData = await authApi.me();
          setUser({ ...userData, token });
        } catch (error) {
          console.error("Failed to fetch user", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);

      if (response.status === "success" && response.data) {
        const { token, role } = response.data;

        localStorage.setItem("jwt", token);

        setUser(response.data);

        sessionStorage.setItem("justLoggedIn", "true");

        const from = (location.state as any)?.from?.pathname || null;

        if (from) {
          navigate(from, { replace: true });
        } else if (role === "admin") {
          navigate("/admin");
        } else if (role === "writer") {
          navigate("/writer");
        } else if (role === "editor") {
          navigate("/editor");
        } else {
          navigate("/");
        }
      } else {
        console.error("Login response success is false or data missing");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Clear state FIRST before navigating to prevent infinite loop
    localStorage.removeItem("jwt");
    setUser(null);

    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed on server", error);
    }

    // Navigate AFTER state is cleared
    navigate("/login", { replace: true });
  };

  const value = React.useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
