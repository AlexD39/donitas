import {
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import {
  FaSquareFacebook,
  FaSquareInstagram,
} from "react-icons/fa6";

import { useEffect, useMemo, useState } from "react";

import { ProductModal } from "../../components/ProductModal";
import { api, getApiError } from "../../services/api";
import type {
  Categoria,
  Producto,
  Tienda,
} from "../../types/api";

export function HomePage() {
  const [tienda, setTienda] =
    useState<Tienda | null>(null);

  const [productos, setProductos] = useState<
    Producto[]
  >([]);

  const [categorias, setCategorias] = useState<
    Categoria[]
  >([]);

  const [categoriaActiva, setCategoriaActiva] =
    useState<string>("todas");

  const [seleccionado, setSeleccionado] =
    useState<Producto | null>(null);

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function load(): Promise<void> {
      try {
        const [
          storeResponse,
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          api.get<Tienda>("/public/tienda"),
          api.get<Producto[]>("/public/productos"),
          api.get<Categoria[]>("/public/categorias"),
        ]);

        setTienda(storeResponse.data);
        setProductos(productsResponse.data);
        setCategorias(categoriesResponse.data);
      } catch (requestError) {
        setError(getApiError(requestError));
      } finally {
        setCargando(false);
      }
    }

    void load();
  }, []);

  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === "todas") {
      return productos;
    }

    return productos.filter(
      (producto) =>
        producto.categoria?.slug === categoriaActiva,
    );
  }, [productos, categoriaActiva]);

  if (cargando) {
    return (
      <main className="screen-center public-loading">
        <div className="loader" />
        <p>Preparando algo dulce...</p>
      </main>
    );
  }

  if (error || !tienda) {
    return (
      <main className="screen-center">
        <div className="alert alert-error">
          {error || "La tienda no está disponible."}
        </div>
      </main>
    );
  }

  const generalMessage =
    tienda.mensajeWhatsapp ??
    "Hola, me interesa realizar un pedido.";

  const generalWhatsapp =
    `https://wa.me/${tienda.whatsapp}` +
    `?text=${encodeURIComponent(generalMessage)}`;

  return (
    <div className="public-page">
      <header className="public-header">
        <a className="public-brand" href="#inicio">
          {tienda.logo ? (
            <img src={tienda.logo} alt={tienda.nombre} />
          ) : (
            <span className="public-logo-fallback">
              🍩
            </span>
          )}

          <div>
            <strong>{tienda.nombre}</strong>
            <small>
              {tienda.eslogan ?? "Hechas con amor"}
            </small>
          </div>
        </a>

        <nav>
          <a href="#productos">Productos</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#contacto">Contacto</a>
          <a
            className="button button-small whatsapp-button"
            href={generalWhatsapp}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            Pedir
          </a>
        </nav>
      </header>

      <main>
        <section
          className="hero"
          id="inicio"
          style={
            tienda.portada
              ? {
                  backgroundImage:
                    `linear-gradient(` +
                    `rgba(62, 23, 36, 0.58), ` +
                    `rgba(62, 23, 36, 0.48)), ` +
                    `url("${tienda.portada}")`,
                }
              : undefined
          }
        >
          <div className="hero-content">
            <span className="hero-chip">
              🍩 Preparadas con cariño
            </span>

            <h1>
              Un momento dulce comienza con una dona.
            </h1>

            <p>
              {tienda.introduccion ??
                "Donitas artesanales, frescas y preparadas para endulzar tus mejores momentos."}
            </p>

            <div className="hero-actions">
              <a
                className="button button-primary"
                href="#productos"
              >
                Ver nuestras donas
              </a>

              <a
                className="button button-light"
                href={generalWhatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} />
                Contactar
              </a>
            </div>
          </div>
        </section>

        <section
          className="public-section catalog-section"
          id="productos"
        >
          <div className="section-heading">
            <p className="eyebrow">Nuestro catálogo</p>
            <h2>Elige tu favorita</h2>
            <p>
              Descubre sabores clásicos, especiales y
              paquetes para compartir.
            </p>
          </div>

          <div className="category-filters">
            <button
              type="button"
              className={
                categoriaActiva === "todas"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setCategoriaActiva("todas")
              }
            >
              Todas
            </button>

            {categorias.map((categoria) => (
              <button
                type="button"
                key={categoria.id}
                className={
                  categoriaActiva === categoria.slug
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setCategoriaActiva(categoria.slug)
                }
              >
                {categoria.nombre}
              </button>
            ))}
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="empty-state">
              No hay productos disponibles en esta
              categoría.
            </div>
          ) : (
            <div className="public-products-grid">
              {productosFiltrados.map((producto) => (
                <article
                  className="public-product-card"
                  key={producto.id}
                >
                  <button
                    type="button"
                    className="product-image-button"
                    onClick={() =>
                      setSeleccionado(producto)
                    }
                  >
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                      />
                    ) : (
                      <div className="image-placeholder huge">
                        🍩
                      </div>
                    )}
                  </button>

                  <div className="public-product-body">
                    <div className="public-product-title">
                      <div>
                        <small>
                          {producto.categoria?.nombre ??
                            "Donitas"}
                        </small>
                        <h3>{producto.nombre}</h3>
                      </div>

                      <strong>
                        ${producto.precio.toFixed(2)}
                      </strong>
                    </div>

                    <p>
                      {producto.descripcionCorta ??
                        "Dona artesanal preparada con mucho cariño."}
                    </p>

                    <button
                      type="button"
                      className="button button-primary button-full"
                      onClick={() =>
                        setSeleccionado(producto)
                      }
                    >
                      Ver detalles
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="about-section"
          id="nosotros"
        >
          <div className="about-decoration">🍩</div>

          <div>
            <p className="eyebrow">Sobre nosotros</p>
            <h2>
              Donitas hechas para compartir momentos
              felices
            </h2>

            <p>
              {tienda.descripcion ??
                "En Donitas Anita elaboramos productos frescos, deliciosos y preparados con dedicación."}
            </p>

            <a
              className="button button-primary"
              href={generalWhatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19} />
              Realizar un pedido
            </a>
          </div>
        </section>

        <section
          className="public-section contact-section"
          id="contacto"
        >
          <div className="section-heading">
            <p className="eyebrow">Contáctanos</p>
            <h2>Estamos para atenderte</h2>
          </div>

          <div className="contact-grid">
            {tienda.direccion && (
              <article>
                <MapPin />
                <strong>Dirección</strong>
                <span>{tienda.direccion}</span>
              </article>
            )}

            {tienda.horarios && (
              <article>
                <Clock3 />
                <strong>Horarios</strong>
                <span>{tienda.horarios}</span>
              </article>
            )}

            {(tienda.telefono || tienda.whatsapp) && (
              <article>
                <Phone />
                <strong>Teléfono</strong>
                <span>
                  {tienda.telefono ??
                    tienda.whatsapp}
                </span>
              </article>
            )}
          </div>
        </section>
      </main>

      <footer className="public-footer">
        <div>
          <strong>{tienda.nombre}</strong>
          <span>
            {tienda.eslogan ?? "Hechas con amor"}
          </span>
        </div>

        <div className="social-links">
          {tienda.facebook && (
            <a
              href={tienda.facebook}
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <FaSquareFacebook />
            </a>
          )}

          {tienda.instagram && (
            <a
              href={tienda.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <FaSquareInstagram />
            </a>
          )}
        </div>

        <a href="/admin/login">Administración</a>
      </footer>

      {seleccionado && (
        <ProductModal
          producto={seleccionado}
          tienda={tienda}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </div>
  );
}