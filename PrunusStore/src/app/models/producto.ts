export interface Producto {
  id: number;
  nombre: string;
  descripcionCorta: string;
  descripcion: string;
  precio: number;
  precioOriginal: number;
  descuento: number;
  categoria: string;
  marca: string;
  sku: string;
  imagen: string;
  disponible: boolean;
  stock: number;
  rating: number;
  reviews: number;
  nuevo: boolean;
  oferta: boolean;
  destacado: boolean;
  colores: string[];
  etiquetas: string[];
  caracteristicas: Record<string, string>;
}

export interface FiltrosProducto {
  q?: string;
  categoria?: string;
  marca?: string;
  precioMin?: number;
  precioMax?: number;
  disponible?: boolean;
  oferta?: boolean;
  nuevo?: boolean;
}
