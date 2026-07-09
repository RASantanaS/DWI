export interface Cliente {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  token: string;
  rol: 'cliente' | 'admin';
}
