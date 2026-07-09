import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-bar-component">
      <label [for]="inputId" class="sr-only">{{ placeholder }}</label>
      <input [id]="inputId" type="search" [(ngModel)]="termino"
             (input)="onInput()" [placeholder]="placeholder" autocomplete="off">
      <button type="button" *ngIf="termino" (click)="limpiar()" aria-label="Limpiar">✕</button>
    </div>
  `,
})
export class SearchBarComponent {
  @Input() valorInicial = '';
  @Input() placeholder  = 'Buscar…';
  @Input() inputId      = 'sb-' + Math.random().toString(36).slice(2);
  @Output() buscar      = new EventEmitter<string>();

  termino = this.valorInicial;
  private termino$$ = new Subject<string>();

  constructor() {
    this.termino$$.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(v => this.buscar.emit(v));
  }

  onInput(): void { this.termino$$.next(this.termino); }
  limpiar(): void { this.termino = ''; this.buscar.emit(''); }
}
