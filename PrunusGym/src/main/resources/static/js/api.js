/* PrunusGym — helper de acceso a la API REST */
const PG = {
  token: () => localStorage.getItem("pg_token"),
  email: () => localStorage.getItem("pg_email"),
  rol: () => localStorage.getItem("pg_rol"),

  logout(redirect = true) {
    localStorage.removeItem("pg_token");
    localStorage.removeItem("pg_email");
    localStorage.removeItem("pg_rol");
    if (redirect) window.location.replace("login.html");
  },

  requireAuth() {
    if (!this.token()) window.location.replace("login.html");
  },

  /**
   * @param {string} path  ej: "/api/clientes"
   * @param {object} opts  { method, body, query }
   */
  async request(path, opts = {}) {
    let url = path;
    if (opts.query) {
      const params = Object.entries(opts.query)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
      if (params) url += (url.includes("?") ? "&" : "?") + params;
    }

    const headers = { "Content-Type": "application/json" };
    if (this.token()) headers["Authorization"] = "Bearer " + this.token();

    const res = await fetch(url, {
      method: opts.method || "GET",
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
    });

    if (res.status === 401) {
      this.logout();
      throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
    }

    let payload = null;
    const text = await res.text();
    if (text) {
      try { payload = JSON.parse(text); } catch (e) { payload = text; }
    }

    if (!res.ok) {
      const msg = (payload && payload.mensaje) ? payload.mensaje
                : (typeof payload === "string" && payload) ? payload
                : `Error ${res.status}`;
      const err = new Error(msg);
      err.status = res.status;
      err.body = payload;
      throw err;
    }

    return payload;
  },

  get(path, query) { return this.request(path, { method: "GET", query }); },
  post(path, body) { return this.request(path, { method: "POST", body }); },
  put(path, body) { return this.request(path, { method: "PUT", body }); },
  del(path) { return this.request(path, { method: "DELETE" }); }
};

function toast(msg, type = "ok") {
  const stack = document.getElementById("toastStack");
  if (!stack) { console.log(msg); return; }
  const el = document.createElement("div");
  el.className = "toast " + (type === "err" ? "err" : "ok");
  el.textContent = msg;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3800);
}

function fmtMoney(n) {
  if (n === null || n === undefined) return "RD$ 0.00";
  return "RD$ " + Number(n).toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
  if (!d) return "—";
  return String(d).substring(0, 10);
}
function fmtDateTime(d) {
  if (!d) return "—";
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return dt.toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });
}
function estadoBadge(estado) {
  const map = {
    "Activa": "badge-green", "Próxima a vencer": "badge-amber", "Vencida": "badge-red",
    "ACTIVA": "badge-green", "RENOVADA": "badge-green", "INACTIVA": "badge-gray",
    "CANCELADA": "badge-red", "EXPIRADA": "badge-red"
  };
  return `<span class="badge ${map[estado] || "badge-gray"}">${estado || "—"}</span>`;
}
function aplicarMascara(input, patronBloques) {
  input.addEventListener("input", () => {
    const digitos = input.value.replace(/\D/g, "").slice(0, patronBloques.reduce((a, b) => a + b, 0));
    let resultado = "";
    let pos = 0;
    patronBloques.forEach((largo, i) => {
      const bloque = digitos.slice(pos, pos + largo);
      if (!bloque) return;
      resultado += (i > 0 && resultado ? "-" : "") + bloque;
      pos += largo;
    });
    input.value = resultado;
  });
}
function aplicarMascarasFormulario(container) {
  container.querySelectorAll('input[name="telefono"]').forEach(i => aplicarMascara(i, [3, 3, 4]));
  container.querySelectorAll('input[name="documento"]').forEach(i => aplicarMascara(i, [3, 7, 1]));
}
function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(v => {
    const s = String(v ?? "");
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
