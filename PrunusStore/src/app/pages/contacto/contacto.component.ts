import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.component.html',
})
export class ContactoComponent {
  form: FormGroup;
  enviando = false;
  enviado  = false;
  ref      = '';

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre:     ['', [Validators.required, Validators.minLength(2)]],
      email:      ['', [Validators.required, Validators.email]],
      telefono:   ['', [Validators.pattern(/^[\d\s+\-()]{7,20}$/)]],
      asunto:     [''],
      comentario: ['', [Validators.required, Validators.minLength(10)]],
      newsletter: [false],
    });
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
    if (e['pattern'])   return 'Formato inválido.';
    return '';
  }

  async enviar(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.enviando = true;
    try {
      await new Promise<void>((res, rej) =>
        setTimeout(() => Math.random() < 0.95 ? res() : rej(), 1400)
      );
      this.ref     = `MSG-${Math.floor(Math.random() * 90000) + 10000}`;
      this.enviado = true;
    } catch {
      alert('No se pudo enviar. Intenta de nuevo.');
    } finally {
      this.enviando = false;
    }
  }

  nuevoMensaje(): void { this.form.reset({ newsletter: false }); this.enviado = false; }
}
