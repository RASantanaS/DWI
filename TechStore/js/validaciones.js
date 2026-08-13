/**
 * validaciones.js
 * Expresiones regulares y sistema de validación en tiempo real
 * para el formulario de contacto.
 */

import { mostrarNotificacion } from './utilidades.js';

/* ============================================================
   EXPRESIONES REGULARES
   ============================================================ */
export const REGEX = {
  email:    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  telefono: /^[\d\s\+\-\(\)]{7,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d).{8,}$/,
  nombre:   /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'\-]{2,60}$/,
  url:      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z]{2,6}(\/[^\s]*)?$/,
};

/* ============================================================
   VALIDAR CAMPO INDIVIDUAL
   ============================================================ */
export function validarCampo(id, regla) {
  const campo = document.getElementById(id);
  if (!campo) return true; // campo no existe en esta página

  const valor = campo.value.trim();
  let esValido = true;
  let mensaje  = '';

  switch (regla) {
    case 'requerido':
      esValido = valor.length > 0;
      mensaje  = 'Este campo es obligatorio.';
      break;
    case 'email':
      esValido = REGEX.email.test(valor);
      mensaje  = 'Ingresa un correo electrónico válido (ejemplo@correo.com).';
      break;
    case 'telefono':
      esValido = valor === '' || REGEX.telefono.test(valor);
      mensaje  = 'El teléfono debe tener entre 7 y 20 dígitos.';
      break;
    case 'password':
      esValido = REGEX.password.test(valor);
      mensaje  = 'La contraseña necesita al menos 8 caracteres, una letra y un número.';
      break;
    case 'nombre':
      esValido = REGEX.nombre.test(valor);
      mensaje  = 'El nombre debe tener entre 2 y 60 letras.';
      break;
    default:
      esValido = valor.length > 0;
      mensaje  = 'Campo inválido.';
  }

  if (esValido) {
    marcarExito(campo);
  } else {
    marcarError(campo, mensaje);
  }

  return esValido;
}

/* ============================================================
   MARCAR ESTADO DE CAMPO
   ============================================================ */
function marcarError(campo, mensaje) {
  campo.classList.remove('campo--valido');
  campo.classList.add('campo--invalido');
  campo.setAttribute('aria-invalid', 'true');
  campo.setAttribute('aria-describedby', `error-${campo.id}`);

  let contenedor = campo.closest('.campo') ?? campo.parentElement;
  let errorEl = contenedor.querySelector(`.mensaje-error[data-for="${campo.id}"]`);
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'mensaje-error';
    errorEl.id = `error-${campo.id}`;
    errorEl.dataset.for = campo.id;
    errorEl.setAttribute('role', 'alert');
    contenedor.appendChild(errorEl);
  }
  errorEl.textContent = mensaje;
}

function marcarExito(campo) {
  campo.classList.remove('campo--invalido');
  campo.classList.add('campo--valido');
  campo.setAttribute('aria-invalid', 'false');

  let contenedor = campo.closest('.campo') ?? campo.parentElement;
  const errorEl = contenedor.querySelector(`.mensaje-error[data-for="${campo.id}"]`);
  if (errorEl) errorEl.textContent = '';
}

function limpiarEstado(campo) {
  campo.classList.remove('campo--valido', 'campo--invalido');
  campo.removeAttribute('aria-invalid');
  let contenedor = campo.closest('.campo') ?? campo.parentElement;
  const errorEl = contenedor.querySelector(`.mensaje-error[data-for="${campo.id}"]`);
  if (errorEl) errorEl.remove();
}

/* ============================================================
   INICIALIZAR FORMULARIO DE CONTACTO
   ============================================================ */
export function inicializarFormularioContacto() {
  const form = document.getElementById('form-contacto');
  if (!form) return;

  // Definición de validaciones por campo
  const reglas = [
    { id: 'nombre',    regla: 'nombre',    evento: 'blur' },
    { id: 'email',     regla: 'email',     evento: 'blur' },
    { id: 'password',  regla: 'password',  evento: 'blur' },
    { id: 'telefono',  regla: 'telefono',  evento: 'blur' },
  ];

  // Validación en tiempo real (keyup) con feedback inmediato
  reglas.forEach(({ id, regla }) => {
    const campo = document.getElementById(id);
    if (!campo) return;
    campo.addEventListener('input', () => {
      if (campo.value.trim().length > 0) validarCampo(id, regla);
    });
    campo.addEventListener('blur', () => {
      if (campo.value.trim().length > 0 || campo.required) validarCampo(id, regla);
    });
  });

  // Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const resultados = reglas.map(({ id, regla }) => validarCampo(id, regla));
    if (resultados.includes(false)) {
      mostrarNotificacion('Revisa los campos marcados en rojo.', 'error');
      return;
    }

    await simularEnvio(form);
  });

  // Reset
  form.addEventListener('reset', () => {
    setTimeout(() => {
      form.querySelectorAll('input, textarea, select').forEach(limpiarEstado);
    }, 0);
  });
}

/* ============================================================
   SIMULACIÓN DE ENVÍO
   ============================================================ */
async function simularEnvio(form) {
  const btnEnviar = form.querySelector('button[type="submit"]');
  const textoOriginal = btnEnviar?.textContent ?? 'Enviar';

  // Estado cargando
  if (btnEnviar) {
    btnEnviar.disabled = true;
    btnEnviar.textContent = 'Enviando…';
  }

  try {
    // Simula llamada a servidor (1.5 segundos)
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // 95% de éxito, 5% de error simulado para demostrar catch
        Math.random() < 0.95 ? resolve() : reject(new Error('Timeout de red simulado.'));
      }, 1500);
    });

    // Mostrar pantalla de éxito
    mostrarExitoContacto(form);

  } catch (err) {
    console.error('[Contacto] Error al enviar:', err);
    mostrarNotificacion(
      'No se pudo enviar el mensaje. Por favor intenta de nuevo.',
      'error'
    );
  } finally {
    if (btnEnviar) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = textoOriginal;
    }
  }
}

function mostrarExitoContacto(form) {
  const num = Math.floor(Math.random() * 90000) + 10000;
  form.classList.add('oculto');

  const exito = document.createElement('div');
  exito.className = 'exito-contacto';
  exito.innerHTML = `
    <div class="exito-contacto__icono">✓</div>
    <h2>¡Mensaje enviado!</h2>
    <p>Gracias por contactarnos. Te responderemos en un plazo de 24–48 horas hábiles.</p>
    <p class="exito-contacto__ref">Número de referencia: <strong>#MSG-${num}</strong></p>
    <button class="boton boton-primario" id="btn-nuevo-mensaje">Enviar otro mensaje</button>
  `;

  form.parentElement.appendChild(exito);

  document.getElementById('btn-nuevo-mensaje')?.addEventListener('click', () => {
    form.reset();
    form.classList.remove('oculto');
    exito.remove();
  });
}
