import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CarritoService } from '../../services/carrito.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { CategoryMenuComponent } from '../../components/category-menu/category-menu.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, CategoryMenuComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  destacados: Producto[] = [];
  trending: Producto[] = [];
  cargando = true;
  conteos: Record<string, number> = {};

  constructor(
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe(ps => {
      this.destacados = ps.filter(p => p.destacado);
      this.conteos = ps.reduce((acc, p) => ({ ...acc, [p.categoria]: (acc[p.categoria] ?? 0) + 1 }), {} as Record<string,number>);
      this.cargando = false;
    });

    this.productoService.obtenerTrendingAPI().subscribe(ps => (this.trending = ps));
  }

  irACategoria(id: string): void { this.router.navigate(['/productos'], { queryParams: { categoria: id } }); }
  agregar(p: Producto): void    { this.carritoService.agregar(p); }
  enCarrito(id: number): boolean { return this.carritoService.tieneProducto(id); }
}
