import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dop', standalone: true })
export class DopCurrencyPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    const n = Number(valor) || 0;
    const formateado = new Intl.NumberFormat('es-DO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
    return `RD$ ${formateado}`;
  }
}
