import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <main class="pagina-404">
      <section class="contenedor-404" aria-labelledby="t404">
        <svg class="ilustracion-404" viewBox="0 0 320 220" role="img" aria-hidden="true">
          <ellipse cx="160" cy="195" rx="110" ry="14" fill="var(--color-sombra-404)"/>
          <g style="animation:flotar 3.5s ease-in-out infinite;">
            <rect x="60" y="40" width="200" height="120" rx="14" fill="var(--color-superficie)" stroke="var(--color-borde)" stroke-width="3"/>
            <line x1="78" y1="78" x2="190" y2="78" stroke="var(--color-acento)" stroke-width="4" stroke-linecap="round"/>
            <line x1="78" y1="94" x2="220" y2="94" stroke="var(--color-borde)" stroke-width="4" stroke-linecap="round"/>
            <circle cx="160" cy="145" r="6" fill="var(--color-acento-2)"/>
          </g>
          <text x="160" y="200" text-anchor="middle" font-family="Space Grotesk, sans-serif"
                font-size="28" font-weight="700" fill="var(--color-acento)">404</text>
        </svg>
        <p class="ojo-titular">Error 404</p>
        <h1 id="t404">Esta página se quedó sin batería</h1>
        <p>La ruta que intentaste visitar no existe en PrunusStore Online.</p>
        <p>
          <a routerLink="/" class="boton boton-primario">
            <i class="fa-solid fa-house" aria-hidden="true"></i> Volver al inicio
          </a>
          <a routerLink="/productos" class="boton boton-texto">Ver todos los productos</a>
        </p>
      </section>
    </main>
  `,
})
export class NotFoundComponent {}
