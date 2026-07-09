import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DopCurrencyPipe } from '../../pipes/dop-currency.pipe';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DopCurrencyPipe],
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  form: FormGroup;
  editandoId: number | null = null;
  mostrarForm = false;
  filtroTexto = '';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    public authService: AuthService,
  ) {
    this.form = this.fb.group({
      nombre:     ['', Validators.required],
      precio:     [0,  [Validators.required, Validators.min(0.01)]],
      categoria:  ['accesorios', Validators.required],
      marca:      ['', Validators.required],
      stock:      [0,  [Validators.required, Validators.min(0)]],
      imagen:     [''],
      disponible: [true],
    });
  }

  ngOnInit(): void {
    this.productoService.obtenerProductos().subscribe(ps => {
      this.productos = ps;
      this.cargando  = false;
    });
  }

  get productosFiltrados(): Producto[] {
    const q = this.filtroTexto.toLowerCase();
    return q ? this.productos.filter(p =>
      p.nombre.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    ) : this.productos;
  }

  get stats() {
    return {
      total:    this.productos.length,
      stock:    this.productos.reduce((t,p) => t + p.stock, 0),
      agotados: this.productos.filter(p => !p.disponible || p.stock === 0).length,
    };
  }

  nuevoProducto(): void {
    this.editandoId = null;
    this.form.reset({ categoria:'accesorios', precio:0, stock:0, disponible:true });
    this.mostrarForm = true;
  }

  editar(p: Producto): void {
    this.editandoId = p.id;
    this.form.setValue({ nombre:p.nombre, precio:p.precio, categoria:p.categoria,
      marca:p.marca, stock:p.stock, imagen:p.imagen, disponible:p.disponible });
    this.mostrarForm = true;
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    if (this.editandoId !== null) {
      this.productos = this.productos.map(p => p.id === this.editandoId ? { ...p, ...v } : p);
    } else {
      const nuevoId = Math.max(0, ...this.productos.map(p => p.id)) + 1;
      this.productos = [{ id:nuevoId, ...v,
        descripcionCorta:'', descripcion:'', precioOriginal:v.precio,
        descuento:0, sku:`SKU-${nuevoId}`, rating:0, reviews:0,
        nuevo:true, oferta:false, destacado:false, colores:[], etiquetas:[],
        caracteristicas:{} } as Producto, ...this.productos];
    }
    this.cancelar();
  }

  eliminar(id: number): void {
    if (confirm('¿Eliminar este producto del catálogo?'))
      this.productos = this.productos.filter(p => p.id !== id);
  }

  cancelar(): void { this.mostrarForm = false; this.editandoId = null; }
}
