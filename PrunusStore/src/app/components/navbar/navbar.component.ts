import { Component, OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { CarritoService } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { NOMBRE_MARCA, LOGO_URL } from '../../config/marca.config';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
    readonly nombreMarca = NOMBRE_MARCA;
  readonly logoUrl = LOGO_URL;

    busqueda = '';
  menuAbierto = false;
  temaOscuro = false;

  cantidadCarrito$: Observable<number>;

  constructor(
    private carritoService: CarritoService,
    public authService: AuthService,
    private router: Router,
  ) {
    this.cantidadCarrito$ = this.carritoService.cantidad$;
  }

  ngOnInit(): void {
    this.temaOscuro = (localStorage.getItem('prunusstore_tema') ?? 'claro') === 'oscuro';
  }

  alternarMenu(): void { this.menuAbierto = !this.menuAbierto; }

  alternarTema(): void {
    this.temaOscuro = !this.temaOscuro;
    document.body.classList.toggle('dark-theme', this.temaOscuro);
    localStorage.setItem('prunusstore_tema', this.temaOscuro ? 'oscuro' : 'claro');
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.menuAbierto = false;
    this.router.navigate(['/']);
  }

  buscar(): void {
    const q = this.busqueda.trim();
    if (!q) return;
    this.router.navigate(['/productos'], { queryParams: { q } });
    this.menuAbierto = false;
  }
}
