export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN";
}

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  activa?: boolean;
  orden?: number;
  _count?: {
    productos: number;
  };
}

export interface Producto {
  id: number;
  nombre: string;
  slug: string;
  descripcionCorta: string | null;
  descripcion: string | null;
  ingredientes: string | null;
  presentacion: string | null;
  precio: number;
  imagen: string | null;
  imagenPublicId?: string | null;
  disponible: boolean;
  destacado: boolean;
  categoriaId: number | null;
  categoria: {
    id: number;
    nombre: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tienda {
  id: number;
  nombre: string;
  eslogan: string | null;
  introduccion: string | null;
  descripcion: string | null;
  logo: string | null;
  logoPublicId?: string | null;
  portada: string | null;
  portadaPublicId?: string | null;
  whatsapp: string;
  telefono: string | null;
  direccion: string | null;
  horarios: string | null;
  facebook: string | null;
  instagram: string | null;
  moneda: string;
  mensajeWhatsapp: string | null;
}

export interface DashboardData {
  resumen: {
    totalProductos: number;
    productosDisponibles: number;
    productosAgotados: number;
    productosDestacados: number;
    totalCategorias: number;
  };
  productosRecientes: Producto[];
}