/**
 * carrito.js
 * Clases Producto, ItemCarrito y Carrito.
 * El carrito persiste en localStorage y dispara eventos DOM
 * para que cualquier parte de la app pueda reaccionar.
 */

import { guardarLS, obtenerLS, eliminarLS, formatearPrecio,
         generarIdOrden, formatearFecha, mostrarNotificacion } from './utilidades.js';

const CLAVE_CARRITO  = 'techstore_carrito';
const CLAVE_HISTORIAL = 'techstore_historial';
const IVA = 0.18; // 18 %

/* ============================================================
   CLASE PRODUCTO
   ============================================================ */
export class Producto {
  constructor(datos) {
    this.id             = datos.id;
    this.nombre         = datos.nombre;
    this.descripcion    = datos.descripcion    ?? '';
    this.descripcionCorta = datos.descripcionCorta ?? '';
    this.precio         = Number(datos.precio);
    this.precioOriginal = Number(datos.precioOriginal ?? datos.precio);
    this.descuento      = Number(datos.descuento ?? 0);
    this.categoria      = datos.categoria      ?? 'general';
    this.marca          = datos.marca          ?? '';
    this.sku            = datos.sku            ?? `SKU-${datos.id}`;
    this.imagen         = datos.imagen         ?? '';
    this.disponible     = datos.disponible     !== false;
    this.stock          = Number(datos.stock   ?? 0);
    this.rating         = Number(datos.rating  ?? 0);
    this.reviews        = Number(datos.reviews ?? 0);
    this.nuevo          = Boolean(datos.nuevo);
    this.oferta         = Boolean(datos.oferta);
    this.destacado      = Boolean(datos.destacado);
    this.colores        = datos.colores        ?? [];
    this.etiquetas      = datos.etiquetas      ?? [];
    this.caracteristicas = datos.caracteristicas ?? {};
  }

  get tieneDescuento() { return this.descuento > 0; }
  get ahorro()         { return this.precioOriginal - this.precio; }

  toJSON() {
    return {
      id: this.id, nombre: this.nombre, precio: this.precio,
      precioOriginal: this.precioOriginal, descuento: this.descuento,
      categoria: this.categoria, marca: this.marca, sku: this.sku,
      imagen: this.imagen, disponible: this.disponible, stock: this.stock,
      rating: this.rating, reviews: this.reviews, nuevo: this.nuevo,
      oferta: this.oferta, destacado: this.destacado,
      descripcionCorta: this.descripcionCorta, descripcion: this.descripcion,
      colores: this.colores, etiquetas: this.etiquetas,
      caracteristicas: this.caracteristicas,
    };
  }
}

/* ============================================================
   CLASE ITEM CARRITO
   ============================================================ */
export class ItemCarrito {
  constructor(producto, cantidad = 1) {
    if (!(producto instanceof Producto)) {
      producto = new Producto(producto);
    }
    this.producto = producto;
    this.cantidad = Number(cantidad);
  }

  get subtotal() { return this.producto.precio * this.cantidad; }

  toJSON() {
    return { producto: this.producto.toJSON(), cantidad: this.cantidad };
  }
}

/* ============================================================
   CLASE CARRITO
   ============================================================ */
export class Carrito {
  #items = [];

  constructor() {
    this.#cargarDeLS();
  }

  // ── Getters ────────────────────────────────────────────────
  get items()          { return [...this.#items]; }
  get cantidadItems()  { return this.#items.reduce((t, i) => t + i.cantidad, 0); }
  get estaVacio()      { return this.#items.length === 0; }

  get subtotal() {
    return this.#items.reduce((t, i) => t + i.subtotal, 0);
  }
  get impuestos()  { return this.subtotal * IVA; }
  get total()      { return this.subtotal + this.impuestos; }

  get categorias() {
    return [...new Set(this.#items.map(i => i.producto.categoria))];
  }
  get productoMasCaro() {
    if (this.estaVacio) return null;
    return this.#items.reduce((max, i) =>
      i.producto.precio > max.producto.precio ? i : max
    ).producto;
  }

  // ── Operaciones ────────────────────────────────────────────
  agregar(producto, cantidad = 1) {
    if (!(producto instanceof Producto)) producto = new Producto(producto);

    const existente = this.#items.find(i => i.producto.id === producto.id);
    if (existente) {
      const nueva = existente.cantidad + cantidad;
      existente.cantidad = Math.min(nueva, producto.stock > 0 ? producto.stock : 99);
    } else {
      this.#items.push(new ItemCarrito(producto, cantidad));
    }
    this.#guardarEnLS();
    this.#emitirCambio();
  }

  eliminar(id) {
    const idx = this.#items.findIndex(i => i.producto.id === Number(id));
    if (idx !== -1) {
      this.#items.splice(idx, 1);
      this.#guardarEnLS();
      this.#emitirCambio();
      return true;
    }
    return false;
  }

  actualizarCantidad(id, cantidad) {
    const item = this.#items.find(i => i.producto.id === Number(id));
    if (!item) return false;
    cantidad = Number(cantidad);
    if (cantidad <= 0) {
      return this.eliminar(id);
    }
    item.cantidad = cantidad;
    this.#guardarEnLS();
    this.#emitirCambio();
    return true;
  }

  vaciar() {
    this.#items = [];
    this.#guardarEnLS();
    this.#emitirCambio();
  }

  tieneProducto(id) {
    return this.#items.some(i => i.producto.id === Number(id));
  }

  // ── Compra ─────────────────────────────────────────────────
  async simularCompra() {
    if (this.estaVacio) throw new Error('El carrito está vacío.');

    await new Promise(r => setTimeout(r, 1800)); // simula red

    const orden = {
      id:        generarIdOrden(),
      fecha:     new Date().toISOString(),
      items:     this.items.map(i => i.toJSON()),
      subtotal:  this.subtotal,
      impuestos: this.impuestos,
      total:     this.total,
    };

    // Guardar en historial
    const historial = obtenerLS(CLAVE_HISTORIAL, []);
    historial.unshift(orden);
    guardarLS(CLAVE_HISTORIAL, historial.slice(0, 20)); // máx 20 órdenes

    this.vaciar();
    return orden;
  }

  // ── LocalStorage ───────────────────────────────────────────
  #guardarEnLS() {
    guardarLS(CLAVE_CARRITO, this.#items.map(i => i.toJSON()));
  }

  #cargarDeLS() {
    const guardado = obtenerLS(CLAVE_CARRITO, []);
    this.#items = guardado.map(d => new ItemCarrito(
      new Producto(d.producto), d.cantidad
    ));
  }

  // ── Evento DOM personalizado ───────────────────────────────
  #emitirCambio() {
    document.dispatchEvent(new CustomEvent('carritoActualizado', {
      detail: {
        cantidad: this.cantidadItems,
        total:    this.total,
      }
    }));
  }
}

/* ============================================================
   CLASE CLIENTE
   ============================================================ */
export class Cliente {
  constructor({ nombre = '', email = '', telefono = '' } = {}) {
    this.nombre   = nombre;
    this.email    = email;
    this.telefono = telefono;
  }

  esValido() {
    return this.nombre.trim().length >= 2 && this.email.includes('@');
  }
}

/* ============================================================
   SINGLETON — instancia compartida en toda la app
   ============================================================ */
export const carrito = new Carrito();

/* ============================================================
   HISTORIAL DE COMPRAS
   ============================================================ */
export function obtenerHistorial() {
  return obtenerLS(CLAVE_HISTORIAL, []);
}

export function limpiarHistorial() {
  eliminarLS(CLAVE_HISTORIAL);
}

/* ============================================================
   UI — actualizar badge del header
   ============================================================ */
export function actualizarBadgeCarrito(cantidad) {
  const badges = document.querySelectorAll('.badge-carrito');
  const n = cantidad ?? carrito.cantidadItems;
  badges.forEach(b => {
    b.textContent = n > 99 ? '99+' : String(n);
    b.classList.toggle('badge-carrito--activo', n > 0);
  });
}
