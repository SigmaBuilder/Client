import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types/auth";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  logoutAll as authLogoutAll,
  updateProfile as authUpdateProfile,
  updateEmail as authUpdateEmail,
  updatePassword as authUpdatePassword,
  fetchMe,
  getAccessToken,
  getUser,
  setAuthData,
  clearAuthData,
} from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    redirectTo?: string,
  ) => Promise<void>;
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    redirectTo?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  updateProfile: (data: { first_name?: string; last_name?: string }) => Promise<any>;
  updateCurrentUser: (user: User) => void;
  updateEmail: (email: string) => Promise<any>;
  updatePassword: (current_password: string, new_password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

function safeRedirect(to: string | undefined, fallback: string): string {
  if (!to) return fallback;
  if (to.startsWith("/login") || to.startsWith("/signup")) return fallback;
  return to;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getUser);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const verifySession = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    const response = await fetchMe();
    if (response.success && response.data) {
      const userData = response.data.user;
      setAuthData(token, userData);
      setUser(userData);
    } else {
      clearAuthData();
      setUser(null);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      navigate("/login");
    };
    window.addEventListener("auth:expired", handleAuthExpired);
    return () => window.removeEventListener("auth:expired", handleAuthExpired);
  }, [navigate]);

  const login = async (
    email: string,
    password: string,
    redirectTo?: string,
  ) => {
    const response = await authLogin(email, password);
    if (response.success && response.data) {
      setUser(response.data.user);
      navigate(safeRedirect(redirectTo, "/dashboard"));
    } else {
      throw new Error(response.error || "Error al iniciar sesión");
    }
  };

  const register = async (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    redirectTo?: string,
  ) => {
    const response = await authRegister(email, password, first_name, last_name);
    if (response.success && response.data) {
      setUser(response.data.user);
      navigate(safeRedirect(redirectTo, "/dashboard"));
    } else {
      throw new Error(response.error || "Error al registrarse");
    }
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    navigate("/login");
  };

  const logoutAll = async () => {
    await authLogoutAll();
    setUser(null);
    navigate("/login");
  };

  const updateProfile = async (data: { first_name?: string; last_name?: string }) => {
    const response = await authUpdateProfile(data);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const updateCurrentUser = (updatedUser: User) => {
    const currentToken = getAccessToken();
    if (currentToken) setAuthData(currentToken, updatedUser);
    setUser(updatedUser);
  };

  const updateEmail = async (email: string) => {
    const response = await authUpdateEmail(email);
    if (response.success && response.data?.user) {
      setUser(response.data.user);
    }
    return response;
  };

  const updatePassword = async (current_password: string, new_password: string) => {
    return authUpdatePassword(current_password, new_password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        logoutAll,
        updateProfile,
        updateCurrentUser,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
