import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    title: 'PrunusStore Online | Inicio',
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent),
    title: 'PrunusStore Online | Productos',
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./pages/detalle-producto/detalle-producto.component').then(m => m.DetalleProductoComponent),
    title: 'PrunusStore Online | Detalle',
  },
  {
    path: 'carrito',
    loadComponent: () => import('./pages/carrito/carrito.component').then(m => m.CarritoComponent),
    title: 'PrunusStore Online | Carrito',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    title: 'PrunusStore Online | Iniciar sesión',
  },
  {
    path: 'acerca-de',
    loadComponent: () => import('./pages/acerca-de/acerca-de.component').then(m => m.AcercaDeComponent),
    title: 'PrunusStore Online | Acerca de',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'PrunusStore Online | Checkout',
    canActivate: [authGuard],
  },
  {
    path: 'contacto',
    loadComponent: () => import('./pages/contacto/contacto.component').then(m => m.ContactoComponent),
    title: 'PrunusStore Online | Contacto',
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent),
    title: 'PrunusStore Online | Admin',
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'PrunusStore Online | 404',
  },
];
