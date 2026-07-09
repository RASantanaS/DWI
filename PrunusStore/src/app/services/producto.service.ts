import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { Producto, FiltrosProducto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);

  private readonly URL_LOCAL = 'assets/data/productos.json';
  private readonly URL_API   = 'https://fakestoreapi.com/products?limit=4';

  private productos$$ = new BehaviorSubject<Producto[]>([]);
  readonly productos$: Observable<Producto[]> = this.productos$$.asObservable();

  private catalogo$: Observable<Producto[]> | null = null;

  obtenerProductos(): Observable<Producto[]> {
    if (!this.catalogo$) {
      this.catalogo$ = this.http.get<Producto[]>(this.URL_LOCAL).pipe(
        tap(ps => this.productos$$.next(ps)),
        catchError(err => {
          console.error('[ProductoService] catálogo:', err);
          return of([]);
        }),
        shareReplay(1)
      );
    }
    return this.catalogo$;
  }

  obtenerProducto(id: number): Observable<Producto | undefined> {
    return this.obtenerProductos().pipe(map(ps => ps.find(p => p.id === id)));
  }

  buscarProducto(filtros: FiltrosProducto): Observable<Producto[]> {
    return this.obtenerProductos().pipe(map(ps => this.aplicarFiltros(ps, filtros)));
  }

  obtenerCategorias(): Observable<string[]> {
    return this.obtenerProductos().pipe(
      map(ps => [...new Set(ps.map(p => p.categoria))])
    );
  }

  obtenerMarcas(): Observable<string[]> {
    return this.obtenerProductos().pipe(
      map(ps => [...new Set(ps.map(p => p.marca))].sort())
    );
  }

  obtenerTrendingAPI(): Observable<Producto[]> {
    return this.http.get<any[]>(this.URL_API).pipe(
      map(items => items.filter(p => p.category === 'electronics').map((p, i) => ({
        id: 2000 + i,
        nombre: p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title,
        descripcionCorta: 'API externa · ' + p.category,
        descripcion: p.description,
        precio: Math.round(p.price),
        precioOriginal: Math.round(p.price),
        descuento: 0, categoria: 'accesorios', marca: 'Externo',
        sku: `API-${p.id}`, imagen: p.image, disponible: true,
        stock: Math.max(1, Math.floor((p.rating?.count ?? 10) / 10)),
        rating: Math.round((p.rating?.rate ?? 4) * 10) / 10,
        reviews: p.rating?.count ?? 0, nuevo: false, oferta: false, destacado: false,
        colores: [], etiquetas: ['trending'], caracteristicas: {}
      } as Producto))),
      catchError(err => {
        console.warn('[ProductoService] API externa:', err.message);
        return of([]);
      })
    );
  }

  private aplicarFiltros(lista: Producto[], f: FiltrosProducto): Producto[] {
    let r = [...lista];
    if (f.q) {
      const q = f.q.toLowerCase();
      r = r.filter(p =>
        p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) || p.etiquetas.some(e => e.toLowerCase().includes(q))
      );
    }
    if (f.categoria) r = r.filter(p => p.categoria === f.categoria);
    if (f.marca)     r = r.filter(p => p.marca.toLowerCase() === f.marca!.toLowerCase());
    if (f.precioMin !== undefined) r = r.filter(p => p.precio >= f.precioMin!);
    if (f.precioMax !== undefined) r = r.filter(p => p.precio <= f.precioMax!);
    if (f.disponible) r = r.filter(p => p.disponible);
    if (f.oferta)     r = r.filter(p => p.oferta);
    if (f.nuevo)      r = r.filter(p => p.nuevo);
    return r;
  }
}
