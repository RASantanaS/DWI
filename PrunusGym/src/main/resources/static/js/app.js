/* PrunusGym — lógica de la SPA (vanilla JS) */
PG.requireAuth();

const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
const pageSub = document.getElementById("pageSub");
const rol = PG.rol();
const email = PG.email();

document.getElementById("userEmail").textContent = email || "";
document.getElementById("userRole").textContent = rol || "";
document.getElementById("logoutBtn").addEventListener("click", () => PG.logout());

/* ---------------- Definición de secciones por rol ---------------- */
const ALL_SECTIONS = [
  { id: "dashboard",   label: "Dashboard",     ico: "◆", roles: ["ADMINISTRADOR", "RECEPCIONISTA", "CLIENTE"], render: renderDashboard },
  { id: "clientes",    label: "Clientes",      ico: "●", roles: ["ADMINISTRADOR", "RECEPCIONISTA"], render: renderClientes },
  { id: "planes",      label: "Planes",        ico: "▣", roles: ["ADMINISTRADOR", "RECEPCIONISTA", "CLIENTE"], render: renderPlanes },
  { id: "membresias",  label: rol === "CLIENTE" ? "Mi Membresía" : "Membresías", ico: "▤", roles: ["ADMINISTRADOR", "RECEPCIONISTA", "CLIENTE"], render: renderMembresias },
  { id: "pagos",       label: rol === "CLIENTE" ? "Mis Pagos" : "Pagos", ico: "$", roles: ["ADMINISTRADOR", "RECEPCIONISTA", "CLIENTE"], render: renderPagos },
  { id: "asistencias", label: rol === "CLIENTE" ? "Mi Asistencia" : "Asistencias", ico: "✓", roles: ["ADMINISTRADOR", "RECEPCIONISTA", "CLIENTE"], render: renderAsistencias },
  { id: "reportes",    label: "Reportes",      ico: "▦", roles: ["ADMINISTRADOR"], render: renderReportes },
  { id: "usuarios",    label: "Usuarios",      ico: "◈", roles: ["ADMINISTRADOR"], render: renderUsuarios },
  { id: "perfil",      label: "Mi Perfil",     ico: "○", roles: ["CLIENTE"], render: renderPerfilCliente },
];

const sections = ALL_SECTIONS.filter(s => s.roles.includes(rol));
const navMenu = document.getElementById("navMenu");
navMenu.innerHTML = sections.map(s =>
  `<button class="nav-item" data-id="${s.id}"><span class="ico">${s.ico}</span>${s.label}</button>`
).join("");

navMenu.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => goTo(btn.dataset.id));
});

function goTo(id) {
  const section = sections.find(s => s.id === id) || sections[0];
  navMenu.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.id === section.id));
  pageTitle.textContent = section.label;
  pageSub.textContent = "";
  content.innerHTML = `<div class="loader">Cargando…</div>`;
  window.location.hash = section.id;
  Promise.resolve(section.render(content)).catch(err => {
    content.innerHTML = `<div class="panel">No se pudo cargar esta sección: ${esc(err.message)}</div>`;
  });
}

window.addEventListener("hashchange", () => {
  const id = window.location.hash.replace("#", "");
  if (id && sections.some(s => s.id === id)) goTo(id);
});

goTo(window.location.hash.replace("#", "") || "dashboard");

/* ---------------- Utilidades de UI ---------------- */
function openDialog({ title, bodyHtml, submitLabel = "Guardar", onSubmit }) {
  const dlg = document.createElement("dialog");
  dlg.innerHTML = `
    <div class="dialog-head"><h3>${esc(title)}</h3><button class="dialog-close" type="button">&times;</button></div>
    <form>
      <div class="dialog-body">${bodyHtml}</div>
      <div class="dialog-foot">
        <button type="button" class="btn btn-outline" data-cancel>Cancelar</button>
        <button type="submit" class="btn btn-primary">${esc(submitLabel)}</button>
      </div>
    </form>`;
  document.body.appendChild(dlg);
  aplicarMascarasFormulario(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  dlg.querySelector(".dialog-close").addEventListener("click", close);
  dlg.querySelector("[data-cancel]").addEventListener("click", close);
  dlg.addEventListener("cancel", close);
  dlg.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = dlg.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await onSubmit(new FormData(e.target), dlg);
      close();
    } catch (err) {
      toast(err.message || "Ocurrió un error.", "err");
    } finally {
      submitBtn.disabled = false;
    }
  });
  dlg.showModal();
  return dlg;
}

function confirmAction(msg) {
  return window.confirm(msg);
}

function renderTable(container, { columns, rows, empty = "Sin registros." }) {
  if (!rows.length) {
    container.innerHTML = `<div class="table-wrap"><table><thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}</tr></thead>
      <tbody><tr class="empty-row"><td colspan="${columns.length}">${esc(empty)}</td></tr></tbody></table></div>`;
    return;
  }
  container.innerHTML = `<div class="table-wrap"><table>
    <thead><tr>${columns.map(c => `<th>${esc(c.label)}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r => `<tr>${columns.map(c => `<td>${c.render ? c.render(r) : esc(r[c.key])}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

/* ================= DASHBOARD ================= */
async function renderDashboard(el) {
  const data = await PG.get("/api/dashboard");
  pageSub.textContent = rol === "CLIENTE" ? "Tu resumen personal." : "Indicadores generales del gimnasio.";

  if (rol === "CLIENTE") {
    const m = data.membresiaActual;
    el.innerHTML = `
      <div class="panel">
        <div class="profile-header">
          <div class="profile-avatar">${esc((data.nombreCliente || "?").charAt(0))}</div>
          <div>
            <h2 style="margin-bottom:2px;">${esc(data.nombreCliente)}</h2>
            <div class="tag-line" style="margin:0;">Código ${esc(data.codigoCliente)}</div>
          </div>
        </div>
      </div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-head"><h2>Membresía actual</h2></div>
          ${m ? `
            <ul class="mini-list">
              <li><span>Plan</span><b>${esc(m.nombrePlan)}</b></li>
              <li><span>Vigencia</span><span>${fmtDate(m.fechaInicio)} → ${fmtDate(m.fechaFin)}</span></li>
              <li><span>Estado</span>${estadoBadge(m.estado)}</li>
            </ul>` : `<p class="tag-line">Aún no tienes una membresía. Ve a <b>Planes</b> para adquirir una.</p>`}
        </div>
        <div class="panel">
          <div class="panel-head"><h2>Últimas asistencias</h2></div>
          <ul class="mini-list">
            ${(data.asistencias || []).slice(-5).reverse().map(a => `<li><span>Ingreso</span><span>${fmtDateTime(a.fechaHora)}</span></li>`).join("") || "<li>Sin asistencias registradas.</li>"}
          </ul>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Historial de pagos</h2></div>
        <div id="pagosMiniTable"></div>
      </div>`;
    renderTable(document.getElementById("pagosMiniTable"), {
      columns: [
        { label: "Fecha", render: r => fmtDateTime(r.fechaPago) },
        { label: "Monto", render: r => fmtMoney(r.monto) },
        { label: "Método", key: "metodoPago" },
        { label: "Estado", render: r => `<span class="badge ${r.estado === "COMPLETADO" ? "badge-green" : "badge-red"}">${esc(r.estado)}</span>` },
      ],
      rows: data.pagos || [],
      empty: "Aún no registras pagos."
    });
    return;
  }

  const kpis = [
    { label: "Clientes activos", value: data.totalClientesActivos, cls: "" },
    { label: "Membresías activas", value: data.membresiasActivas, cls: "accent" },
    { label: "Próximas a vencer", value: data.membresiasProximasAVencer, cls: "" },
    { label: "Vencidas", value: data.membresiasVencidas, cls: "" },
    { label: "Asistencias hoy", value: data.asistenciasHoy, cls: "accent" },
  ];
  if (rol === "ADMINISTRADOR") kpis.push({ label: "Ingresos del mes", value: fmtMoney(data.ingresosMes), cls: "money" });

  el.innerHTML = `
    <div class="kpi-grid">
      ${kpis.map(k => `<div class="kpi ${k.cls}"><div class="label">${esc(k.label)}</div><div class="value">${k.value}</div></div>`).join("")}
    </div>
    <div class="two-col">
      <div class="panel">
        <div class="panel-head"><h2>Alertas — próximas a vencer</h2></div>
        <div id="alertasProximas"></div>
      </div>
      <div class="panel">
        <div class="panel-head"><h2>Alertas — vencidas</h2></div>
        <div id="alertasVencidas"></div>
      </div>
    </div>`;

  const cols = [
    { label: "Cliente", render: r => `${esc(r.nombreCliente)} <span class="tag-line" style="margin:0;">(${esc(r.codigoCliente)})</span>` },
    { label: "Plan", key: "nombrePlan" },
    { label: "Vence", render: r => fmtDate(r.fechaFin) },
    { label: "Teléfono", key: "telefonoCliente" },
  ];
  renderTable(document.getElementById("alertasProximas"), { columns: cols, rows: data.alertasProximasAVencer || [], empty: "Nada próximo a vencer." });
  renderTable(document.getElementById("alertasVencidas"), { columns: cols, rows: data.alertasVencidas || [], empty: "No hay membresías vencidas." });
}

/* ================= CLIENTES ================= */
async function renderClientes(el) {
  pageSub.textContent = "Gestión de clientes registrados.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>Clientes</h2>
        <div class="actions">
          <button class="btn btn-primary btn-sm" id="btnNuevoCliente">+ Nuevo cliente</button>
        </div>
      </div>
      <div class="filters">
        <div class="field"><label>Buscar por nombre</label><input id="fNombre" placeholder="Ej: Ana Gómez"></div>
        <div class="field"><label>Buscar por documento</label><input id="fDocumento" placeholder="Ej: 001-1234567-8"></div>
        <div class="field"><label>Estado</label>
          <select id="fEstado"><option value="activos">Activos</option><option value="inactivos">Inactivos</option><option value="todos">Todos</option></select>
        </div>
        <button class="btn btn-outline btn-sm" id="btnFiltrar">Filtrar</button>
      </div>
      <div id="clientesTabla"></div>
    </div>`;

  async function cargar() {
    const nombre = document.getElementById("fNombre").value.trim();
    const documento = document.getElementById("fDocumento").value.trim();
    const estado = document.getElementById("fEstado").value;
    let data;
    if (nombre || documento) {
      data = await PG.get("/api/clientes/buscar", { nombre, documento });
    } else if (estado === "activos") data = await PG.get("/api/clientes/activos");
    else if (estado === "inactivos") data = await PG.get("/api/clientes/inactivos");
    else data = await PG.get("/api/clientes");

    renderTable(document.getElementById("clientesTabla"), {
      columns: [
        { label: "Código", key: "codigo" },
        { label: "Nombre", render: r => `${esc(r.nombre)} ${esc(r.apellido)}` },
        { label: "Documento", key: "documento" },
        { label: "Teléfono", key: "telefono" },
        { label: "Estado", render: r => `<span class="badge ${r.activo ? "badge-green" : "badge-gray"}">${r.activo ? "Activo" : "Inactivo"}</span>` },
        { label: "", render: r => `
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" data-perfil="${r.idCliente}">Ver 360°</button>
              <button class="btn btn-outline btn-sm" data-editar="${r.idCliente}">Editar</button>
              ${r.activo ? `<button class="btn btn-danger btn-sm" data-baja="${r.idCliente}">Dar de baja</button>` : `<button class="btn btn-outline btn-sm" data-reactivar="${r.idCliente}">Reactivar</button>`}
            </div>` }
      ],
      rows: data,
      empty: "No se encontraron clientes."
    });

    document.querySelectorAll("[data-perfil]").forEach(b => b.addEventListener("click", () => mostrarPerfil360(b.dataset.perfil)));
    document.querySelectorAll("[data-editar]").forEach(b => b.addEventListener("click", () => editarCliente(data.find(c => String(c.idCliente) === b.dataset.editar))));
    document.querySelectorAll("[data-baja]").forEach(b => b.addEventListener("click", async () => {
      if (!confirmAction("¿Dar de baja a este cliente? Su historial se conserva.")) return;
      try { await PG.del(`/api/clientes/${b.dataset.baja}`); toast("Cliente dado de baja."); cargar(); }
      catch (e) { toast(e.message, "err"); }
    }));
    document.querySelectorAll("[data-reactivar]").forEach(b => b.addEventListener("click", async () => {
      try { await PG.put(`/api/clientes/${b.dataset.reactivar}/reactivar`); toast("Cliente reactivado."); cargar(); }
      catch (e) { toast(e.message, "err"); }
    }));
  }

  document.getElementById("btnFiltrar").addEventListener("click", cargar);
  document.getElementById("btnNuevoCliente").addEventListener("click", () => crearCliente(cargar));
  await cargar();
}

function crearCliente(onDone) {
  openDialog({
    title: "Nuevo cliente",
    submitLabel: "Registrar",
    bodyHtml: `
      <div class="form-grid">
        <div class="field"><label>Nombre</label><input name="nombre" required></div>
        <div class="field"><label>Apellido</label><input name="apellido" required></div>
        <div class="field"><label>Documento</label><input name="documento" required></div>
        <div class="field"><label>Teléfono</label><input name="telefono"></div>
        <div class="field full"><label>Correo (acceso del cliente)</label><input type="email" name="email" required></div>
        <div class="field full"><label>Contraseña inicial (mín. 8)</label><input type="password" name="password" minlength="8" required></div>
      </div>`,
    onSubmit: async (fd) => {
      const body = Object.fromEntries(fd.entries());
      await PG.post("/api/clientes", body);
      toast("Cliente registrado.");
      onDone();
    }
  });
}

function editarCliente(cliente, onDoneOuter) {
  if (!cliente) return;
  openDialog({
    title: "Editar cliente",
    submitLabel: "Guardar cambios",
    bodyHtml: `
      <div class="form-grid">
        <div class="field"><label>Nombre</label><input name="nombre" value="${esc(cliente.nombre)}" required></div>
        <div class="field"><label>Apellido</label><input name="apellido" value="${esc(cliente.apellido)}" required></div>
        <div class="field"><label>Documento</label><input name="documento" value="${esc(cliente.documento)}" required></div>
        <div class="field"><label>Teléfono</label><input name="telefono" value="${esc(cliente.telefono || "")}"></div>
      </div>`,
    onSubmit: async (fd) => {
      const body = Object.fromEntries(fd.entries());
      await PG.put(`/api/clientes/${cliente.idCliente}`, body);
      toast("Cliente actualizado.");
      goTo("clientes");
    }
  });
}

async function mostrarPerfil360(idCliente) {
  const dlg = document.createElement("dialog");
  dlg.style.width = "min(640px,94vw)";
  dlg.innerHTML = `<div class="dialog-head"><h3>Perfil 360°</h3><button class="dialog-close" type="button">&times;</button></div>
    <div class="dialog-body"><div class="loader">Cargando…</div></div>`;
  document.body.appendChild(dlg);
  const close = () => { dlg.close(); dlg.remove(); };
  dlg.querySelector(".dialog-close").addEventListener("click", close);
  dlg.addEventListener("cancel", close);
  dlg.showModal();

  try {
    const [cliente, membresias, asistencias] = await Promise.all([
      PG.get(`/api/clientes/${idCliente}`),
      PG.get(`/api/membresias/cliente/${idCliente}`),
      PG.get(`/api/asistencias/cliente/${idCliente}`)
    ]);
    let pagos = [];
    for (const m of membresias) {
      const p = await PG.get(`/api/pagos/membresia/${m.idMembresia}`);
      pagos = pagos.concat(p);
    }
    const body = dlg.querySelector(".dialog-body");
    body.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${esc(cliente.nombre.charAt(0))}</div>
        <div>
          <h2 style="margin-bottom:2px;">${esc(cliente.nombre)} ${esc(cliente.apellido)}</h2>
          <div class="tag-line" style="margin:0;">Código ${esc(cliente.codigo)} · Doc. ${esc(cliente.documento)} · ${esc(cliente.telefono || "sin teléfono")}</div>
        </div>
      </div>
      <h3 style="font-size:.9rem;margin:16px 0 6px;">Membresías (${membresias.length})</h3>
      <ul class="mini-list">${membresias.map(m => `<li><span>${esc(m.plan.nombre)} · ${fmtDate(m.fechaInicio)} → ${fmtDate(m.fechaFin)}</span>${estadoBadge(m.estado)}</li>`).join("") || "<li>Sin membresías.</li>"}</ul>
      <h3 style="font-size:.9rem;margin:16px 0 6px;">Pagos (${pagos.length})</h3>
      <ul class="mini-list">${pagos.map(p => `<li><span>${fmtDateTime(p.fechaPago)} · ${esc(p.metodoPago)}</span><b>${fmtMoney(p.monto)}</b></li>`).join("") || "<li>Sin pagos.</li>"}</ul>
      <h3 style="font-size:.9rem;margin:16px 0 6px;">Asistencias (${asistencias.length})</h3>
      <ul class="mini-list">${asistencias.slice(-8).reverse().map(a => `<li><span>Ingreso</span><span>${fmtDateTime(a.fechaHora)}</span></li>`).join("") || "<li>Sin asistencias.</li>"}</ul>`;
  } catch (e) {
    dlg.querySelector(".dialog-body").innerHTML = `<p>No se pudo cargar el perfil: ${esc(e.message)}</p>`;
  }
}

/* ================= PLANES ================= */
async function renderPlanes(el) {
  const esAdmin = rol === "ADMINISTRADOR";
  pageSub.textContent = "Catálogo de planes de membresía.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>Planes disponibles</h2>
        ${esAdmin ? `<div class="actions">
          <select id="fEstadoPlan" class="btn-sm" style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;">
            <option value="activos">Activos</option><option value="inactivos">Inactivos</option><option value="todos">Todos</option>
          </select>
          <button class="btn btn-primary btn-sm" id="btnNuevoPlan">+ Nuevo plan</button>
        </div>` : ""}
      </div>
      <div id="planesTabla"></div>
    </div>`;

  async function cargar() {
    let data;
    if (esAdmin) {
      const estado = document.getElementById("fEstadoPlan").value;
      data = estado === "activos" ? await PG.get("/api/planes/activos")
           : estado === "inactivos" ? await PG.get("/api/planes/inactivos")
           : await PG.get("/api/planes");
    } else {
      data = await PG.get("/api/planes/activos");
    }
    const cols = [
      { label: "Plan", key: "nombre" },
      { label: "Precio", render: r => fmtMoney(r.precio) },
      { label: "Duración", render: r => `${r.duracionDias} días` },
    ];
    if (esAdmin) cols.push({ label: "Estado", render: r => `<span class="badge ${r.activo ? "badge-green" : "badge-gray"}">${r.activo ? "Activo" : "Inactivo"}</span>` });
    cols.push({ label: "", render: r => {
      if (esAdmin) return `<div class="row-actions">
          <button class="btn btn-outline btn-sm" data-editar="${r.idPlan}">Editar</button>
          ${r.activo ? `<button class="btn btn-danger btn-sm" data-baja="${r.idPlan}">Desactivar</button>` : `<button class="btn btn-outline btn-sm" data-reactivar="${r.idPlan}">Reactivar</button>`}
        </div>`;
      if (rol === "CLIENTE") return `<button class="btn btn-primary btn-sm" data-adquirir="${r.idPlan}" data-nombre="${esc(r.nombre)}" data-dias="${r.duracionDias}" data-precio="${r.precio}">Adquirir</button>`;
      return "";
    }});
    renderTable(document.getElementById("planesTabla"), { columns: cols, rows: data, empty: "No hay planes registrados." });

    if (esAdmin) {
      document.querySelectorAll("[data-editar]").forEach(b => b.addEventListener("click", () => editarPlan(data.find(p => String(p.idPlan) === b.dataset.editar), cargar)));
      document.querySelectorAll("[data-baja]").forEach(b => b.addEventListener("click", async () => {
        if (!confirmAction("¿Desactivar este plan? Dejará de ofrecerse para nuevas ventas.")) return;
        try { await PG.del(`/api/planes/${b.dataset.baja}`); toast("Plan desactivado."); cargar(); } catch (e) { toast(e.message, "err"); }
      }));
      document.querySelectorAll("[data-reactivar]").forEach(b => b.addEventListener("click", async () => {
        try { await PG.put(`/api/planes/${b.dataset.reactivar}/reactivar`); toast("Plan reactivado."); cargar(); } catch (e) { toast(e.message, "err"); }
      }));
    }
    if (rol === "CLIENTE") {
      document.querySelectorAll("[data-adquirir]").forEach(b => b.addEventListener("click", () => adquirirPlanCliente(b.dataset)));
    }
  }

  if (esAdmin) {
    document.getElementById("fEstadoPlan").addEventListener("change", cargar);
    document.getElementById("btnNuevoPlan").addEventListener("click", () => crearPlan(cargar));
  }
  await cargar();
}

function crearPlan(onDone) {
  openDialog({
    title: "Nuevo plan",
    bodyHtml: `
      <div class="field"><label>Nombre</label><input name="nombre" required></div>
      <div class="form-grid">
        <div class="field"><label>Precio (RD$)</label><input type="number" step="0.01" min="0.01" name="precio" required></div>
        <div class="field"><label>Duración (días)</label><input type="number" min="1" name="duracionDias" required></div>
      </div>`,
    onSubmit: async (fd) => {
      await PG.post("/api/planes", { nombre: fd.get("nombre"), precio: fd.get("precio"), duracionDias: fd.get("duracionDias") });
      toast("Plan creado.");
      onDone();
    }
  });
}

function editarPlan(plan, onDone) {
  if (!plan) return;
  openDialog({
    title: "Editar plan",
    bodyHtml: `
      <div class="field"><label>Nombre</label><input name="nombre" value="${esc(plan.nombre)}" required></div>
      <div class="form-grid">
        <div class="field"><label>Precio (RD$)</label><input type="number" step="0.01" min="0.01" name="precio" value="${plan.precio}" required></div>
        <div class="field"><label>Duración (días)</label><input type="number" min="1" name="duracionDias" value="${plan.duracionDias}" required></div>
      </div>`,
    onSubmit: async (fd) => {
      await PG.put(`/api/planes/${plan.idPlan}`, { nombre: fd.get("nombre"), precio: fd.get("precio"), duracionDias: fd.get("duracionDias") });
      toast("Plan actualizado.");
      onDone();
    }
  });
}

function adquirirPlanCliente(data) {
  const hoy = new Date();
  const fin = new Date(hoy.getTime() + Number(data.dias) * 86400000);
  const isoFin = fin.toISOString().substring(0, 10);
  const isoInicio = hoy.toISOString().substring(0, 10);
  openDialog({
    title: `Adquirir plan: ${data.nombre}`,
    submitLabel: "Confirmar y pagar",
    bodyHtml: `
      <p class="tag-line">Vigencia: ${isoInicio} → ${isoFin} · Total a pagar: ${fmtMoney(data.precio)}</p>
      <div class="field"><label>Método de pago</label>
        <select name="metodoPago" required>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TARJETA">Tarjeta</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </div>
      <div class="field"><label>Referencia (opcional)</label><input name="referencia" placeholder="Nº de referencia"></div>`,
    onSubmit: async (fd) => {
      const membresia = await PG.post("/api/membresias", {
        idPlan: Number(data.adquirir),
        fechaInicio: isoInicio,
        fechaFin: isoFin
      });
      try {
        await PG.post("/api/pagos", {
          idMembresia: membresia.idMembresia,
          monto: data.precio,
          metodoPago: fd.get("metodoPago"),
          referencia: fd.get("referencia") || null
        });
        toast("Membresía adquirida y pago registrado.");
      } catch (e) {
        toast("Membresía creada, pero el pago fue rechazado: " + e.message, "err");
      }
      goTo("membresias");
    }
  });
}

/* ================= MEMBRESÍAS ================= */
async function renderMembresias(el) {
  const soloLectura = rol === "CLIENTE";
  pageSub.textContent = soloLectura ? "Tu historial de membresías." : "Membresías asignadas a los clientes.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>${soloLectura ? "Mis membresías" : "Membresías"}</h2>
        ${!soloLectura ? `<div class="actions"><button class="btn btn-primary btn-sm" id="btnNuevaMembresia">+ Asignar membresía</button></div>` : ""}
      </div>
      ${!soloLectura ? `<div class="filters">
        <div class="field"><label>Vence desde</label><input type="date" id="fDesde"></div>
        <div class="field"><label>Vence hasta</label><input type="date" id="fHasta"></div>
        <div class="field"><label>Estado</label>
          <select id="fEstadoM"><option value="">Todos</option><option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option><option value="CANCELADA">Cancelada</option><option value="EXPIRADA">Expirada</option><option value="RENOVADA">Renovada</option></select>
        </div>
        <button class="btn btn-outline btn-sm" id="btnFiltrarM">Filtrar</button>
      </div>` : ""}
      <div id="membresiasTabla"></div>
    </div>`;

  async function cargar() {
    let data;
    if (soloLectura) {
      data = await PG.get("/api/membresias/mias");
    } else {
      const fechaInicio = document.getElementById("fDesde").value;
      const fechaFin = document.getElementById("fHasta").value;
      const estado = document.getElementById("fEstadoM").value;
      if (fechaInicio && fechaFin) data = await PG.get("/api/membresias/buscar", { fechaInicio, fechaFin, estado });
      else data = await PG.get("/api/membresias");
    }
    const cols = [];
    if (!soloLectura) cols.push({ label: "Cliente", render: r => `${esc(r.cliente.nombre)} ${esc(r.cliente.apellido)}` });
    const estadosMembresia = ["ACTIVA", "INACTIVA", "CANCELADA", "EXPIRADA", "RENOVADA"];
    cols.push(
      { label: "Plan", render: r => r.plan.nombre },
      { label: "Inicio", render: r => fmtDate(r.fechaInicio) },
      { label: "Vence", render: r => fmtDate(r.fechaFin) },
      { label: "Estado", render: r => soloLectura ? estadoBadge(r.estado) :
          `<select class="btn-sm" style="padding:6px 10px;border:1px solid var(--line);border-radius:6px;" data-cambiar-estado="${r.idMembresia}">${estadosMembresia.map(e => `<option value="${e}" ${e === r.estado ? "selected" : ""}>${e}</option>`).join("")}</select>` }
    );
    if (!soloLectura) cols.push({ label: "", render: r => `
        <div class="row-actions">
          <button class="btn btn-outline btn-sm" data-editar="${r.idMembresia}">Editar</button>
          <button class="btn btn-danger btn-sm" data-borrar="${r.idMembresia}">Eliminar</button>
        </div>` });
    renderTable(document.getElementById("membresiasTabla"), { columns: cols, rows: data, empty: "No hay membresías registradas." });

    if (!soloLectura) {
      document.querySelectorAll("[data-editar]").forEach(b => b.addEventListener("click", () => editarMembresia(data.find(m => String(m.idMembresia) === b.dataset.editar), cargar)));
      document.querySelectorAll("[data-borrar]").forEach(b => b.addEventListener("click", async () => {
        if (!confirmAction("¿Desactivar esta membresía? Su historial (pagos) se conserva.")) return;
        try { await PG.del(`/api/membresias/${b.dataset.borrar}`); toast("Membresía desactivada."); cargar(); } catch (e) { toast(e.message, "err"); }
      }));
      document.querySelectorAll("[data-cambiar-estado]").forEach(s => s.addEventListener("change", async () => {
        try {
          await PG.put(`/api/membresias/${s.dataset.cambiarEstado}/estado?estado=${encodeURIComponent(s.value)}`);
          toast("Estado de la membresía actualizado.");
        } catch (e) { toast(e.message, "err"); cargar(); }
      }));
    }
  }

  if (!soloLectura) {
    document.getElementById("btnFiltrarM").addEventListener("click", cargar);
    document.getElementById("btnNuevaMembresia").addEventListener("click", () => crearMembresia(cargar));
  }
  await cargar();
}

async function crearMembresia(onDone) {
  const [clientes, planes] = await Promise.all([PG.get("/api/clientes/activos"), PG.get("/api/planes/activos")]);
  openDialog({
    title: "Asignar membresía",
    bodyHtml: `
      <div class="field"><label>Cliente</label>
        <select name="idCliente" required>${clientes.map(c => `<option value="${c.idCliente}">${esc(c.codigo)} — ${esc(c.nombre)} ${esc(c.apellido)}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Plan</label>
        <select name="idPlan" required>${planes.map(p => `<option value="${p.idPlan}" data-dias="${p.duracionDias}">${esc(p.nombre)} (${p.duracionDias} días)</option>`).join("")}</select>
      </div>
      <div class="form-grid">
        <div class="field"><label>Fecha inicio</label><input type="date" name="fechaInicio" required value="${new Date().toISOString().substring(0,10)}"></div>
        <div class="field"><label>Fecha fin</label><input type="date" name="fechaFin" required></div>
      </div>`,
    onSubmit: async (fd) => {
      await PG.post("/api/membresias", {
        idCliente: Number(fd.get("idCliente")),
        idPlan: Number(fd.get("idPlan")),
        fechaInicio: fd.get("fechaInicio"),
        fechaFin: fd.get("fechaFin")
      });
      toast("Membresía asignada.");
      onDone();
    }
  });
}

async function editarMembresia(m, onDone) {
  if (!m) return;
  const [clientes, planes] = await Promise.all([PG.get("/api/clientes/activos"), PG.get("/api/planes/activos")]);
  openDialog({
    title: "Editar membresía",
    bodyHtml: `
      <div class="field"><label>Cliente</label>
        <select name="idCliente" required>${clientes.map(c => `<option value="${c.idCliente}" ${c.idCliente===m.cliente.idCliente?"selected":""}>${esc(c.codigo)} — ${esc(c.nombre)} ${esc(c.apellido)}</option>`).join("")}</select>
      </div>
      <div class="field"><label>Plan</label>
        <select name="idPlan" required>${planes.map(p => `<option value="${p.idPlan}" ${p.idPlan===m.plan.idPlan?"selected":""}>${esc(p.nombre)}</option>`).join("")}</select>
      </div>
      <div class="form-grid">
        <div class="field"><label>Fecha inicio</label><input type="date" name="fechaInicio" value="${fmtDate(m.fechaInicio)}" required></div>
        <div class="field"><label>Fecha fin</label><input type="date" name="fechaFin" value="${fmtDate(m.fechaFin)}" required></div>
      </div>`,
    onSubmit: async (fd) => {
      await PG.put(`/api/membresias/${m.idMembresia}`, {
        idCliente: Number(fd.get("idCliente")),
        idPlan: Number(fd.get("idPlan")),
        fechaInicio: fd.get("fechaInicio"),
        fechaFin: fd.get("fechaFin")
      });
      toast("Membresía actualizada.");
      onDone();
    }
  });
}

/* ================= PAGOS ================= */
async function renderPagos(el) {
  const soloLectura = rol === "CLIENTE";
  pageSub.textContent = soloLectura ? "Tu historial de pagos." : "Pagos registrados por membresía.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>${soloLectura ? "Mis pagos" : "Pagos"}</h2>
        ${!soloLectura ? `<div class="actions"><button class="btn btn-primary btn-sm" id="btnNuevoPago">+ Registrar pago</button></div>` : ""}
      </div>
      ${!soloLectura ? `<div class="filters">
        <div class="field"><label>Desde</label><input type="date" id="pDesde"></div>
        <div class="field"><label>Hasta</label><input type="date" id="pHasta"></div>
        <div class="field"><label>Método</label>
          <select id="pMetodo"><option value="">Todos</option><option>EFECTIVO</option><option>TARJETA</option><option>TRANSFERENCIA</option></select>
        </div>
        <div class="field"><label>Estado</label>
          <select id="pEstado"><option value="">Todos</option><option>COMPLETADO</option><option>FALLIDO</option><option>PENDIENTE</option></select>
        </div>
        <button class="btn btn-outline btn-sm" id="btnFiltrarP">Filtrar</button>
      </div>` : ""}
      <div id="pagosTabla"></div>
    </div>`;

  async function cargar() {
    let data;
    if (soloLectura) {
      data = await PG.get("/api/pagos/mios");
    } else {
      const fechaInicio = document.getElementById("pDesde").value;
      const fechaFin = document.getElementById("pHasta").value;
      const metodoPago = document.getElementById("pMetodo").value;
      const estado = document.getElementById("pEstado").value;
      data = await PG.get("/api/pagos/buscar", { fechaInicio, fechaFin, metodoPago, estado });
    }
    const cols = [
      { label: "Fecha", render: r => fmtDateTime(r.fechaPago) },
      { label: "Membresía", render: r => soloLectura ? esc(r.membresia.plan.nombre) : `#${r.membresia.idMembresia} · ${esc(r.membresia.cliente.nombre)} ${esc(r.membresia.cliente.apellido)}` },
      { label: "Monto", render: r => fmtMoney(r.monto) },
      { label: "Método", key: "metodoPago" },
      { label: "Estado", render: r => `<span class="badge ${r.estado === "COMPLETADO" ? "badge-green" : r.estado === "FALLIDO" ? "badge-red" : "badge-amber"}">${esc(r.estado)}</span>` },
    ];
    renderTable(document.getElementById("pagosTabla"), { columns: cols, rows: data, empty: "No hay pagos registrados." });
  }

  if (!soloLectura) {
    document.getElementById("btnFiltrarP").addEventListener("click", cargar);
    document.getElementById("btnNuevoPago").addEventListener("click", () => crearPago(cargar));
  }
  await cargar();
}

async function crearPago(onDone) {
  const membresias = await PG.get("/api/membresias");
  openDialog({
    title: "Registrar pago",
    bodyHtml: `
      <div class="field"><label>Membresía</label>
        <select name="idMembresia" required>${membresias.map(m => `<option value="${m.idMembresia}">#${m.idMembresia} — ${esc(m.cliente.nombre)} ${esc(m.cliente.apellido)} (${esc(m.plan.nombre)}, ${fmtMoney(m.plan.precio)})</option>`).join("")}</select>
      </div>
      <div class="form-grid">
        <div class="field"><label>Monto (RD$)</label><input type="number" step="0.01" min="0.01" name="monto" required></div>
        <div class="field"><label>Método</label>
          <select name="metodoPago" required><option value="EFECTIVO">Efectivo</option><option value="TARJETA">Tarjeta</option><option value="TRANSFERENCIA">Transferencia</option></select>
        </div>
      </div>
      <div class="field"><label>Referencia (opcional)</label><input name="referencia"></div>
      <p class="tag-line" style="margin-top:8px;">El monto debe coincidir exactamente con el precio del plan de la membresía; de lo contrario el pago quedará como <b>FALLIDO</b>.</p>`,
    onSubmit: async (fd) => {
      try {
        await PG.post("/api/pagos", {
          idMembresia: Number(fd.get("idMembresia")),
          monto: fd.get("monto"),
          metodoPago: fd.get("metodoPago"),
          referencia: fd.get("referencia") || null
        });
        toast("Pago registrado como COMPLETADO.");
      } catch (e) {
        if (e.status === 402) toast("El pago se registró pero quedó FALLIDO: el monto no coincide con el precio del plan.", "err");
        else throw e;
      }
      onDone();
    }
  });
}

/* ================= ASISTENCIAS ================= */
async function renderAsistencias(el) {
  const soloLectura = rol === "CLIENTE";
  pageSub.textContent = soloLectura ? "Tu historial de ingresos al gimnasio." : "Control de acceso diario.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>${soloLectura ? "Mis asistencias" : "Asistencias"}</h2>
        ${!soloLectura ? `<div class="actions"><button class="btn btn-primary btn-sm" id="btnRegistrarAsistencia">+ Registrar ingreso</button></div>` : ""}
      </div>
      ${!soloLectura ? `<div class="filters">
        <div class="field"><label>Desde</label><input type="date" id="aDesde"></div>
        <div class="field"><label>Hasta</label><input type="date" id="aHasta"></div>
        <button class="btn btn-outline btn-sm" id="btnFiltrarA">Buscar</button>
      </div>` : ""}
      <div id="asistenciasTabla"></div>
    </div>`;

  async function cargar() {
    let data;
    if (soloLectura) {
      data = await PG.get("/api/asistencias/mias");
    } else {
      const fechaInicio = document.getElementById("aDesde").value;
      const fechaFin = document.getElementById("aHasta").value;
      data = (fechaInicio && fechaFin)
        ? await PG.get("/api/asistencias/buscar", { fechaInicio, fechaFin })
        : await PG.get("/api/asistencias");
    }
    const cols = [];
    if (!soloLectura) cols.push({ label: "Cliente", render: r => `${esc(r.cliente.nombre)} ${esc(r.cliente.apellido)} (${esc(r.cliente.codigo)})` });
    cols.push({ label: "Fecha y hora", render: r => fmtDateTime(r.fechaHora) });
    renderTable(document.getElementById("asistenciasTabla"), { columns: cols, rows: data, empty: "No hay asistencias registradas." });
  }

  if (!soloLectura) {
    document.getElementById("btnFiltrarA").addEventListener("click", cargar);
    document.getElementById("btnRegistrarAsistencia").addEventListener("click", () => registrarAsistencia());
  }
  await cargar();
}

async function registrarAsistencia() {
  const clientes = await PG.get("/api/clientes/activos");
  openDialog({
    title: "Registrar ingreso",
    submitLabel: "Registrar",
    bodyHtml: `
      <div class="field"><label>Cliente</label>
        <select name="idCliente" required>${clientes.map(c => `<option value="${c.idCliente}">${esc(c.codigo)} — ${esc(c.nombre)} ${esc(c.apellido)}</option>`).join("")}</select>
      </div>`,
    onSubmit: async (fd) => {
      await PG.post("/api/asistencias", { idCliente: Number(fd.get("idCliente")) });
      toast("Asistencia registrada.");
    }
  });
}

/* ================= USUARIOS (solo Admin) ================= */
async function renderUsuarios(el) {
  pageSub.textContent = "Cuentas de acceso del personal y clientes.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head">
        <h2>Usuarios</h2>
        <div class="actions"><button class="btn btn-primary btn-sm" id="btnNuevoUsuario">+ Nuevo usuario</button></div>
      </div>
      <div class="filters">
        <div class="field"><label>Rol</label>
          <select id="fRolUsuario"><option value="">Todos</option><option value="ADMINISTRADOR">Administrador</option><option value="RECEPCIONISTA">Recepcionista</option><option value="CLIENTE">Cliente</option></select>
        </div>
      </div>
      <div id="usuariosTabla"></div>
    </div>`;

  const ordenRoles = { ADMINISTRADOR: 0, RECEPCIONISTA: 1, CLIENTE: 2 };

  async function cargar() {
    let data = await PG.get("/api/usuarios");
    const filtroRol = document.getElementById("fRolUsuario").value;
    if (filtroRol) data = data.filter(r => r.rol === filtroRol);
    data = [...data].sort((a, b) => (ordenRoles[a.rol] ?? 99) - (ordenRoles[b.rol] ?? 99));
    renderTable(document.getElementById("usuariosTabla"), {
      columns: [
        { label: "Correo", key: "email" },
        { label: "Rol", render: r => `<span class="badge badge-gray">${esc(r.rol)}</span>` },
        { label: "Estado", render: r => `<span class="badge ${r.activo ? "badge-green" : "badge-gray"}">${r.activo ? "Activo" : "Inactivo"}</span>` },
        { label: "", render: r => r.activo ? `<button class="btn btn-danger btn-sm" data-baja="${r.idUsuario}">Desactivar</button>` : `<button class="btn btn-outline btn-sm" data-reactivar="${r.idUsuario}">Reactivar</button>` }
      ],
      rows: data,
      empty: "No hay usuarios registrados."
    });
    document.querySelectorAll("[data-baja]").forEach(b => b.addEventListener("click", async () => {
      if (!confirmAction("¿Desactivar este usuario? No podrá iniciar sesión.")) return;
      try { await PG.del(`/api/usuarios/${b.dataset.baja}`); toast("Usuario desactivado."); cargar(); } catch (e) { toast(e.message, "err"); }
    }));
    document.querySelectorAll("[data-reactivar]").forEach(b => b.addEventListener("click", async () => {
      try { await PG.put(`/api/usuarios/${b.dataset.reactivar}/reactivar`); toast("Usuario reactivado."); cargar(); } catch (e) { toast(e.message, "err"); }
    }));
  }

  document.getElementById("fRolUsuario").addEventListener("change", cargar);

  document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
    openDialog({
      title: "Nuevo usuario del sistema",
      bodyHtml: `
        <div class="field"><label>Correo electrónico</label><input type="email" name="email" required></div>
        <div class="field"><label>Contraseña (mín. 8 caracteres)</label><input type="password" name="password" minlength="8" required></div>
        <div class="field"><label>Rol</label>
          <select name="rol" required><option value="ADMINISTRADOR">Administrador</option><option value="RECEPCIONISTA">Recepcionista</option><option value="CLIENTE">Cliente</option></select>
        </div>
        <p class="tag-line">Los usuarios con rol Cliente creados aquí no quedan automáticamente vinculados a un registro de Cliente; usa "Clientes → Nuevo cliente" para el autoregistro completo.</p>`,
      onSubmit: async (fd) => {
        await PG.post("/api/usuarios", { email: fd.get("email"), password: fd.get("password"), rol: fd.get("rol") });
        toast("Usuario creado.");
        cargar();
      }
    });
  });

  await cargar();
}

/* ================= MI PERFIL (solo Cliente) ================= */
async function renderPerfilCliente(el) {
  pageSub.textContent = "Tus datos personales.";
  const cliente = await PG.get("/api/clientes/perfil");
  el.innerHTML = `
    <div class="panel">
      <div class="profile-header">
        <div class="profile-avatar">${esc(cliente.nombre.charAt(0))}</div>
        <div>
          <h2 style="margin-bottom:2px;">${esc(cliente.nombre)} ${esc(cliente.apellido)}</h2>
          <div class="tag-line" style="margin:0;">Código ${esc(cliente.codigo)}</div>
        </div>
      </div>
      <ul class="mini-list" style="margin-top:12px;">
        <li><span>Documento</span><b>${esc(cliente.documento)}</b></li>
        <li><span>Teléfono</span><b>${esc(cliente.telefono || "—")}</b></li>
        <li><span>Estado de la cuenta</span>${cliente.activo ? `<span class="badge badge-green">Activo</span>` : `<span class="badge badge-gray">Inactivo</span>`}</li>
      </ul>
      <p class="tag-line" style="margin-top:14px;">Para actualizar tus datos personales, contacta a recepción.</p>
    </div>`;
}

/* ================= REPORTES (solo Admin, RF-17/RF-18) ================= */
async function renderReportes(el) {
  pageSub.textContent = "Reportes exportables con filtros dinámicos.";
  el.innerHTML = `
    <div class="panel">
      <div class="panel-head"><h2>Generar reporte</h2></div>
      <div class="filters">
        <div class="field"><label>Tipo de reporte</label>
          <select id="rTipo">
            <option value="pagos">Ingresos (pagos)</option>
            <option value="asistencias">Asistencias</option>
            <option value="membresias">Vencimientos de membresías</option>
          </select>
        </div>
        <div class="field"><label>Desde</label><input type="date" id="rDesde"></div>
        <div class="field"><label>Hasta</label><input type="date" id="rHasta"></div>
        <div class="field" id="rEstadoWrap" style="display:none;"><label>Estado</label>
          <select id="rEstado"><option value="">Todos</option><option value="ACTIVA">Activa</option><option value="INACTIVA">Inactiva</option><option value="CANCELADA">Cancelada</option><option value="EXPIRADA">Expirada</option><option value="RENOVADA">Renovada</option></select>
        </div>
        <button class="btn btn-primary btn-sm" id="btnGenerar">Generar</button>
        <button class="btn btn-outline btn-sm" id="btnExportar" disabled>Exportar CSV</button>
      </div>
      <div id="reporteResumen" class="kpi-grid"></div>
      <div id="reporteTabla"></div>
    </div>`;

  let ultimoReporte = { columnas: [], filas: [], filename: "reporte.csv" };

  document.getElementById("rTipo").addEventListener("change", (e) => {
    document.getElementById("rEstadoWrap").style.display = e.target.value === "membresias" ? "" : "none";
  });

  document.getElementById("btnGenerar").addEventListener("click", async () => {
    const tipo = document.getElementById("rTipo").value;
    const desde = document.getElementById("rDesde").value;
    const hasta = document.getElementById("rHasta").value;
    if (!desde || !hasta) { toast("Selecciona el rango de fechas.", "err"); return; }

    document.getElementById("reporteTabla").innerHTML = `<div class="loader">Generando…</div>`;

    if (tipo === "pagos") {
      const data = await PG.get("/api/pagos/buscar", { fechaInicio: desde, fechaFin: hasta, estado: "COMPLETADO" });
      const total = data.reduce((s, p) => s + Number(p.monto), 0);
      document.getElementById("reporteResumen").innerHTML = `
        <div class="kpi money"><div class="label">Ingresos totales</div><div class="value">${fmtMoney(total)}</div></div>
        <div class="kpi accent"><div class="label">Pagos completados</div><div class="value">${data.length}</div></div>`;
      renderTable(document.getElementById("reporteTabla"), {
        columns: [
          { label: "Fecha", render: r => fmtDateTime(r.fechaPago) },
          { label: "Cliente", render: r => `${esc(r.membresia.cliente.nombre)} ${esc(r.membresia.cliente.apellido)}` },
          { label: "Plan", render: r => r.membresia.plan.nombre },
          { label: "Monto", render: r => fmtMoney(r.monto) },
          { label: "Método", key: "metodoPago" },
        ],
        rows: data, empty: "Sin pagos completados en el rango."
      });
      ultimoReporte = {
        filename: `ingresos_${desde}_a_${hasta}.csv`,
        columnas: ["Fecha", "Cliente", "Plan", "Monto", "Metodo"],
        filas: data.map(r => [fmtDateTime(r.fechaPago), `${r.membresia.cliente.nombre} ${r.membresia.cliente.apellido}`, r.membresia.plan.nombre, r.monto, r.metodoPago])
      };
    } else if (tipo === "asistencias") {
      const data = await PG.get("/api/asistencias/buscar", { fechaInicio: desde, fechaFin: hasta });
      document.getElementById("reporteResumen").innerHTML = `
        <div class="kpi accent"><div class="label">Total de ingresos registrados</div><div class="value">${data.length}</div></div>`;
      renderTable(document.getElementById("reporteTabla"), {
        columns: [
          { label: "Cliente", render: r => `${esc(r.cliente.nombre)} ${esc(r.cliente.apellido)} (${esc(r.cliente.codigo)})` },
          { label: "Fecha y hora", render: r => fmtDateTime(r.fechaHora) },
        ],
        rows: data, empty: "Sin asistencias en el rango."
      });
      ultimoReporte = {
        filename: `asistencias_${desde}_a_${hasta}.csv`,
        columnas: ["Cliente", "Codigo", "FechaHora"],
        filas: data.map(r => [`${r.cliente.nombre} ${r.cliente.apellido}`, r.cliente.codigo, fmtDateTime(r.fechaHora)])
      };
    } else {
      const estado = document.getElementById("rEstado").value;
      const data = await PG.get("/api/membresias/buscar", { fechaInicio: desde, fechaFin: hasta, estado });
      document.getElementById("reporteResumen").innerHTML = `
        <div class="kpi accent"><div class="label">Membresías en el rango</div><div class="value">${data.length}</div></div>`;
      renderTable(document.getElementById("reporteTabla"), {
        columns: [
          { label: "Cliente", render: r => `${esc(r.cliente.nombre)} ${esc(r.cliente.apellido)}` },
          { label: "Plan", render: r => r.plan.nombre },
          { label: "Vence", render: r => fmtDate(r.fechaFin) },
          { label: "Estado", render: r => estadoBadge(r.estado) },
        ],
        rows: data, empty: "Sin membresías en el rango."
      });
      ultimoReporte = {
        filename: `membresias_${desde}_a_${hasta}.csv`,
        columnas: ["Cliente", "Plan", "Vence", "Estado"],
        filas: data.map(r => [`${r.cliente.nombre} ${r.cliente.apellido}`, r.plan.nombre, fmtDate(r.fechaFin), r.estado])
      };
    }
    document.getElementById("btnExportar").disabled = false;
  });

  document.getElementById("btnExportar").addEventListener("click", () => {
    downloadCSV(ultimoReporte.filename, [ultimoReporte.columnas, ...ultimoReporte.filas]);
  });
}
