import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DopCurrencyPipe } from '../../pipes/dop-currency.pipe';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import emailjs from '@emailjs/browser';
import { CarritoService, ItemCarrito } from '../../services/carrito.service';
import { AuthService } from '../../services/auth.service';
import { Orden } from '../../models/orden';
import { LOGO_URL_CORREO } from '../../config/marca.config';

const EMAILJS_SERVICE_ID  = 'TU_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'TU_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY';

const LOGO_URL = LOGO_URL_CORREO;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, DopCurrencyPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  form: FormGroup;
  items: ItemCarrito[] = [];
  subtotal  = 0;
  impuestos = 0;
  total     = 0;

  procesando     = false;
  ordenGenerada: Orden | null = null;
  errorPago      = '';
  estadoEnvioCorreo: 'inactivo' | 'enviando' | 'enviado' | 'error' = 'inactivo';

  constructor(
    private fb: FormBuilder,
    private carritoService: CarritoService,
    private authService: AuthService,
    private router: Router,
  ) {
    const usuario = this.authService.usuarioActual;
    this.form = this.fb.group({
      nombre:      [usuario?.nombre ?? '', [Validators.required, Validators.minLength(3)]],
      email:       [usuario?.email ?? '', [Validators.required, Validators.email]],
      direccion:   ['', [Validators.required, Validators.minLength(10)]],
      telefono:    ['', [Validators.required, Validators.pattern(/^[\d\s+\-()]{7,20}$/)]],
      tarjeta:     ['', [Validators.required, Validators.pattern(/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/)]],
      vencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv:         ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  ngOnInit(): void {
    this.items     = this.carritoService.valorActual;
    this.subtotal  = this.items.reduce((t,i) => t + i.producto.precio * i.cantidad, 0);
    this.impuestos = this.subtotal * 0.18;
    this.total     = this.subtotal + this.impuestos;
    if (!this.items.length) this.router.navigate(['/carrito']);
  }

  c(n: string) { return this.form.get(n); }

  mostrarError(n: string): boolean {
    const f = this.c(n);
    return !!f && f.invalid && (f.dirty || f.touched);
  }

  mensajeError(n: string): string {
    const e = this.c(n)?.errors;
    if (!e) return '';
    if (e['required'])  return 'Este campo es obligatorio.';
    if (e['email'])     return 'Ingresa un correo electrónico válido.';
    if (e['minlength']) return `Mínimo ${e['minlength'].requiredLength} caracteres.`;
    if (e['pattern']) {
      const mapa: Record<string,string> = {
        telefono: 'Formato de teléfono inválido.', tarjeta: 'Ingresa los 16 dígitos.',
        vencimiento: 'Formato MM/AA (ej. 08/27).', cvv: 'CVV de 3 o 4 dígitos.',
      };
      return mapa[n] ?? 'Formato inválido.';
    }
    return 'Campo inválido.';
  }

  async confirmarCompra(): Promise<void> {
    this.errorPago = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.procesando = true;
    try {
      await new Promise<void>((resolve, reject) =>
        setTimeout(() => Math.random() < 0.95 ? resolve() : reject(new Error('Pago rechazado. Intenta otra tarjeta.')), 1600)
      );
      const { nombre, email, direccion, telefono } = this.form.value;
      this.ordenGenerada = this.carritoService.generarOrden({ nombre, email, direccion, telefono });
      this.enviarFacturaPorCorreo(this.ordenGenerada);
    } catch (err) {
      this.errorPago = (err as Error).message;
    } finally {
      this.procesando = false;
    }
  }

  private enviarFacturaPorCorreo(orden: Orden): void {
    this.estadoEnvioCorreo = 'enviando';
    const detalleItems = orden.items
      .map(it => `${it.cantidad} x ${it.producto.nombre}`)
      .join('\n');

    const parametrosPlantilla = {
      to_email: orden.cliente.email,
      to_name: orden.cliente.nombre,
      logo_url: LOGO_URL,
      orden_id: orden.id,
      orden_fecha: orden.fecha,
      orden_items: detalleItems,
      orden_subtotal: `RD$ ${orden.subtotal.toFixed(2)}`,
      orden_itbis: `RD$ ${orden.impuestos.toFixed(2)}`,
      orden_total: `RD$ ${orden.total.toFixed(2)}`,
    };

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, parametrosPlantilla, { publicKey: EMAILJS_PUBLIC_KEY })
      .then(() => { this.estadoEnvioCorreo = 'enviado'; })
      .catch((err) => {
        console.error('[EmailJS] No se pudo enviar la factura:', err);
        this.estadoEnvioCorreo = 'error';
      });
  }

  imprimirFactura(): void {
    window.print();
  }
}

