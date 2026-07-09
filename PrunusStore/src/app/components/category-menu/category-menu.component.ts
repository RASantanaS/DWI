import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Categoria { id: string; nombre: string; icono: string; }

@Component({
  selector: 'app-category-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="categorias-grid" role="list">
      <article class="categoria" role="listitem" tabindex="0"
               *ngFor="let cat of categorias"
               (click)="seleccionar.emit(cat.id)"
               (keydown.enter)="seleccionar.emit(cat.id)">
        <i class="fa-solid" [ngClass]="cat.icono" aria-hidden="true"></i>
        <h3>{{ cat.nombre }}</h3>
        <p>{{ (conteos[cat.id] ?? 0) }} producto{{ conteos[cat.id] === 1 ? '' : 's' }}</p>
      </article>
    </div>
  `,
})
export class CategoryMenuComponent {
  @Input() categorias: Categoria[] = [
    { id:'laptops',     nombre:'Laptops',      icono:'fa-laptop' },
    { id:'smartphones', nombre:'Smartphones',  icono:'fa-mobile-screen-button' },
    { id:'accesorios',  nombre:'Accesorios',   icono:'fa-headphones-simple' },
    { id:'gaming',      nombre:'Gaming',       icono:'fa-gamepad' },
    { id:'tablets',     nombre:'Tablets',      icono:'fa-tablet-screen-button' },
    { id:'tv',          nombre:'Smart TV',     icono:'fa-tv' },
  ];
  @Input() conteos: Record<string, number> = {};
  @Output() seleccionar = new EventEmitter<string>();
}
