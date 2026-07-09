import { Producto } from './producto';

export interface ItemOrden {
  producto: Producto;
  cantidad: number;
}

export interface Orden {
  id: string;
  fecha: string;
  cliente: { nombre: string; email: string; direccion: string; telefono: string };
  items: ItemOrden[];
  subtotal: number;
  impuestos: number;
  total: number;
}
