import {
  BadgeCheck,
  Boxes,
  Layers3,
  Sparkles,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";

import { api, getApiError } from "../../services/api";
import type { DashboardData } from "../../types/api";

export function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [error, setError] = useState("");

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const response =
          await api.get<DashboardData>(
            "/admin/dashboard",
          );

        setData(response.data);
      } catch (requestError) {
        setError(getApiError(requestError));
      }
    }

    void load();
  }, []);

  if (error) {
    return (
      <main className="admin-page">
        <div className="alert alert-error">{error}</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="admin-page">
        <div className="loader" />
      </main>
    );
  }

  const cards = [
    {
      label: "Total de productos",
      value: data.resumen.totalProductos,
      icon: Boxes,
    },
    {
      label: "Disponibles",
      value: data.resumen.productosDisponibles,
      icon: BadgeCheck,
    },
    {
      label: "Agotados",
      value: data.resumen.productosAgotados,
      icon: XCircle,
    },
    {
      label: "Destacados",
      value: data.resumen.productosDestacados,
      icon: Sparkles,
    },
    {
      label: "Categorías",
      value: data.resumen.totalCategorias,
      icon: Layers3,
    },
  ];

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Administración</p>
          <h1>Resumen general</h1>
          <p className="muted">
            Estado actual del catálogo de Donitas Anita.
          </p>
        </div>
      </header>

      <section className="stats-grid">
        {cards.map(({ label, value, icon: Icon }) => (
          <article className="stat-card" key={label}>
            <div className="stat-icon">
              <Icon size={22} />
            </div>

            <div>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Productos recientes</h2>
            <p>Últimos registros del catálogo.</p>
          </div>
        </div>

        {data.productosRecientes.length === 0 ? (
          <div className="empty-state">
            Todavía no existen productos.
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {data.productosRecientes.map(
                  (producto) => (
                    <tr key={producto.id}>
                      <td>
                        <div className="product-cell">
                          {producto.imagen ? (
                            <img
                              src={producto.imagen}
                              alt={producto.nombre}
                            />
                          ) : (
                            <div className="image-placeholder">
                              🍩
                            </div>
                          )}

                          <strong>{producto.nombre}</strong>
                        </div>
                      </td>

                      <td>
                        {producto.categoria?.nombre ??
                          "Sin categoría"}
                      </td>

                      <td>
                        ${producto.precio.toFixed(2)}
                      </td>

                      <td>
                        <span
                          className={
                            producto.disponible
                              ? "status status-success"
                              : "status status-danger"
                          }
                        >
                          {producto.disponible
                            ? "Disponible"
                            : "Agotado"}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}