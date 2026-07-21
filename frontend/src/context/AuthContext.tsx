import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "../services/api";
import type { Usuario } from "../types/api";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(
  null,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [usuario, setUsuario] = useState<Usuario | null>(
    null,
  );

  const [cargando, setCargando] = useState(true);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const response = await api.get<{
        usuario: Usuario;
      }>("/auth/me");

      setUsuario(response.data.usuario);
    } catch {
      setUsuario(null);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function login(
    email: string,
    password: string,
  ): Promise<void> {
    const response = await api.post<{
      usuario: Usuario;
    }>("/auth/login", {
      email,
      password,
    });

    setUsuario(response.data.usuario);
  }

  async function logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } finally {
      setUsuario(null);
    }
  }

  const value = useMemo(
    () => ({
      usuario,
      cargando,
      login,
      logout,
      refresh,
    }),
    [usuario, cargando, refresh],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider.",
    );
  }

  return context;
}