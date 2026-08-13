/**
 * productos.js
 * Renderizado de tarjetas, filtros, búsqueda y detalle de producto.
 */

import { formatearPrecio, renderizarEstrellas, mostrarNotificacion } from './utilidades.js';
import { carrito, Producto, actualizarBadgeCarrito } from './carrito.js';

/* ============================================================
   IMAGEN CON PLACEHOLDER
   ============================================================ */
function crearImagen(src, alt, claseExtra = '') {
  const wrapper = document.createElement('div');
  wrapper.className = `producto-media${claseExtra ? ' ' + claseExtra : ''}`;

  const placeholder = document.createElement('div');
  placeholder.className = 'img-placeholder';
  placeholder.innerHTML = `
    <span class="img-placeholder__icono" aria-hidden="true">📷</span>
    <span class="img-placeholder__texto">Imagen próximamente</span>
  `;

  const img = document.createElement('img');
  img.alt = alt;
  img.loading = 'lazy';
  img.src = src;
  img.className = 'producto-img';
  img.onerror = function () {
    this.style.display = 'none';
    wrapper.classList.add('sin-imagen');
  };
  img.onload = function () {
    wrapper.classList.remove('sin-imagen');
  };

  wrapper.appendChild(placeholder);
  wrapper.appendChild(img);
  return wrapper;
}

/* ============================================================
   TARJETA DE PRODUCTO
   ============================================================ */
export function renderizarTarjeta(producto, opciones = {}) {
  const { estaEnCarrito = false, mostrarDetalle = true } = opciones;

  const art = document.createElement('article');
  art.className = 'producto';
  art.dataset.id = producto.id;
  art.dataset.categoria = producto.categoria;

  // Badges
  const badges = [];
  if (producto.oferta && producto.descuento > 0) {
    badges.push(`<span class="etiqueta-oferta">-${producto.descuento}%</span>`);
  }
  if (producto.nuevo) {
    badges.push(`<span class="etiqueta-nuevo">NUEVO</span>`);
  }
  if (producto.stock > 0 && producto.stock <= 3) {
    badges.push(`<span class="etiqueta-stock">¡Solo ${producto.stock}!</span>`);
  }

  // Imagen
  const mediaDiv = crearImagen(producto.imagen, producto.nombre);
  if (badges.length) {
    const badgesContainer = document.createElement('div');
    badgesContainer.className = 'badges-contenedor';
    badgesContainer.innerHTML = badges.join('');
    mediaDiv.appendChild(badgesContainer);
  }

  // Precio
  const precioHTML = producto.tieneDescuento
    ? `<del class="precio-original">${formatearPrecio(producto.precioOriginal)}</del>
       <ins class="precio-actual">${formatearPrecio(producto.precio)}</ins>`
    : `<span class="precio-actual">${formatearPrecio(producto.precio)}</span>`;

  // Rating
  const estrellas = renderizarEstrellas(producto.rating);

  // Disponibilidad
  const dispClase = producto.disponible ? 'disp--ok' : 'disp--no';
  const dispTexto = producto.disponible ? 'En stock' : 'Agotado';

  // Botón carrito
  const yaEnCarrito = estaEnCarrito || carrito.tieneProducto(producto.id);
  const btnTexto = yaEnCarrito ? '✓ En el carrito' : 'Agregar al carrito';
  const btnClase = yaEnCarrito ? 'boton boton-secundario btn-agregar--activo' : 'boton boton-primario';

  art.innerHTML = `
    <header class="producto__header">
      <h3 class="producto__nombre">${producto.nombre}</h3>
      <span class="producto__marca">${producto.marca}</span>
    </header>
  `;
  art.appendChild(mediaDiv);
  art.insertAdjacentHTML('beforeend', `
    <div class="producto__cuerpo">
      <p class="producto__desc">${producto.descripcionCorta}</p>
      <div class="producto__rating" aria-label="Rating: ${producto.rating} de 5">
        <span class="estrellas">${estrellas}</span>
        <small class="reviews">(${producto.reviews} reseñas)</small>
      </div>
      <p class="producto-precio">${precioHTML}</p>
      <p class="producto-disponibilidad ${dispClase}">
        <i aria-hidden="true"></i> ${dispTexto}
      </p>
    </div>
    <footer class="producto__footer">
      ${mostrarDetalle
        ? `<a href="producto.html?id=${producto.id}" class="boton boton-texto btn-detalle">Ver detalle →</a>`
        : ''}
      <button
        type="button"
        class="${btnClase} btn-agregar"
        data-id="${producto.id}"
        ${!producto.disponible ? 'disabled' : ''}
        aria-label="Agregar ${producto.nombre} al carrito">
        ${btnTexto}
      </button>
    </footer>
  `);

  // Evento agregar al carrito
  const btnAgregar = art.querySelector('.btn-agregar');
  btnAgregar?.addEventListener('click', () => {
    carrito.agregar(producto);
    btnAgregar.textContent = '✓ En el carrito';
    btnAgregar.classList.replace('boton-primario', 'boton-secundario');
    btnAgregar.classList.add('btn-agregar--activo');
    actualizarBadgeCarrito();
    mostrarNotificacion(`"${producto.nombre}" agregado al carrito.`, 'exito');
  });

  return art;
}

/* ============================================================
   RENDERIZAR GRILLA
   ============================================================ */
export function renderizarGrilla(lista, contenedorId, opciones = {}) {
  const contenedor = typeof contenedorId === 'string'
    ? document.getElementById(contenedorId)
    : contenedorId;

  if (!contenedor) return;

  contenedor.innerHTML = '';

  if (!lista || lista.length === 0) {
    contenedor.innerHTML = `
      <div class="sin-resultados">
        <p>🔍 No se encontraron productos con esos criterios.</p>
        <button class="boton boton-texto" onclick="location.reload()">Limpiar filtros</button>
      </div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  lista.forEach(p => frag.appendChild(renderizarTarjeta(p, opciones)));
  contenedor.appendChild(frag);
}

/* ============================================================
   FILTRAR PRODUCTOS
   ============================================================ */
export function filtrarProductos(todos, filtros = {}) {
  let lista = [...todos];

  const { categoria, marca, precioMin, precioMax, disponible, oferta, nuevo, colores, q } = filtros;

  if (q) {
    const query = q.toLowerCase();
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(query) ||
      p.marca.toLowerCase().includes(query)  ||
      p.categoria.toLowerCase().includes(query) ||
      p.etiquetas.some(e => e.toLowerCase().includes(query)) ||
      p.descripcionCorta.toLowerCase().includes(query)
    );
  }

  if (categoria && categoria !== 'todos') {
    lista = lista.filter(p => p.categoria === categoria);
  }

  if (marca && marca !== 'todas') {
    lista = lista.filter(p => p.marca.toLowerCase() === marca.toLowerCase());
  }

  if (precioMin !== undefined && precioMin !== '') {
    lista = lista.filter(p => p.precio >= Number(precioMin));
  }
  if (precioMax !== undefined && precioMax !== '') {
    lista = lista.filter(p => p.precio <= Number(precioMax));
  }

  if (disponible === true || disponible === 'true') {
    lista = lista.filter(p => p.disponible);
  }
  if (oferta === true || oferta === 'true') {
    lista = lista.filter(p => p.oferta);
  }
  if (nuevo === true || nuevo === 'true') {
    lista = lista.filter(p => p.nuevo);
  }
  if (colores && colores.length > 0) {
    lista = lista.filter(p =>
      p.colores.some(c => colores.map(x => x.toLowerCase()).includes(c.toLowerCase()))
    );
  }

  return lista;
}

/* ============================================================
   ORDENAR PRODUCTOS
   ============================================================ */
export function ordenarProductos(lista, criterio = 'relevancia') {
  const copia = [...lista];
  switch (criterio) {
    case 'precio-asc':   return copia.sort((a, b) => a.precio - b.precio);
    case 'precio-desc':  return copia.sort((a, b) => b.precio - a.precio);
    case 'rating':       return copia.sort((a, b) => b.rating - a.rating);
    case 'nuevo':        return copia.sort((a, b) => b.nuevo - a.nuevo);
    case 'nombre':       return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    case 'descuento':    return copia.sort((a, b) => b.descuento - a.descuento);
    default:             return copia.sort((a, b) => b.destacado - a.destacado);
  }
}

/* ============================================================
   DETALLE DE PRODUCTO (producto.html?id=X)
   ============================================================ */
export function renderizarDetalleProducto(producto, contenedorId) {
  const contenedor = document.getElementById(contenedorId);
  if (!contenedor) return;

  const precioHTML = producto.tieneDescuento
    ? `<del class="precio-original">${formatearPrecio(producto.precioOriginal)}</del>
       <ins class="precio-actual">${formatearPrecio(producto.precio)}</ins>
       <span class="precio-ahorro">Ahorras ${formatearPrecio(producto.ahorro)}</span>`
    : `<span class="precio-actual">${formatearPrecio(producto.precio)}</span>`;

  const caracteristicasHTML = Object.entries(producto.caracteristicas)
    .map(([k, v]) => `<tr><th scope="row">${k}</th><td>${v}</td></tr>`)
    .join('');

  const coloresHTML = producto.colores.map(c =>
    `<span class="color-chip color-chip--${c.replace(/[^a-z]/gi, '').toLowerCase()}"
           title="${c}">${c}</span>`
  ).join('');

  const yaEnCarrito = carrito.tieneProducto(producto.id);

  contenedor.innerHTML = `
    <header class="ficha__header">
      <div class="ficha__breadcrumb">
        <a href="index.html">Inicio</a> ›
        <a href="productos.html?categoria=${producto.categoria}">${producto.categoria}</a> ›
        <span>${producto.nombre}</span>
      </div>
      <h1 class="ficha__titulo">${producto.nombre}</h1>
      <p class="ficha__sku">SKU: <code>${producto.sku}</code> · ${producto.marca}</p>
      <div class="ficha__rating" aria-label="Rating ${producto.rating} de 5">
        ${renderizarEstrellas(producto.rating)}
        <small>(${producto.reviews} reseñas)</small>
      </div>
    </header>

    <div class="ficha__cuerpo">
      <div class="ficha__galeria" id="ficha-galeria">
        ${crearImagen(producto.imagen, producto.nombre, 'ficha__img').outerHTML}
      </div>

      <div class="ficha__info">
        <div class="ficha__precios">${precioHTML}</div>
        <p class="ficha__desc">${producto.descripcion}</p>

        ${coloresHTML ? `<div class="ficha__colores"><strong>Colores:</strong> ${coloresHTML}</div>` : ''}

        <div class="ficha__disponibilidad ${producto.disponible ? 'disp--ok' : 'disp--no'}">
          ${producto.disponible
            ? `✓ En stock (${producto.stock} disponibles)`
            : '✕ Agotado'}
        </div>

        <div class="ficha__acciones">
          <div class="ficha__cantidad">
            <label for="ficha-cantidad">Cantidad:</label>
            <div class="cantidad-control">
              <button type="button" class="btn-cantidad" data-accion="restar">−</button>
              <input type="number" id="ficha-cantidad" value="1" min="1"
                     max="${producto.stock || 99}" class="cantidad-input">
              <button type="button" class="btn-cantidad" data-accion="sumar">+</button>
            </div>
          </div>
          <button
            type="button"
            class="boton boton-primario btn-agregar-ficha"
            data-id="${producto.id}"
            ${!producto.disponible ? 'disabled' : ''}>
            ${yaEnCarrito ? '✓ En el carrito' : 'Agregar al carrito'}
          </button>
          <a href="carrito.html" class="boton boton-secundario">Ver carrito</a>
        </div>
      </div>
    </div>

    <section class="ficha__tabla" aria-labelledby="titulo-especificaciones">
      <h2 id="titulo-especificaciones">Especificaciones técnicas</h2>
      <table class="tabla-carrito">
        <caption>Características de ${producto.nombre}</caption>
        <thead><tr><th scope="col">Especificación</th><th scope="col">Detalle</th></tr></thead>
        <tbody>${caracteristicasHTML}</tbody>
      </table>
    </section>
  `;

  // Reconstruir la imagen real (crearImagen devuelve un elemento, no HTML)
  const galeriaEl = document.getElementById('ficha-galeria');
  if (galeriaEl) {
    galeriaEl.innerHTML = '';
    galeriaEl.appendChild(crearImagen(producto.imagen, producto.nombre));
  }

  // Control de cantidad
  const inputCantidad = contenedor.querySelector('.cantidad-input');
  contenedor.querySelectorAll('.btn-cantidad').forEach(btn => {
    btn.addEventListener('click', () => {
      let val = parseInt(inputCantidad.value, 10) || 1;
      val += btn.dataset.accion === 'sumar' ? 1 : -1;
      val = Math.max(1, Math.min(val, producto.stock || 99));
      inputCantidad.value = val;
    });
  });

  // Agregar al carrito
  const btnAgregar = contenedor.querySelector('.btn-agregar-ficha');
  btnAgregar?.addEventListener('click', () => {
    const cantidad = parseInt(inputCantidad?.value, 10) || 1;
    carrito.agregar(producto, cantidad);
    btnAgregar.textContent = '✓ En el carrito';
    btnAgregar.classList.replace('boton-primario', 'boton-secundario');
    actualizarBadgeCarrito();
    mostrarNotificacion(`"${producto.nombre}" (×${cantidad}) agregado al carrito.`, 'exito');
  });
}
