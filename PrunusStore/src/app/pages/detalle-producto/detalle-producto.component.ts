import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DopCurrencyPipe } from '../../pipes/dop-currency.pipe';
import { RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-detalle-producto',
  standalone: true,
  imports: [CommonModule, RouterLink, DopCurrencyPipe, ProductCardComponent],
  templateUrl: './detalle-producto.component.html',
})
export class DetalleProductoComponent implements OnChanges {
    @Input() id!: string;

  producto: Producto | null = null;
  relacionados: Producto[] = [];
  cargando = true;
  noEncontrado = false;
  cantidad = 1;

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
  ) {}

  ngOnChanges(): void {
    this.cargando = true;
    this.noEncontrado = false;

    this.productoService.obtenerProducto(Number(this.id)).subscribe(p => {
      this.producto = p ?? null;
      this.cargando = false;
      this.noEncontrado = !p;
      this.cantidad = 1;

      if (p) {
        this.productoService.buscarProducto({ categoria: p.categoria })
          .subscribe(lista => this.relacionados = lista.filter(r => r.id !== p.id).slice(0, 4));
      }
    });
  }

  get ahorro(): number { return this.producto ? this.producto.precioOriginal - this.producto.precio : 0; }

  get estrellas(): string {
    if (!this.producto) return '';
    const l = Math.floor(this.producto.rating), m = this.producto.rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(l) + (m ? '½' : '') + '☆'.repeat(5 - l - m);
  }

  get specs(): {k: string; v: string}[] {
    return this.producto ? Object.entries(this.producto.caracteristicas).map(([k,v]) => ({k,v})) : [];
  }

  cambiarCantidad(d: number): void {
    if (!this.producto) return;
    this.cantidad = Math.max(1, Math.min(this.cantidad + d, this.producto.stock || 99));
  }

  agregarAlCarrito(): void {
    if (this.producto) this.carritoService.agregar(this.producto, this.cantidad);
  }

  enCarrito(id: number): boolean { return this.carritoService.tieneProducto(id); }
  agregarRelacionado(p: Producto): void { this.carritoService.agregar(p); }
}
