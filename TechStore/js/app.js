/**
 * app.js
 * Punto de entrada principal de la aplicación.
 * Inicializa el header (tema, búsqueda, badge), y la lógica
 * específica de cada página según data-page del <body>.
 */

import { inicializarTema, alternarTema, mostrarNotificacion,
         formatearPrecio, debounce, guardarLS, obtenerLS, scrollA } from './utilidades.js';
import { carrito, Carrito, actualizarBadgeCarrito,
         obtenerHistorial, limpiarHistorial } from './carrito.js';
import { cargarProductosJSON } from './api.js';
import { cargarProductosAPI } from './api.js';
import { renderizarGrilla, renderizarTarjeta, filtrarProductos,
         ordenarProductos, renderizarDetalleProducto } from './productos.js';
import { inicializarFormularioContacto } from './validaciones.js';

/* Estado global (en memoria) */
let todosLosProductos = [];

/* ============================================================
   ARRANQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Aplicar tema ANTES de renderizar para evitar flash
  inicializarTema();

  // 2. Header compartido en todas las páginas
  inicializarHeader();

  // 3. Cargar catálogo una sola vez
  try {
    todosLosProductos = await cargarProductosJSON();
  } catch (err) {
    mostrarNotificacion('No se pudo cargar el catálogo de productos.', 'error');
  }

  // 4. Delegar a la página correcta
  const pagina = document.body.dataset.page ?? '';
  const iniciadores = {
    index:     inicializarIndex,
    productos: inicializarProductos,
    producto:  inicializarProducto,
    carrito:   inicializarPaginaCarrito,
    contacto:  inicializarContacto,
    acerca:    inicializarAcerca,
  };
  if (iniciadores[pagina]) await iniciadores[pagina]();
});

/* ============================================================
   HEADER COMPARTIDO
   ============================================================ */
function inicializarHeader() {
  // Badge inicial
  actualizarBadgeCarrito();

  // Actualizar badge en cada cambio de carrito
  document.addEventListener('carritoActualizado', (e) => {
    actualizarBadgeCarrito(e.detail.cantidad);
  });

  // Botón de tema
  const btnTema = document.getElementById('btn-tema');
  btnTema?.addEventListener('click', () => {
    alternarTema();
  });

  // Menú hamburguesa (CSS puro, pero también accesibilidad por teclado)
  const chkMenu = document.getElementById('menu-movil');
  chkMenu?.addEventListener('change', () => {
    document.querySelector('.nav-principal')
      ?.setAttribute('aria-expanded', chkMenu.checked);
  });

  // Búsqueda del header: en página de productos filtra en tiempo real;
  // en otras páginas navega a productos.html?q=...
  const formBusqueda = document.querySelector('.formulario-busqueda');
  const inputBusqueda = document.getElementById('busqueda');

  formBusqueda?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = inputBusqueda?.value.trim();
    if (!q) return;

    const esPaginaProductos = document.body.dataset.page === 'productos';
    if (esPaginaProductos) {
      document.getElementById('filtro-q').value = q;
      aplicarFiltrosProductos();
    } else {
      window.location.href = `productos.html?q=${encodeURIComponent(q)}`;
    }
  });
}

/* ============================================================
   INDEX
   ============================================================ */
async function inicializarIndex() {
  // Categorías dinámicas
  renderizarCategoriasIndex();

  // Botón banner "Comprar ahora"
  document.getElementById('btn-comprar-ahora')?.addEventListener('click', () => {
    window.location.href = 'productos.html';
  });

  // Productos destacados
  const destacados = todosLosProductos.filter(p => p.destacado);
  renderizarGrilla(destacados, 'grilla-destacados');

  // Countdown de oferta
  inicializarCountdown();

  // Sección de trending desde API externa (async, no bloquea)
  cargarTrendingAPI();
}

function renderizarCategoriasIndex() {
  const grilla = document.getElementById('grilla-categorias');
  if (!grilla) return;

  const categorias = [
    { id: 'laptops',      nombre: 'Laptops',      icono: 'fa-laptop',                emoji: '💻' },
    { id: 'smartphones',  nombre: 'Smartphones',   icono: 'fa-mobile-screen-button',  emoji: '📱' },
    { id: 'accesorios',   nombre: 'Accesorios',    icono: 'fa-headphones-simple',     emoji: '🎧' },
    { id: 'gaming',       nombre: 'Gaming',        icono: 'fa-gamepad',               emoji: '🎮' },
    { id: 'tablets',      nombre: 'Tablets',       icono: 'fa-tablet-screen-button',  emoji: '📲' },
    { id: 'tv',           nombre: 'Smart TV',      icono: 'fa-tv',                    emoji: '📺' },
  ];

  grilla.innerHTML = '';
  categorias.forEach(cat => {
    const cantidad = todosLosProductos.filter(p => p.categoria === cat.id).length;
    const art = document.createElement('article');
    art.className = 'categoria';
    art.setAttribute('role', 'button');
    art.setAttribute('tabindex', '0');
    art.innerHTML = `
      <i class="fa-solid ${cat.icono}" aria-hidden="true"></i>
      <h3>${cat.nombre}</h3>
      <p>${cantidad} producto${cantidad !== 1 ? 's' : ''}</p>
    `;
    const ir = () => (window.location.href = `productos.html?categoria=${cat.id}`);
    art.addEventListener('click', ir);
    art.addEventListener('keydown', e => e.key === 'Enter' && ir());
    grilla.appendChild(art);
  });
}

/* Countdown: oferta válida por N horas desde la carga de la página */
function inicializarCountdown() {
  const contenedor = document.getElementById('countdown');
  if (!contenedor) return;

  // Leer o crear la fecha límite de la oferta (6 horas desde la primera visita)
  const CLAVE = 'techstore_oferta_fin';
  let fin = obtenerLS(CLAVE);
  if (!fin || new Date(fin) < new Date()) {
    fin = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();
    guardarLS(CLAVE, fin);
  }
  const finDate = new Date(fin);

  function actualizar() {
    const diff = finDate - Date.now();
    if (diff <= 0) {
      contenedor.textContent = '¡Oferta finalizada!';
      clearInterval(timer);
      return;
    }
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const fmt = n => String(n).padStart(2, '0');
    contenedor.innerHTML =
      `<span>${fmt(h)}</span>:<span>${fmt(m)}</span>:<span>${fmt(s)}</span>`;
  }

  actualizar();
  const timer = setInterval(actualizar, 1000);
}

async function cargarTrendingAPI() {
  const seccion = document.getElementById('seccion-trending');
  const grilla  = document.getElementById('grilla-trending');
  if (!grilla || !seccion) return;

  try {
    const productos = await cargarProductosAPI();
    if (productos.length > 0) {
      seccion.style.display = '';
      renderizarGrilla(productos, 'grilla-trending', { mostrarDetalle: false });
    }
  } catch {
    // silencioso — la sección simplemente no aparece
  }
}

/* ============================================================
   PÁGINA PRODUCTOS
   ============================================================ */
function inicializarProductos() {
  const params = new URLSearchParams(window.location.search);

  // Sincronizar filtros desde URL
  if (params.get('categoria')) {
    const sel = document.getElementById('filtro-categoria');
    if (sel) sel.value = params.get('categoria');
  }
  if (params.get('q')) {
    const inp = document.getElementById('filtro-q');
    if (inp) inp.value = params.get('q');
    const header = document.getElementById('busqueda');
    if (header) header.value = params.get('q');
  }

  // Llenar select de marcas dinámicamente
  poblarSelectMarcas();

  // Renderizar inicial
  aplicarFiltrosProductos();

  // Filtros y búsqueda en tiempo real
  const filtros = ['filtro-q', 'filtro-categoria', 'filtro-marca',
                   'filtro-precio-min', 'filtro-precio-max',
                   'filtro-disponible', 'filtro-oferta', 'filtro-nuevo'];

  filtros.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const evento = (el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(evento, debounce(aplicarFiltrosProductos, 250));
  });

  // Colores
  document.querySelectorAll('.filtro-color').forEach(cb => {
    cb.addEventListener('change', debounce(aplicarFiltrosProductos, 250));
  });

  // Orden
  document.getElementById('filtro-orden')?.addEventListener('change', aplicarFiltrosProductos);

  // Botón limpiar filtros
  document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
    document.getElementById('form-filtros')?.reset();
    aplicarFiltrosProductos();
  });
}

function poblarSelectMarcas() {
  const sel = document.getElementById('filtro-marca');
  if (!sel) return;
  const marcas = [...new Set(todosLosProductos.map(p => p.marca))].sort();
  sel.innerHTML = '<option value="">Todas las marcas</option>' +
    marcas.map(m => `<option value="${m}">${m}</option>`).join('');
}

function aplicarFiltrosProductos() {
  const leer = id => document.getElementById(id)?.value ?? '';
  const leerBool = id => document.getElementById(id)?.checked;

  const coloresSeleccionados = [...document.querySelectorAll('.filtro-color:checked')]
    .map(cb => cb.value);

  const filtros = {
    q:          leer('filtro-q'),
    categoria:  leer('filtro-categoria'),
    marca:      leer('filtro-marca'),
    precioMin:  leer('filtro-precio-min'),
    precioMax:  leer('filtro-precio-max'),
    disponible: leerBool('filtro-disponible'),
    oferta:     leerBool('filtro-oferta'),
    nuevo:      leerBool('filtro-nuevo'),
    colores:    coloresSeleccionados,
  };

  const orden   = document.getElementById('filtro-orden')?.value ?? 'relevancia';
  let resultado = filtrarProductos(todosLosProductos, filtros);
  resultado     = ordenarProductos(resultado, orden);

  renderizarGrilla(resultado, 'grilla-productos');

  // Contador
  const contador = document.getElementById('contador-productos');
  if (contador) {
    contador.textContent = `${resultado.length} producto${resultado.length !== 1 ? 's' : ''}`;
  }
}

/* ============================================================
   PÁGINA PRODUCTO INDIVIDUAL
   ============================================================ */
async function inicializarProducto() {
  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id'), 10);

  const contenedor = document.getElementById('detalle-producto');
  if (!contenedor) return;

  if (!id) {
    contenedor.innerHTML = '<p class="error-pagina">No se especificó un producto. <a href="productos.html">Ver todos</a></p>';
    return;
  }

  const producto = todosLosProductos.find(p => p.id === id);

  if (!producto) {
    contenedor.innerHTML = `<p class="error-pagina">Producto #${id} no encontrado. <a href="productos.html">Ver todos</a></p>`;
    return;
  }

  document.title = `${producto.nombre} | TechStore Online`;
  renderizarDetalleProducto(producto, 'detalle-producto');

  // Productos relacionados
  const relacionados = todosLosProductos
    .filter(p => p.categoria === producto.categoria && p.id !== producto.id)
    .slice(0, 4);

  if (relacionados.length > 0) {
    const secRel = document.getElementById('relacionados-grilla');
    if (secRel) renderizarGrilla(relacionados, 'relacionados-grilla');
  }
}

/* ============================================================
   PÁGINA CARRITO
   ============================================================ */
function inicializarPaginaCarrito() {
  renderizarPaginaCarrito();

  document.addEventListener('carritoActualizado', renderizarPaginaCarrito);
}

function renderizarPaginaCarrito() {
  const contenedor = document.getElementById('contenedor-carrito');
  if (!contenedor) return;

  if (carrito.estaVacio) {
    contenedor.innerHTML = `
      <div class="carrito-vacio">
        <p class="carrito-vacio__icono">🛒</p>
        <h2>Tu carrito está vacío</h2>
        <p>¿No sabes qué comprar? Te tenemos cubierto.</p>
        <a href="productos.html" class="boton boton-primario">Ver catálogo</a>
      </div>`;
    return;
  }

  // Tabla de ítems
  const filasHTML = carrito.items.map(item => `
    <tr data-id="${item.producto.id}">
      <td class="td-producto">
        <img src="${item.producto.imagen}" alt="${item.producto.nombre}"
             class="cart-img" onerror="this.style.display='none'">
        <div>
          <strong>${item.producto.nombre}</strong>
          <small class="td-sku">${item.producto.sku}</small>
        </div>
      </td>
      <td class="td-precio">${formatearPrecio(item.producto.precio)}</td>
      <td class="td-cantidad">
        <div class="cantidad-control">
          <button class="btn-cantidad" data-accion="restar" data-id="${item.producto.id}">−</button>
          <input type="number" class="cantidad-input" value="${item.cantidad}"
                 min="1" max="99" data-id="${item.producto.id}">
          <button class="btn-cantidad" data-accion="sumar" data-id="${item.producto.id}">+</button>
        </div>
      </td>
      <td class="td-subtotal">${formatearPrecio(item.subtotal)}</td>
      <td class="td-eliminar">
        <button class="btn-eliminar-item" data-id="${item.producto.id}"
                aria-label="Eliminar ${item.producto.nombre}">✕</button>
      </td>
    </tr>`).join('');

  // Dashboard de estadísticas
  const masCaroP = carrito.productoMasCaro;
  const dashHTML = `
    <div class="dashboard-carrito">
      <div class="stat">
        <span class="stat__valor">${carrito.cantidadItems}</span>
        <span class="stat__label">artículos</span>
      </div>
      <div class="stat">
        <span class="stat__valor">${carrito.categorias.length}</span>
        <span class="stat__label">categorías</span>
      </div>
      <div class="stat">
        <span class="stat__valor">${formatearPrecio(carrito.subtotal)}</span>
        <span class="stat__label">subtotal</span>
      </div>
      <div class="stat stat--destacado">
        <span class="stat__label">Producto más caro</span>
        <span class="stat__valor stat__valor--sm">${masCaroP?.nombre ?? '—'}</span>
      </div>
    </div>`;

  contenedor.innerHTML = `
    ${dashHTML}
    <table class="tabla-carrito tabla-carrito--interactiva">
      <caption>Productos en tu carrito</caption>
      <thead>
        <tr>
          <th scope="col">Producto</th>
          <th scope="col">Precio</th>
          <th scope="col">Cantidad</th>
          <th scope="col">Subtotal</th>
          <th scope="col"><span class="sr-only">Eliminar</span></th>
        </tr>
      </thead>
      <tbody>${filasHTML}</tbody>
    </table>

    <div class="carrito-resumen">
      <div class="resumen-linea"><span>Subtotal:</span><span id="res-subtotal"></span></div>
      <div class="resumen-linea"><span>IVA (18%):</span><span id="res-iva"></span></div>
      <div class="resumen-linea resumen-linea--total">
        <span>Total:</span><span id="res-total"></span>
      </div>
    </div>

    <div class="carrito-acciones">
      <button type="button" id="btn-vaciar" class="boton boton-texto">Vaciar carrito</button>
      <button type="button" id="btn-checkout" class="boton boton-primario">
        <i class="fa-solid fa-lock" aria-hidden="true"></i> Finalizar compra
      </button>
    </div>`;

  // Actualizar totales
  actualizarTotalesCarrito();

  // Eventos: cantidad (input y botones)
  contenedor.querySelectorAll('.cantidad-input').forEach(inp => {
    inp.addEventListener('change', () => {
      carrito.actualizarCantidad(inp.dataset.id, inp.value);
    });
  });
  contenedor.querySelectorAll('.btn-cantidad').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = carrito.items.find(i => i.producto.id === Number(btn.dataset.id));
      if (!item) return;
      const nuevaCantidad = item.cantidad + (btn.dataset.accion === 'sumar' ? 1 : -1);
      carrito.actualizarCantidad(btn.dataset.id, nuevaCantidad);
    });
  });

  // Eliminar ítem
  contenedor.querySelectorAll('.btn-eliminar-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const nombre = carrito.items.find(i => i.producto.id === Number(btn.dataset.id))?.producto.nombre;
      carrito.eliminar(btn.dataset.id);
      if (nombre) mostrarNotificacion(`"${nombre}" eliminado del carrito.`, 'info');
    });
  });

  // Vaciar
  document.getElementById('btn-vaciar')?.addEventListener('click', () => {
    if (confirm('¿Seguro que quieres vaciar el carrito?')) {
      carrito.vaciar();
      mostrarNotificacion('Carrito vaciado.', 'info');
    }
  });

  // Checkout
  document.getElementById('btn-checkout')?.addEventListener('click', iniciarCheckout);

  // Historial
  renderizarHistorial();
}

function actualizarTotalesCarrito() {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatearPrecio(val);
  };
  set('res-subtotal', carrito.subtotal);
  set('res-iva',      carrito.impuestos);
  set('res-total',    carrito.total);
}

async function iniciarCheckout() {
  const btn = document.getElementById('btn-checkout');
  if (btn) { btn.disabled = true; btn.textContent = 'Procesando…'; }

  try {
    const orden = await carrito.simularCompra();
    mostrarConfirmacionCompra(orden);
  } catch (err) {
    mostrarNotificacion(err.message || 'Error al procesar la compra.', 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Finalizar compra'; }
  }
}

function mostrarConfirmacionCompra(orden) {
  const contenedor = document.getElementById('contenedor-carrito');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="compra-exitosa">
      <div class="compra-exitosa__check">✓</div>
      <h2>¡Compra realizada!</h2>
      <p>Número de orden: <strong class="num-orden">${orden.id}</strong></p>
      <p>Total cobrado: <strong>${formatearPrecio(orden.total)}</strong></p>
      <p class="compra-exitosa__info">
        Recibirás un correo de confirmación en las próximas horas.
      </p>
      <div class="compra-exitosa__acciones">
        <a href="index.html" class="boton boton-primario">Seguir comprando</a>
        <button type="button" id="btn-ver-historial"
                class="boton boton-texto">Ver mis pedidos</button>
      </div>
    </div>`;

  document.getElementById('btn-ver-historial')?.addEventListener('click', () => {
    document.getElementById('seccion-historial')?.scrollIntoView({ behavior: 'smooth' });
  });

  renderizarHistorial();
}

function renderizarHistorial() {
  const contenedor = document.getElementById('seccion-historial');
  if (!contenedor) return;

  const historial = obtenerHistorial();
  if (historial.length === 0) {
    contenedor.innerHTML = '<p class="sin-historial">Sin órdenes anteriores.</p>';
    return;
  }

  const filasHTML = historial.map(orden => `
    <tr>
      <td><strong>${orden.id}</strong></td>
      <td>${new Date(orden.fecha).toLocaleDateString('es-DO')}</td>
      <td>${orden.items.length} artículo(s)</td>
      <td>${formatearPrecio(orden.total)}</td>
    </tr>`).join('');

  contenedor.innerHTML = `
    <h2>Historial de compras</h2>
    <table class="tabla-carrito">
      <thead><tr>
        <th>Orden</th><th>Fecha</th><th>Artículos</th><th>Total</th>
      </tr></thead>
      <tbody>${filasHTML}</tbody>
    </table>
    <button class="boton boton-texto" id="btn-limpiar-historial">Limpiar historial</button>`;

  document.getElementById('btn-limpiar-historial')?.addEventListener('click', () => {
    limpiarHistorial();
    renderizarHistorial();
  });
}

/* ============================================================
   PÁGINA CONTACTO
   ============================================================ */
function inicializarContacto() {
  inicializarFormularioContacto();
}

/* ============================================================
   PÁGINA ACERCA DE
   ============================================================ */
function inicializarAcerca() {
  // Easter Egg: secuencia de teclas "TSO" revela la sección de laboratorio
  let secuencia = '';
  const CODIGO = 'tso';
  const labPanel = document.getElementById('panel-laboratorio');

  document.addEventListener('keydown', (e) => {
    secuencia = (secuencia + e.key.toLowerCase()).slice(-CODIGO.length);
    if (secuencia === CODIGO && labPanel) {
      labPanel.classList.toggle('panel-lab--visible');
      mostrarNotificacion(
        labPanel.classList.contains('panel-lab--visible')
          ? '🔬 Modo desarrollador activado'
          : '🔒 Modo desarrollador desactivado',
        'info',
        2500
      );
    }
  });

  // Botón oculto en el footer del acerca (un pequeño "</>" clickeable)
  document.getElementById('btn-lab-toggle')?.addEventListener('click', () => {
    labPanel?.classList.toggle('panel-lab--visible');
  });

  // Reloj en tiempo real para demostrar setInterval
  const reloj = document.getElementById('reloj-acerca');
  if (reloj) {
    const actualizarReloj = () => {
      reloj.textContent = new Date().toLocaleTimeString('es-DO');
    };
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
  }
}
