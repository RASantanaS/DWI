/**
 * utilidades.js
 * Funciones de utilidad compartidas en toda la aplicación.
 * Exportadas como módulo ES6.
 */

/* ============================================================
   TEMA (modo claro / oscuro) — persiste en localStorage
   ============================================================ */
const CLAVE_TEMA = 'techstore_tema';

export function inicializarTema() {
  const temaGuardado = localStorage.getItem(CLAVE_TEMA) || 'claro';
  aplicarTema(temaGuardado);
}

export function aplicarTema(tema) {
  if (tema === 'oscuro') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
  localStorage.setItem(CLAVE_TEMA, tema);
}

export function alternarTema() {
  const esOscuro = document.body.classList.contains('dark-theme');
  aplicarTema(esOscuro ? 'claro' : 'oscuro');
  return !esOscuro;
}

export function obtenerTema() {
  return localStorage.getItem(CLAVE_TEMA) || 'claro';
}

/* ============================================================
   LOCALSTORAGE — helpers genéricos
   ============================================================ */
export function guardarLS(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
    return true;
  } catch (err) {
    console.error(`[LS] Error al guardar "${clave}":`, err);
    return false;
  }
}

export function obtenerLS(clave, valorDefecto = null) {
  try {
    const dato = localStorage.getItem(clave);
    return dato !== null ? JSON.parse(dato) : valorDefecto;
  } catch (err) {
    console.error(`[LS] Error al leer "${clave}":`, err);
    return valorDefecto;
  }
}

export function eliminarLS(clave) {
  localStorage.removeItem(clave);
}

export function limpiarLS() {
  localStorage.clear();
}

/* ============================================================
   FORMATEO DE PRECIO
   ============================================================ */
export function formatearPrecio(valor) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

/* ============================================================
   NOTIFICACIONES TOAST
   ============================================================ */
let contenedorToast = null;

function obtenerContenedorToast() {
  if (!contenedorToast || !document.body.contains(contenedorToast)) {
    contenedorToast = document.createElement('div');
    contenedorToast.id = 'contenedor-toast';
    contenedorToast.setAttribute('aria-live', 'polite');
    contenedorToast.setAttribute('aria-atomic', 'false');
    document.body.appendChild(contenedorToast);
  }
  return contenedorToast;
}

/**
 * Muestra una notificación tipo "toast".
 * @param {string} mensaje  - Texto a mostrar
 * @param {'info'|'exito'|'error'|'advertencia'} tipo
 * @param {number} duracion - Ms antes de desaparecer (0 = manual)
 */
export function mostrarNotificacion(mensaje, tipo = 'info', duracion = 3500) {
  const contenedor = obtenerContenedorToast();

  const iconos = {
    exito:      '✓',
    error:      '✕',
    advertencia:'⚠',
    info:       'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast--${tipo}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast__icono" aria-hidden="true">${iconos[tipo] ?? 'ℹ'}</span>
    <span class="toast__texto">${mensaje}</span>
    <button class="toast__cerrar" aria-label="Cerrar notificación">×</button>
  `;

  contenedor.appendChild(toast);

  // Animar entrada (next frame)
  requestAnimationFrame(() => toast.classList.add('toast--visible'));

  const cerrar = () => {
    toast.classList.remove('toast--visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  };

  toast.querySelector('.toast__cerrar').addEventListener('click', cerrar);
  if (duracion > 0) setTimeout(cerrar, duracion);

  return toast;
}

/* ============================================================
   GENERADOR DE ID DE ORDEN
   ============================================================ */
export function generarIdOrden() {
  const num = Math.floor(Math.random() * 90000) + 10000;
  const fecha = new Date();
  const year  = fecha.getFullYear().toString().slice(-2);
  const mes   = String(fecha.getMonth() + 1).padStart(2, '0');
  return `ORD-${year}${mes}-${num}`;
}

/* ============================================================
   FORMATEO DE FECHA
   ============================================================ */
export function formatearFecha(date = new Date()) {
  return new Intl.DateTimeFormat('es-DO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date instanceof Date ? date : new Date(date));
}

/* ============================================================
   DEBOUNCE
   ============================================================ */
export function debounce(fn, retardo = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), retardo);
  };
}

/* ============================================================
   ESTRELLAS DE RATING
   ============================================================ */
export function renderizarEstrellas(rating) {
  const llenas  = Math.floor(rating);
  const mitad   = rating % 1 >= 0.5 ? 1 : 0;
  const vacias  = 5 - llenas - mitad;
  return (
    '★'.repeat(llenas) +
    (mitad ? '½' : '') +
    '☆'.repeat(vacias)
  );
}

/* ============================================================
   SCROLL SUAVE A ELEMENTO
   ============================================================ */
export function scrollA(selector) {
  const el = document.querySelector(selector);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
