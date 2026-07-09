import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Usuario } from '../models/cliente';

const LS_SESION    = 'prunusstore_sesion';
const LS_USUARIOS  = 'prunusstore_usuarios';

interface UsuarioRegistrado {
  id: number;
  nombre: string;
  email: string;
  passwordHash: string;
  rol: 'cliente' | 'admin';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuario$$ = new BehaviorSubject<Usuario | null>(this.cargarSesion());
  readonly usuario$: Observable<Usuario | null> = this.usuario$$.asObservable();

  get estaAutenticado(): boolean { return this.usuario$$.value !== null; }
  get usuarioActual(): Usuario | null { return this.usuario$$.value; }
  get token(): string | null { return this.usuario$$.value?.token ?? null; }

  private async sha256(texto: string): Promise<string> {
    const buffer = new TextEncoder().encode(texto);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  registrar(nombre: string, email: string, password: string): Observable<Usuario> {
    return from(this.registrarAsync(nombre, email, password));
  }

  private async registrarAsync(nombre: string, email: string, password: string): Promise<Usuario> {
    const usuarios = this.cargarUsuarios();
    if (usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Ya existe una cuenta registrada con ese correo.');
    }
    const passwordHash = await this.sha256(password);
    const nuevo: UsuarioRegistrado = {
      id: Date.now(),
      nombre,
      email,
      passwordHash,
      rol: email.startsWith('admin') ? 'admin' : 'cliente',
    };
    usuarios.push(nuevo);
    localStorage.setItem(LS_USUARIOS, JSON.stringify(usuarios));
    return this.iniciarSesionDesde(nuevo);
  }

  login(email: string, password: string): Observable<Usuario> {
    return from(this.loginAsync(email, password));
  }

  private async loginAsync(email: string, password: string): Promise<Usuario> {
    if (!email.includes('@') || password.length < 4) {
      throw new Error('Credenciales inválidas.');
    }
    const usuarios = this.cargarUsuarios();
    const passwordHash = await this.sha256(password);
    const encontrado = usuarios.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === passwordHash
    );
    if (!encontrado) throw new Error('Correo o contraseña incorrectos.');
    return this.iniciarSesionDesde(encontrado);
  }

  private iniciarSesionDesde(u: UsuarioRegistrado): Usuario {
    const usuario: Usuario = {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      token: `jwt.sim.${btoa(JSON.stringify({ email: u.email, exp: Date.now() + 3_600_000 }))}`,
      rol: u.rol,
    };
    this.usuario$$.next(usuario);
    localStorage.setItem(LS_SESION, JSON.stringify(usuario));
    return usuario;
  }

  logout(): void {
    this.usuario$$.next(null);
    localStorage.removeItem(LS_SESION);
  }

  private cargarSesion(): Usuario | null {
    try { const d = localStorage.getItem(LS_SESION); return d ? JSON.parse(d) : null; }
    catch { return null; }
  }

  private cargarUsuarios(): UsuarioRegistrado[] {
    try { const d = localStorage.getItem(LS_USUARIOS); return d ? JSON.parse(d) : []; }
    catch { return []; }
  }
}
