import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  modo: 'login' | 'registro' = 'login';
  cargando = false;
  error = '';
  redirigirA = '/checkout';

  formLogin: FormGroup;
  formRegistro: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formLogin = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });

    this.formRegistro = this.fb.group({
      nombre:   ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  ngOnInit(): void {
    this.redirigirA = this.route.snapshot.queryParamMap.get('redirigirA') || '/checkout';
  }

  alternarModo(modo: 'login' | 'registro'): void {
    this.modo = modo;
    this.error = '';
  }

  c(form: FormGroup, n: string) { return form.get(n); }

  mostrarError(form: FormGroup, n: string): boolean {
    const f = this.c(form, n);
    return !!f && f.invalid && (f.dirty || f.touched);
  }

  enviarLogin(): void {
    this.error = '';
    if (this.formLogin.invalid) { this.formLogin.markAllAsTouched(); return; }
    this.cargando = true;
    const { email, password } = this.formLogin.value;
    this.authService.login(email, password).subscribe({
      next: () => { this.cargando = false; this.router.navigateByUrl(this.redirigirA); },
      error: (err: Error) => { this.cargando = false; this.error = err.message; },
    });
  }

  enviarRegistro(): void {
    this.error = '';
    if (this.formRegistro.invalid) { this.formRegistro.markAllAsTouched(); return; }
    this.cargando = true;
    const { nombre, email, password } = this.formRegistro.value;
    this.authService.registrar(nombre, email, password).subscribe({
      next: () => { this.cargando = false; this.router.navigateByUrl(this.redirigirA); },
      error: (err: Error) => { this.cargando = false; this.error = err.message; },
    });
  }
}
