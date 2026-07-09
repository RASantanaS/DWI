import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'descuento', standalone: true })
export class DescuentoPipe implements PipeTransform {
  transform(precio: number, pct = 0, comoMoneda = false): number | string {
    const final = pct > 0 ? precio - precio * (pct / 100) : precio;
    return comoMoneda
      ? `RD$ ${new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(final)}`
      : Math.round(final * 100) / 100;
  }
}
