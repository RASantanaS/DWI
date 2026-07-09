import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DopCurrencyPipe } from '../../pipes/dop-currency.pipe';
import { RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { DescuentoPipe } from '../../pipes/descuento.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DopCurrencyPipe, DescuentoPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css',
})
export class ProductCardComponent {
  @Input({ required: true }) producto!: Producto;
  @Input() enCarrito = false;
  @Input() mostrarDetalle = true;

    @Output() agregado = new EventEmitter<Producto>();

  imagenError = false;

  get estrellas(): string {
    const l = Math.floor(this.producto.rating);
    const m = this.producto.rating % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(l) + (m ? '½' : '') + '☆'.repeat(5 - l - m);
  }

  onImagenError(): void { this.imagenError = true; }

  agregarAlCarrito(): void {
    if (!this.producto.disponible) return;
    this.agregado.emit(this.producto);
  }
}
