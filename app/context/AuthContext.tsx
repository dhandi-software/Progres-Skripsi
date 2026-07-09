import React, { createContext, useState, useEffect, type ReactNode, useContext } from "react";
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
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
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
            username: data.email || data.username, // using email field as username for now as per backend mock
            password: data.password
        };

      const response = await authService.login(payload);

      if (response.user) {
        const { user } = response;

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
                    navigate("/kaprodi");
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
    localStorage.removeItem("user");
    
    // Fire and forget the backend logout
    try {
      authService.logout().catch(e => console.error(e));
    } catch(e) { console.error(e) }

    window.location.href = "/login";
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
