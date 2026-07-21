import {
  ImagePlus,
  Save,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { api, getApiError } from "../../services/api";
import type { Tienda } from "../../types/api";

interface StoreForm {
  nombre: string;
  eslogan: string;
  introduccion: string;
  descripcion: string;
  whatsapp: string;
  telefono: string;
  direccion: string;
  horarios: string;
  facebook: string;
  instagram: string;
  moneda: string;
  mensajeWhatsapp: string;
}

function createForm(store: Tienda): StoreForm {
  return {
    nombre: store.nombre,
    eslogan: store.eslogan ?? "",
    introduccion: store.introduccion ?? "",
    descripcion: store.descripcion ?? "",
    whatsapp: store.whatsapp,
    telefono: store.telefono ?? "",
    direccion: store.direccion ?? "",
    horarios: store.horarios ?? "",
    facebook: store.facebook ?? "",
    instagram: store.instagram ?? "",
    moneda: store.moneda,
    mensajeWhatsapp:
      store.mensajeWhatsapp ?? "",
  };
}

export function StorePage() {
  const [store, setStore] = useState<Tienda | null>(
    null,
  );

  const [form, setForm] = useState<StoreForm | null>(
    null,
  );

  const [logo, setLogo] = useState<File | null>(null);
  const [portada, setPortada] =
    useState<File | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState<
    "logo" | "portada" | null
  >(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  async function loadStore(): Promise<void> {
    try {
      const response =
        await api.get<Tienda>("/admin/tienda");

      setStore(response.data);
      setForm(createForm(response.data));
    } catch (requestError) {
      setError(getApiError(requestError));
    }
  }

  useEffect(() => {
    void loadStore();
  }, []);

  async function saveStore(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!form) {
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      await api.patch("/admin/tienda", {
        ...form,
        eslogan: form.eslogan || null,
        introduccion: form.introduccion || null,
        descripcion: form.descripcion || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        horarios: form.horarios || null,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        mensajeWhatsapp:
          form.mensajeWhatsapp || null,
      });

      setMensaje(
        "Información actualizada correctamente.",
      );

      await loadStore();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "No se pudo actualizar la tienda.",
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  async function uploadImage(
    type: "logo" | "portada",
  ): Promise<void> {
    const file = type === "logo" ? logo : portada;

    if (!file) {
      setError("Primero selecciona una imagen.");
      return;
    }

    setSubiendo(type);
    setError("");
    setMensaje("");

    try {
      const formData = new FormData();
      formData.append("imagen", file);

      await api.post(
        `/admin/tienda/imagenes/${type}`,
        formData,
      );

      setMensaje(
        `${
          type === "logo" ? "Logo" : "Portada"
        } actualizado correctamente.`,
      );

      if (type === "logo") {
        setLogo(null);
      } else {
        setPortada(null);
      }

      await loadStore();
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "No se pudo subir la imagen.",
        ),
      );
    } finally {
      setSubiendo(null);
    }
  }

  if (!store || !form) {
    return (
      <main className="admin-page">
        {error ? (
          <div className="alert alert-error">
            {error}
          </div>
        ) : (
          <div className="loader" />
        )}
      </main>
    );
  }

  return (
    <main className="admin-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Configuración</p>
          <h1>Información de la tienda</h1>
          <p className="muted">
            Estos datos se mostrarán en la página pública.
          </p>
        </div>
      </header>

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {mensaje && (
        <div className="alert alert-success">
          {mensaje}
        </div>
      )}

      <section className="store-images-grid">
        <article className="panel image-manager">
          <h2>Logo</h2>

          <div className="store-image-preview logo-preview">
            {store.logo ? (
              <img src={store.logo} alt="Logo" />
            ) : (
              <span>🍩</span>
            )}
          </div>

          <label className="file-field">
            <ImagePlus size={20} />
            <span>
              {logo?.name ?? "Seleccionar logo"}
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setLogo(
                  event.target.files?.[0] ?? null,
                )
              }
            />
          </label>

          <button
            type="button"
            className="button button-primary button-full"
            disabled={!logo || subiendo === "logo"}
            onClick={() => void uploadImage("logo")}
          >
            {subiendo === "logo"
              ? "Subiendo..."
              : "Actualizar logo"}
          </button>
        </article>

        <article className="panel image-manager">
          <h2>Imagen de portada</h2>

          <div className="store-image-preview cover-preview">
            {store.portada ? (
              <img src={store.portada} alt="Portada" />
            ) : (
              <span>Sin portada</span>
            )}
          </div>

          <label className="file-field">
            <ImagePlus size={20} />
            <span>
              {portada?.name ??
                "Seleccionar portada"}
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setPortada(
                  event.target.files?.[0] ?? null,
                )
              }
            />
          </label>

          <button
            type="button"
            className="button button-primary button-full"
            disabled={
              !portada || subiendo === "portada"
            }
            onClick={() =>
              void uploadImage("portada")
            }
          >
            {subiendo === "portada"
              ? "Subiendo..."
              : "Actualizar portada"}
          </button>
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Datos generales</h2>
            <p>
              Información comercial, contacto y redes
              sociales.
            </p>
          </div>
        </div>

        <form
          className="admin-form"
          onSubmit={(event) => void saveStore(event)}
        >
          <div className="form-grid">
            <label>
              Nombre *
              <input
                required
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
              Eslogan
              <input
                value={form.eslogan}
                onChange={(event) =>
                  setForm({
                    ...form,
                    eslogan: event.target.value,
                  })
                }
              />
            </label>

            <label>
              WhatsApp *
              <input
                required
                value={form.whatsapp}
                onChange={(event) =>
                  setForm({
                    ...form,
                    whatsapp: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Teléfono
              <input
                value={form.telefono}
                onChange={(event) =>
                  setForm({
                    ...form,
                    telefono: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Dirección
              <input
                value={form.direccion}
                onChange={(event) =>
                  setForm({
                    ...form,
                    direccion: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Horarios
              <input
                value={form.horarios}
                onChange={(event) =>
                  setForm({
                    ...form,
                    horarios: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Facebook
              <input
                type="url"
                value={form.facebook}
                onChange={(event) =>
                  setForm({
                    ...form,
                    facebook: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Instagram
              <input
                type="url"
                value={form.instagram}
                onChange={(event) =>
                  setForm({
                    ...form,
                    instagram: event.target.value,
                  })
                }
              />
            </label>
          </div>

          <label>
            Introducción
            <textarea
              rows={3}
              value={form.introduccion}
              onChange={(event) =>
                setForm({
                  ...form,
                  introduccion: event.target.value,
                })
              }
            />
          </label>

          <label>
            Sobre nosotros
            <textarea
              rows={5}
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
            Mensaje inicial de WhatsApp
            <textarea
              rows={3}
              value={form.mensajeWhatsapp}
              onChange={(event) =>
                setForm({
                  ...form,
                  mensajeWhatsapp: event.target.value,
                })
              }
            />
          </label>

          <div className="form-actions">
            <button
              type="submit"
              className="button button-primary"
              disabled={guardando}
            >
              <Save size={18} />
              {guardando
                ? "Guardando..."
                : "Guardar información"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}