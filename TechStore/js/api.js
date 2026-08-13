/**
 * api.js
 * Carga de datos: archivo JSON local y API REST externa (Fake Store API).
 * Demuestra: fetch, async/await, try/catch/finally, manejo de errores.
 */

import { Producto } from './carrito.js';

const URL_JSON_LOCAL   = './data/productos.json';
const URL_API_EXTERNA  = 'https://fakestoreapi.com/products?limit=4';

/* ============================================================
   CARGA DESDE JSON LOCAL
   ============================================================ */
export async function cargarProductosJSON() {
  try {
    const respuesta = await fetch(URL_JSON_LOCAL);

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}: no se pudo cargar productos.json`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new TypeError('El archivo productos.json no contiene un arreglo válido.');
    }

    return datos.map(d => new Producto(d));
  } catch (error) {
    console.error('[API] Error cargando JSON local:', error);
    throw error; // re-lanza para que el llamador decida qué mostrar
  } finally {
    // finally siempre se ejecuta (para registro o limpieza)
    console.info('[API] Intento de carga de JSON local finalizado.');
  }
}

/* ============================================================
   CARGA DESDE FAKE STORE API (productos de relleno tecnológico)
   ============================================================ */
export async function cargarProductosAPI() {
  try {
    const respuesta = await fetch(URL_API_EXTERNA);

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}: la API externa no respondió.`);
    }

    const datos = await respuesta.json();

    // Adaptar el formato de Fake Store API al nuestro
    return datos
      .filter(p => p.category === 'electronics')
      .map((p, idx) => new Producto({
        id:               2000 + idx,
        nombre:           p.title.length > 50 ? p.title.slice(0, 50) + '…' : p.title,
        descripcionCorta: p.category.toUpperCase() + ' · API externa',
        descripcion:      p.description,
        precio:           Math.round(p.price),
        precioOriginal:   Math.round(p.price),
        descuento:        0,
        categoria:        'accesorios',
        marca:            'Externo',
        sku:              `API-${p.id}`,
        imagen:           p.image,
        disponible:       true,
        stock:            Math.floor(p.rating?.count / 10) || 5,
        rating:           Math.round(p.rating?.rate * 10) / 10 || 4,
        reviews:          p.rating?.count || 0,
        nuevo:            false,
        oferta:           false,
        destacado:        false,
        colores:          [],
        etiquetas:        ['trending', p.category],
        caracteristicas:  {},
      }));
  } catch (error) {
    // La API externa puede fallar (CORS, red, etc.); no es crítico
    console.warn('[API] No se pudo cargar la API externa:', error.message);
    return []; // devuelve arreglo vacío sin romper la app
  }
}

/* ============================================================
   BÚSQUEDA EN API (simulada con datos locales)
   ============================================================ */
export async function buscarEnAPI(query, productosTodos) {
  // Simula latencia de red con setTimeout
  await new Promise(r => setTimeout(r, 200));

  const q = query.toLowerCase().trim();
  return productosTodos.filter(p =>
    p.nombre.toLowerCase().includes(q) ||
    p.marca.toLowerCase().includes(q)  ||
    p.categoria.toLowerCase().includes(q) ||
    p.etiquetas.some(e => e.toLowerCase().includes(q))
  );
}
