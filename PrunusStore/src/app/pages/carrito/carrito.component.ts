import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, AsyncPipe } from '@angular/common';
import { DopCurrencyPipe } from '../../pipes/dop-currency.pipe';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { Orden } from '../../models/orden';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterLink, DopCurrencyPipe, DatePipe],
  templateUrl: './carrito.component.html',
})
export class CarritoComponent implements OnInit {
  items$:     Observable<ItemCarrito[]>;
  subtotal$:  Observable<number>;
  impuestos$: Observable<number>;
  total$:     Observable<number>;

  historial: Orden[] = [];
  sesionRequerida = false;

  constructor(
    private carritoService: CarritoService,
    private route: ActivatedRoute,
  ) {
    this.items$     = this.carritoService.items$;
    this.subtotal$  = this.carritoService.subtotal$;
    this.impuestos$ = this.carritoService.impuestos$;
    this.total$     = this.carritoService.total$;
  }

  ngOnInit(): void {
    this.historial = this.carritoService.obtenerHistorial();
    this.route.queryParams.subscribe(p => (this.sesionRequerida = p['sesionRequerida'] === 'true'));
  }

  get categorias(): string[] {
    return [...new Set(this.carritoService.valorActual.map(i => i.producto.categoria))];
  }
  get masCaro(): string {
    const items = this.carritoService.valorActual;
    return items.length ? items.reduce((m,i) => i.producto.precio > m.producto.precio ? i : m).producto.nombre : '—';
  }

  cambiarCantidad(id: number, delta: number): void {
    const item = this.carritoService.valorActual.find(i => i.producto.id === id);
    if (item) this.carritoService.actualizarCantidad(id, item.cantidad + delta);
  }

  eliminar(id: number):  void { this.carritoService.eliminar(id); }

  vaciar(): void {
    if (confirm('¿Seguro que quieres vaciar el carrito?')) this.carritoService.vaciar();
  }

  limpiarHistorial(): void {
    this.carritoService.limpiarHistorial();
    this.historial = [];
  }
}
