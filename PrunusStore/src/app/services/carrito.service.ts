import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto';
import { Orden, ItemOrden } from '../models/orden';
import { Cliente } from '../models/cliente';

export interface ItemCarrito { producto: Producto; cantidad: number; }

const LS_CARRITO   = 'prunusstore_carrito';
const LS_HISTORIAL = 'prunusstore_historial';
const IVA = 0.18;

@Injectable({ providedIn: 'root' })
export class CarritoService {
  private items$$ = new BehaviorSubject<ItemCarrito[]>(this.cargarLS());

  readonly items$:    Observable<ItemCarrito[]> = this.items$$.asObservable();
  readonly cantidad$: Observable<number>         = this.items$.pipe(map(is => is.reduce((t,i) => t + i.cantidad, 0)));
  readonly subtotal$: Observable<number>         = this.items$.pipe(map(is => is.reduce((t,i) => t + i.producto.precio * i.cantidad, 0)));
  readonly impuestos$: Observable<number>        = this.subtotal$.pipe(map(s => s * IVA));
  readonly total$:    Observable<number>         = this.subtotal$.pipe(map(s => s + s * IVA));

  agregar(producto: Producto, cantidad = 1): void {
    const items = [...this.items$$.value];
    const ex = items.find(i => i.producto.id === producto.id);
    if (ex) {
      ex.cantidad = Math.min(ex.cantidad + cantidad, producto.stock || 99);
    } else {
      items.push({ producto, cantidad });
    }
    this.sync(items);
  }

  eliminar(id: number): void {
    this.sync(this.items$$.value.filter(i => i.producto.id !== id));
  }

  actualizarCantidad(id: number, cantidad: number): void {
    if (cantidad <= 0) { this.eliminar(id); return; }
    this.sync(this.items$$.value.map(i => i.producto.id === id ? { ...i, cantidad } : i));
  }

  vaciar(): void { this.sync([]); }

  tieneProducto(id: number): boolean { return this.items$$.value.some(i => i.producto.id === id); }

  get valorActual(): ItemCarrito[] { return this.items$$.value; }

  calcularTotal(): number {
    const s = this.items$$.value.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
    return s + s * IVA;
  }

  generarOrden(cliente: Cliente): Orden {
    const items = this.items$$.value;
    const subtotal  = items.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
    const impuestos = subtotal * IVA;
    const orden: Orden = {
      id: this.genId(), fecha: new Date().toISOString(), cliente,
      items: items.map((i): ItemOrden => ({ producto: i.producto, cantidad: i.cantidad })),
      subtotal, impuestos, total: subtotal + impuestos
    };
    this.guardarHistorial(orden);
    this.vaciar();
    return orden;
  }

  obtenerHistorial(): Orden[] {
    try { const d = localStorage.getItem(LS_HISTORIAL); return d ? JSON.parse(d) : []; }
    catch { return []; }
  }

  limpiarHistorial(): void { localStorage.removeItem(LS_HISTORIAL); }

  private sync(items: ItemCarrito[]): void {
    this.items$$.next(items);
    localStorage.setItem(LS_CARRITO, JSON.stringify(items));
  }

  private cargarLS(): ItemCarrito[] {
    try { const d = localStorage.getItem(LS_CARRITO); return d ? JSON.parse(d) : []; }
    catch { return []; }
  }

  private guardarHistorial(orden: Orden): void {
    const h = this.obtenerHistorial();
    h.unshift(orden);
    localStorage.setItem(LS_HISTORIAL, JSON.stringify(h.slice(0, 20)));
  }

  private genId(): string {
    const n = Math.floor(Math.random() * 90000) + 10000;
    const d = new Date();
    return `ORD-${String(d.getFullYear()).slice(-2)}${String(d.getMonth()+1).padStart(2,'0')}-${n}`;
  }
}
