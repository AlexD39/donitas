import {
  Boxes,
  LayoutDashboard,
  LogOut,
  Settings,
  Store,
} from "lucide-react";

import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router";

import { useAuth } from "../context/AuthContext";

export function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(): Promise<void> {
    await logout();
    navigate("/admin/login", {
      replace: true,
    });
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="brand-icon">🍩</div>

          <div>
            <strong>Donitas Anita</strong>
            <small>Administración</small>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <LayoutDashboard size={19} />
            Resumen
          </NavLink>

          <NavLink
            to="/admin/productos"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <Boxes size={19} />
            Productos
          </NavLink>

          <NavLink
            to="/admin/tienda"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <Settings size={19} />
            Tienda
          </NavLink>

          <a href="/" target="_blank" rel="noreferrer">
            <Store size={19} />
            Ver página
          </a>
        </nav>

        <div className="admin-user">
          <div>
            <strong>{usuario?.nombre}</strong>
            <small>{usuario?.email}</small>
          </div>

          <button
            type="button"
            className="icon-button"
            title="Cerrar sesión"
            onClick={() => void handleLogout()}
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}