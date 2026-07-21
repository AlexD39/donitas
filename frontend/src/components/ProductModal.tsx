import {
  MessageCircle,
  X,
} from "lucide-react";

import { useEffect } from "react";

import type {
  Producto,
  Tienda,
} from "../types/api";

interface Props {
  producto: Producto;
  tienda: Tienda;
  onClose: () => void;
}

export function ProductModal({
  producto,
  tienda,
  onClose,
}: Props) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  const message = [
    tienda.mensajeWhatsapp ??
      "Hola, me interesa realizar un pedido.",
    "",
    `Producto: ${producto.nombre}`,
    `Precio: $${producto.precio.toFixed(2)} ${tienda.moneda}`,
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${tienda.whatsapp}` +
    `?text=${encodeURIComponent(message)}`;

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <article
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-label={producto.nombre}
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={22} />
        </button>

        <div className="modal-product-image">
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
        </div>

        <div className="modal-product-content">
          {producto.destacado && (
            <span className="featured-badge">
              Producto destacado
            </span>
          )}

          <p className="eyebrow">
            {producto.categoria?.nombre ??
              "Donitas Anita"}
          </p>

          <h2>{producto.nombre}</h2>

          <strong className="modal-price">
            ${producto.precio.toFixed(2)}
          </strong>

          <p>
            {producto.descripcion ??
              producto.descripcionCorta ??
              "Producto artesanal preparado con mucho cariño."}
          </p>

          {producto.presentacion && (
            <div className="detail-block">
              <strong>Presentación</strong>
              <span>{producto.presentacion}</span>
            </div>
          )}

          {producto.ingredientes && (
            <div className="detail-block">
              <strong>Ingredientes</strong>
              <span>{producto.ingredientes}</span>
            </div>
          )}

          <a
            className="button whatsapp-button button-full"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={20} />
            Pedir por WhatsApp
          </a>
        </div>
      </article>
    </div>
  );
}