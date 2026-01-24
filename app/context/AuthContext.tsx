import React, { createContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "~/services/authService";
import type { User, LoginCredentials } from "~/types/auth";
import { useNavigate, useLocation } from "react-router";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginCredentials) => Promise<void>;
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
      const savedUser = localStorage.getItem("user");
      
      if (token && savedUser) {
        try {
            setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to parse user", error);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (data: LoginCredentials) => {
    setIsLoading(true);
    try {
        // Map email to username if needed, backend expects 'username'
        // But for this use case, we will assume the form sends 'email' or 'username' correctly.
        // If the backend expects 'username' but the form uses 'email', we might need to adjust.
        // Let's assume the user enters 'username' in the email field for now, or we map it.
        const payload = {
            username: data.email, // using email field as username for now as per backend mock
            password: data.password
        };

      const response = await authService.login(payload);

      if (response.token && response.user) {
        const { token, user } = response;

        localStorage.setItem("jwt", token);
        localStorage.setItem("user", JSON.stringify(user));

        setUser(user);

        const from = (location.state as any)?.from?.pathname || null;

        if (from) {
          navigate(from, { replace: true });
        } else {
            // Normalize role to lowercase for consistent checking
            const role = user.role.toLowerCase();

            // Redirect based on role
            switch (role) {
                case 'kaprodi':
                    navigate("/kaprodi"); // Updated to simplified path
                    break;
                case 'dosen': 
                case 'dosen_pembimbing':
                    navigate("/dosen"); // Fixed path to match routes.ts
                    break;
                case 'staf':
                case 'staf_univ':
                    navigate("/staf");
                    break;
                case 'mahasiswa':
                    navigate("/mahasiswa");
                    break;
                case 'admin':
                    navigate("/admin");
                    break;
                default:
                    console.warn("Unknown role, redirecting to home:", role);
                    navigate("/");
            }
        }
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setUser(null);
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
