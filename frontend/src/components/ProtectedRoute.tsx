import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router";

import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <main className="screen-center">
        <div className="loader" />
        <p>Verificando sesión...</p>
      </main>
    );
  }

  if (!usuario) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
}