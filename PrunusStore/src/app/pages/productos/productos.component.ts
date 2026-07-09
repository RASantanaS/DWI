import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto, FiltrosProducto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';

type Orden = 'relevancia'|'precio-asc'|'precio-desc'|'rating'|'nuevo'|'nombre'|'descuento';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, SearchBarComponent],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  marcas: string[] = [];
  cargando = true;

  filtros: FiltrosProducto = {};
  orden: Orden = 'relevancia';
  colores: string[] = [];

  private filtros$$ = new BehaviorSubject<FiltrosProducto>({});
  private orden$$   = new BehaviorSubject<Orden>('relevancia');

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      if (params['categoria']) this.filtros.categoria = params['categoria'];
      if (params['q'])         this.filtros.q         = params['q'];
      this.filtros$$.next({ ...this.filtros });
    });

    this.productoService.obtenerMarcas().subscribe(m => (this.marcas = m));

    combineLatest([
      this.productoService.obtenerProductos(),
      this.filtros$$.asObservable(),
      this.orden$$.asObservable(),
    ]).pipe(
      map(([todos, filtros, orden]) => this.ordenar(this.filtrar(todos, filtros), orden))
    ).subscribe(lista => {
      this.productos = lista;
      this.cargando  = false;
    });
  }

  private filtrar(todos: Producto[], f: FiltrosProducto): Producto[] {
    let r = [...todos];
    if (f.q) {
      const q = f.q.toLowerCase();
      r = r.filter(p => p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) || p.etiquetas.some(e => e.toLowerCase().includes(q)));
    }
    if (f.categoria)           r = r.filter(p => p.categoria === f.categoria);
    if (f.marca)               r = r.filter(p => p.marca === f.marca);
    if (f.precioMin !== undefined) r = r.filter(p => p.precio >= f.precioMin!);
    if (f.precioMax !== undefined) r = r.filter(p => p.precio <= f.precioMax!);
    if (f.disponible)          r = r.filter(p => p.disponible);
    if (f.oferta)              r = r.filter(p => p.oferta);
    if (f.nuevo)               r = r.filter(p => p.nuevo);
    if (this.colores.length)   r = r.filter(p => p.colores.some(c => this.colores.includes(c.toLowerCase())));
    return r;
  }

  private ordenar(lista: Producto[], orden: Orden): Producto[] {
    const c = [...lista];
    switch (orden) {
      case 'precio-asc':  return c.sort((a,b) => a.precio - b.precio);
      case 'precio-desc': return c.sort((a,b) => b.precio - a.precio);
      case 'rating':      return c.sort((a,b) => b.rating - a.rating);
      case 'nuevo':       return c.sort((a,b) => Number(b.nuevo) - Number(a.nuevo));
      case 'nombre':      return c.sort((a,b) => a.nombre.localeCompare(b.nombre));
      case 'descuento':   return c.sort((a,b) => b.descuento - a.descuento);
      default:            return c.sort((a,b) => Number(b.destacado) - Number(a.destacado));
    }
  }

  onBuscar(q: string): void {
    this.filtros = { ...this.filtros, q };
    this.filtros$$.next({ ...this.filtros });
  }

  onCambioFiltro(): void { this.filtros$$.next({ ...this.filtros }); }
  onCambioOrden():  void { this.orden$$.next(this.orden); }

  onColorToggle(color: string, checked: boolean): void {
    this.colores = checked ? [...this.colores, color] : this.colores.filter(c => c !== color);
    this.filtros$$.next({ ...this.filtros });
  }

  limpiarFiltros(): void {
    this.filtros = {};
    this.colores = [];
    this.orden   = 'relevancia';
    this.filtros$$.next({});
    this.orden$$.next('relevancia');
  }

  agregar(p: Producto): void    { this.carritoService.agregar(p); }
  enCarrito(id: number): boolean { return this.carritoService.tieneProducto(id); }
  trackById(_: number, p: Producto): number { return p.id; }
}
