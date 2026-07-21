import {
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { api, getApiError } from "../../services/api";
import type {
  Categoria,
  Producto,
} from "../../types/api";

interface ProductForm {
  nombre: string;
  descripcionCorta: string;
  descripcion: string;
  ingredientes: string;
  presentacion: string;
  precio: string;
  categoriaId: string;
  disponible: boolean;
  destacado: boolean;
}

const emptyForm: ProductForm = {
  nombre: "",
  descripcionCorta: "",
  descripcion: "",
  ingredientes: "",
  presentacion: "",
  precio: "",
  categoriaId: "",
  disponible: true,
  destacado: false,
};

export function ProductsPage() {
  const [productos, setProductos] = useState<Producto[]>(
    [],
  );

  const [categorias, setCategorias] = useState<
    Categoria[]
  >([]);

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [editingId, setEditingId] = useState<
    number | null
  >(null);

  const [imagen, setImagen] = useState<File | null>(
    null,
  );

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function loadData(): Promise<void> {
    setCargando(true);
    setError("");

    try {
      const [productsResponse, categoriesResponse] =
        await Promise.all([
          api.get<Producto[]>("/admin/productos"),
          api.get<Categoria[]>("/admin/categorias"),
        ]);

      setProductos(productsResponse.data);
      setCategorias(categoriesResponse.data);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function resetForm(): void {
    setForm(emptyForm);
    setEditingId(null);
    setImagen(null);
    setMostrarFormulario(false);
  }

  function startCreate(): void {
    setMensaje("");
    setError("");
    setForm(emptyForm);
    setEditingId(null);
    setImagen(null);
    setMostrarFormulario(true);
  }

  function startEdit(producto: Producto): void {
    setMensaje("");
    setError("");

    setEditingId(producto.id);

    setForm({
      nombre: producto.nombre,
      descripcionCorta:
        producto.descripcionCorta ?? "",
      descripcion: producto.descripcion ?? "",
      ingredientes: producto.ingredientes ?? "",
      presentacion: producto.presentacion ?? "",
      precio: String(producto.precio),
      categoriaId: producto.categoriaId
        ? String(producto.categoriaId)
        : "",
      disponible: producto.disponible,
      destacado: producto.destacado,
    });

    setImagen(null);
    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const payload = {
        nombre: form.nombre,
        descripcionCorta:
          form.descripcionCorta || null,
        descripcion: form.descripcion || null,
        ingredientes: form.ingredientes || null,
        presentacion: form.presentacion || null,
        precio: Number(form.precio),
        categoriaId: form.categoriaId
          ? Number(form.categoriaId)
          : null,
        disponible: form.disponible,
        destacado: form.destacado,
      };

      const response = editingId
        ? await api.patch<{
            producto: Producto;
            message: string;
          }>(
            `/admin/productos/${editingId}`,
            payload,
          )
        : await api.post<{
            producto: Producto;
            message: string;
          }>("/admin/productos", payload);

      const productId = response.data.producto.id;

      if (imagen) {
        const imageData = new FormData();
        imageData.append("imagen", imagen);

        await api.post(
          `/admin/productos/${productId}/imagen`,
          imageData,
        );
      }

      setMensaje(
        editingId
          ? "Producto actualizado correctamente."
          : "Producto registrado correctamente.",
      );

      resetForm();
      await loadData();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "No se pudo guardar el producto.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function deleteProduct(
    producto: Producto,
  ): Promise<void> {
    const confirmed = window.confirm(
      `¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setMensaje("");

    try {
      await api.delete(
        `/admin/productos/${producto.id}`,
      );

      setMensaje("Producto eliminado correctamente.");
      await loadData();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "No se pudo eliminar el producto.",
        ),
      );
    }
  }

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Productos</h1>
          <p className="muted">
            Administra donas, precios, detalles e imágenes.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary"
          onClick={startCreate}
        >
          <Plus size={18} />
          Nuevo producto
        </button>
      </header>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {mensaje && (
        <div className="alert alert-success">
          {mensaje}
        </div>
      )}

      {mostrarFormulario && (
        <section className="panel product-form-panel">
          <div className="panel-header">
            <div>
              <h2>
                {editingId
                  ? "Editar producto"
                  : "Registrar producto"}
              </h2>

              <p>
                Los campos marcados son necesarios para
                publicarlo.
              </p>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={resetForm}
            >
              <X size={20} />
            </button>
          </div>

          <form
            className="admin-form"
            onSubmit={(event) =>
              void handleSubmit(event)
            }
          >
            <div className="form-grid">
              <label>
                Nombre *
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.nombre}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      nombre: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Precio *
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.precio}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      precio: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Categoría
                <select
                  value={form.categoriaId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      categoriaId: event.target.value,
                    })
                  }
                >
                  <option value="">
                    Sin categoría
                  </option>

                  {categorias.map((categoria) => (
                    <option
                      value={categoria.id}
                      key={categoria.id}
                    >
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Presentación
                <input
                  maxLength={120}
                  placeholder="Ej. Pieza individual"
                  value={form.presentacion}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      presentacion: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <label>
              Descripción corta
              <input
                maxLength={220}
                placeholder="Texto que aparece en la tarjeta"
                value={form.descripcionCorta}
                onChange={(event) =>
                  setForm({
                    ...form,
                    descripcionCorta: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Descripción completa
              <textarea
                rows={4}
                value={form.descripcion}
                onChange={(event) =>
                  setForm({
                    ...form,
                    descripcion: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Ingredientes
              <textarea
                rows={3}
                value={form.ingredientes}
                onChange={(event) =>
                  setForm({
                    ...form,
                    ingredientes: event.target.value,
                  })
                }
              />
            </label>

            <label className="file-field">
              <ImagePlus size={20} />

              <span>
                {imagen
                  ? imagen.name
                  : editingId
                    ? "Seleccionar nueva imagen"
                    : "Seleccionar imagen"}
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setImagen(
                    event.target.files?.[0] ?? null,
                  )
                }
              />
            </label>

            <div className="checkbox-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.disponible}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      disponible: event.target.checked,
                    })
                  }
                />
                Producto disponible
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.destacado}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      destacado: event.target.checked,
                    })
                  }
                />
                Mostrar como destacado
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="button button-primary"
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Registrar producto"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Catálogo registrado</h2>
            <p>{productos.length} productos encontrados.</p>
          </div>
        </div>

        {cargando ? (
          <div className="loader" />
        ) : productos.length === 0 ? (
          <div className="empty-state">
            Todavía no existen productos.
          </div>
        ) : (
          <div className="product-admin-grid">
            {productos.map((producto) => (
              <article
                className="admin-product-card"
                key={producto.id}
              >
                <div className="admin-product-image">
                  {producto.imagen ? (
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                    />
                  ) : (
                    <div className="image-placeholder large">
                      🍩
                    </div>
                  )}

                  {producto.destacado && (
                    <span className="featured-badge">
                      Destacado
                    </span>
                  )}
                </div>

                <div className="admin-product-body">
                  <div>
                    <h3>{producto.nombre}</h3>
                    <p>
                      {producto.descripcionCorta ??
                        "Sin descripción corta"}
                    </p>
                  </div>

                  <strong className="price">
                    ${producto.precio.toFixed(2)}
                  </strong>

                  <div className="card-meta">
                    <span>
                      {producto.categoria?.nombre ??
                        "Sin categoría"}
                    </span>

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
                  </div>

                  <div className="card-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => startEdit(producto)}
                    >
                      <Pencil size={17} />
                      Editar
                    </button>

                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() =>
                        void deleteProduct(producto)
                      }
                    >
                      <Trash2 size={17} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}