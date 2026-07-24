// app.js — capa de interfaz. Todo lo que necesita datos llama a DataService (conectado a Supabase).

// Set de íconos: cada botón usa la patita/silueta de un animal distinto.
const ICONS = {
  perro: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="15.5" r="5.2"/><circle cx="4.5" cy="9" r="2.3"/><circle cx="10" cy="4.8" r="2.3"/><circle cx="14" cy="4.8" r="2.3"/><circle cx="19.5" cy="9" r="2.3"/></svg>`,
  gato: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="6" ry="5.2"/><circle cx="7" cy="10.5" r="2"/><circle cx="17" cy="10.5" r="2"/><circle cx="10.2" cy="6.5" r="1.7"/><circle cx="13.8" cy="6.5" r="1.7"/></svg>`,
  conejo: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><ellipse cx="8.5" cy="6" rx="2.4" ry="6.5" transform="rotate(-12 8.5 6)"/><ellipse cx="15.5" cy="6" rx="2.4" ry="6.5" transform="rotate(12 15.5 6)"/><ellipse cx="12" cy="17" rx="6.2" ry="5.4"/></svg>`,
  loro: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><ellipse cx="13" cy="13" rx="7" ry="8" transform="rotate(15 13 13)"/><path d="M6 10 L1.5 8.5 L6 13.5 Z"/><circle cx="10.5" cy="8" r="1.3" fill="#fff8ee"/></svg>`,
  gallina: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="5.5" ry="6"/><path d="M8 6 L9.5 1.5 L11 6 Z"/><path d="M11 5.5 L12.5 1 L14 5.5 Z"/><path d="M14 6 L15.5 1.5 L17 6 Z"/><path d="M10.5 17 L9 24 L12 24 L12.5 19 L13 24 L16 24 L14.5 17 Z"/></svg>`,
  caballo: `<svg class="paw-icon-sm" viewBox="0 0 24 24"><path d="M12 3 C6 3 4 8 4 12 C4 16.5 6.5 19 8 21 L8.5 21 C7.6 18 8 15 9 15 C10 15 9.6 18.5 10.3 21 L13.7 21 C14.4 18.5 14 15 15 15 C16 15 15.6 18 14.7 21 L15.2 21 C16.7 19 19.2 16.5 19.2 12 C19.2 8 17 3 12 3 Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="10" r="1"/><circle cx="15.5" cy="10" r="1"/></svg>`,
};

// Ilustración de mascota para estados vacíos (perrito sentado, esperando).
const MASCOT_EMPTY = `<svg class="mascot" viewBox="0 0 100 100">
  <ellipse cx="50" cy="50" rx="32" ry="28" fill="#fff3d6"/>
  <ellipse cx="30" cy="30" rx="8" ry="12" fill="#ffb100" transform="rotate(-25 30 30)"/>
  <ellipse cx="70" cy="30" rx="8" ry="12" fill="#ffb100" transform="rotate(25 70 30)"/>
  <circle cx="41" cy="48" r="3" fill="#2b2420"/>
  <circle cx="59" cy="48" r="3" fill="#2b2420"/>
  <ellipse cx="50" cy="58" rx="4" ry="3" fill="#2b2420"/>
  <path d="M44 63 Q50 68 56 63" stroke="#2b2420" stroke-width="2" fill="none" stroke-linecap="round"/>
</svg>`;

const PAW_SVG = ICONS.perro;

// ---------------- Redes sociales ----------------

const REDES_ICONS = {
  instagram: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17.2" cy="6.8" r="1.1"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24"><path d="M14.5 21v-7.5h2.5l0.4-3H14.5V8.4c0-.9.3-1.6 1.7-1.6h1.4V4.2C17.3 4.1 16.2 4 15 4c-2.6 0-4.4 1.6-4.4 4.5v2H8v3h2.6V21h3.9Z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.3 8.4c.2-.5.5-.5.8-.5h.6c.2 0 .5 0 .7.5.3.6.9 2 .9 2.1.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.4.4-.2.7.6 1 1.3 1.8 2.2 2.3.2.2.4.2.6 0 .2-.2.8-.9 1-1.2.2-.3.4-.2.6-.1.2.1 1.8.9 2.1 1 .3.1.5.2.5.4 0 .2 0 1-.5 1.6-.4.6-1.9 1.1-2.6 1.1-.7 0-2.2-.2-4.2-1.9-2.5-2.1-3.4-4.3-3.6-4.9-.1-.5-.5-1.3-.5-2.5s.6-1.6.8-1.7Z"/></svg>`,
  tiktok: `<svg viewBox="0 0 24 24"><path d="M14 3v10.8a2.6 2.6 0 1 1-2.2-2.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M14 3c.3 2.2 2 3.9 4.2 4.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  twitter: `<svg viewBox="0 0 24 24"><path d="M4 4l7 9.2L4.3 20H6l5.9-5.9L16 20h4l-7.3-9.6L19.5 4H17.7l-5.4 5.4L8 4Z"/></svg>`,
};

const REDES_LABEL = {
  instagram: "Instagram", facebook: "Facebook", whatsapp: "WhatsApp",
  tiktok: "TikTok", twitter: "X (Twitter)",
};

function redSocialUrl(key, valor) {
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const usuario = v.replace(/^@/, "");
  switch (key) {
    case "instagram": return `https://instagram.com/${usuario}`;
    case "facebook": return `https://facebook.com/${usuario}`;
    case "whatsapp": return `https://wa.me/${usuario.replace(/[^0-9]/g, "")}`;
    case "tiktok": return `https://tiktok.com/@${usuario}`;
    case "twitter": return `https://x.com/${usuario}`;
    default: return v;
  }
}

function renderRedesSociales(redes) {
  if (!redes) return "";
  const activas = Object.keys(REDES_ICONS).filter(k => redes[k]);
  if (activas.length === 0) return "";
  const botones = activas.map(k => `
    <a class="social-btn" href="${redSocialUrl(k, redes[k])}" target="_blank" rel="noopener noreferrer" title="${REDES_LABEL[k]}">
      ${REDES_ICONS[k]}
    </a>
  `).join("");
  return `
    <div class="card">
      <p class="card-label">Sigue y apoya en redes sociales</p>
      <div class="social-row">${botones}</div>
    </div>
  `;
}

// Avatares ilustrados por especie, para la galería de casos.
const AVATARES = {
  Perro: { clase: "avatar-perro", svg: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="30" ry="26" fill="#ffb100"/><ellipse cx="26" cy="34" rx="10" ry="15" fill="#e69800" transform="rotate(-25 26 34)"/><ellipse cx="74" cy="34" rx="10" ry="15" fill="#e69800" transform="rotate(25 74 34)"/><ellipse cx="50" cy="63" rx="13" ry="10" fill="#fff3d6"/><circle cx="41" cy="50" r="3.4" fill="#2b2420"/><circle cx="59" cy="50" r="3.4" fill="#2b2420"/><ellipse cx="50" cy="61" rx="3.8" ry="2.8" fill="#2b2420"/></svg>` },
  Gato: { clase: "avatar-gato", svg: `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="56" rx="27" ry="24" fill="#3ec1e8"/><polygon points="27,38 33,14 41,40" fill="#2ba9cf"/><polygon points="73,38 67,14 59,40" fill="#2ba9cf"/><circle cx="41" cy="52" r="3.4" fill="#2b2420"/><circle cx="59" cy="52" r="3.4" fill="#2b2420"/><polygon points="50,58 45,53 55,53" fill="#2b2420"/></svg>` },
  Otro: { clase: "avatar-otro", svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="55" r="28" fill="#0ea37d"/><circle cx="30" cy="35" r="8"/><circle cx="70" cy="35" r="8"/><circle cx="41" cy="52" r="3.4" fill="#fff8ee"/><circle cx="59" cy="52" r="3.4" fill="#fff8ee"/><ellipse cx="50" cy="63" rx="4" ry="3" fill="#fff8ee"/></svg>` },
};

function avatarPara(especie) {
  return AVATARES[especie] || AVATARES.Otro;
}

let fundacionActualId = null;
let casoActualId = null;
let adminUser = null;
let role = "anon"; // "anon" | "fundacion" | "admin"
let miFundacion = null;

function formatCLP(n) {
  return "$" + Number(n).toLocaleString("es-CL");
}

// ---------------- Formateo automático de RUT ----------------

function formatRut(valor) {
  const limpio = valor.replace(/[^0-9kK]/g, "").toUpperCase();
  if (limpio.length === 0) return "";
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  if (cuerpo.length === 0) return dv;
  const cuerpoConPuntos = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cuerpoConPuntos}-${dv}`;
}

document.addEventListener("input", e => {
  if (e.target.classList && e.target.classList.contains("rut-input")) {
    const cursorAlFinal = e.target.selectionEnd === e.target.value.length;
    e.target.value = formatRut(e.target.value);
    if (cursorAlFinal) {
      e.target.selectionStart = e.target.selectionEnd = e.target.value.length;
    }
  }
});

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2600);
}

async function withErrorToast(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error(err);
    toast(err.message || "Ocurrió un error, revisa la consola.");
  }
}

// ---------------- Sesión (público / fundación / admin) ----------------

function renderSessionArea() {
  const wrap = document.getElementById("admin-area");
  if (role === "fundacion") {
    wrap.innerHTML = `<span class="session-chip">${miFundacion.nombre}</span><button class="btn-secondary" id="btn-logout">Salir</button>`;
  } else if (role === "admin") {
    wrap.innerHTML = `<span class="session-chip">Admin · ${adminUser.email}</span><button class="btn-secondary" id="btn-logout">Salir</button>`;
  } else {
    wrap.innerHTML = `<button class="btn-secondary" id="btn-login">Iniciar sesión</button>`;
    document.getElementById("btn-login").addEventListener("click", openLoginModal);
    return;
  }
  document.getElementById("btn-logout").addEventListener("click", async () => {
    await DataService.logoutAdmin();
    role = "anon";
    adminUser = null;
    miFundacion = null;
    fundacionActualId = null;
    renderNav();
    renderSessionArea();
    showView("home");
  });
}

function openLoginModal() {
  document.getElementById("login-modal-backdrop").classList.add("show");
}
function closeLoginModal() {
  document.getElementById("login-modal-backdrop").classList.remove("show");
  document.getElementById("form-login").reset();
}
document.getElementById("btn-cerrar-login").addEventListener("click", closeLoginModal);
document.getElementById("login-modal-backdrop").addEventListener("click", e => {
  if (e.target.id === "login-modal-backdrop") closeLoginModal();
});

document.getElementById("form-login").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const user = await withErrorToast(() => DataService.loginAdmin(data.email, data.password));
  if (!user) return;
  await afterLogin(user);
  closeLoginModal();
});

async function afterLogin(user) {
  const fundacion = await withErrorToast(() => DataService.obtenerFundacionPorUsuario(user.id));
  if (fundacion) {
    role = "fundacion";
    miFundacion = fundacion;
    adminUser = null;
    fundacionActualId = fundacion.id;
    toast(`Bienvenido/a, ${fundacion.nombre}`);
  } else {
    role = "admin";
    adminUser = user;
    miFundacion = null;
    toast("Sesión iniciada como administrador.");
  }
  renderNav();
  renderSessionArea();
  showView("dashboard");
}

// ---------------- Navegación entre vistas ----------------

const TABS_POR_ROL = {
  anon: [
    { view: "home", label: "Inicio" },
    { view: "registro-persona", label: "Publicar como particular" },
    { view: "casos", label: "Casos" },
    { view: "registro", label: "Registrarme" },
  ],
  fundacion: [
    { view: "home", label: "Inicio" },
    { view: "dashboard", label: "Mi panel" },
    { view: "mis-casos", label: "Mis casos" },
    { view: "casos", label: "Casos" },
    { view: "suscripcion", label: "Suscripción" },
  ],
  admin: [
    { view: "home", label: "Inicio" },
    { view: "dashboard", label: "Panel" },
    { view: "registro", label: "Registrar fundación" },
    { view: "registro-persona", label: "Publicar como particular" },
    { view: "casos", label: "Casos" },
    { view: "suscripcion", label: "Suscripción" },
  ],
};

function renderNav() {
  const nav = document.getElementById("main-tabs");
  nav.innerHTML = TABS_POR_ROL[role]
    .map(t => `<button class="tab-btn" data-view="${t.view}">${t.label}</button>`)
    .join("");
}

function showView(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document.querySelectorAll(".tab-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.view === view);
  });

  if (view === "home") renderGaleriaCasos("galeria-casos-home");
  if (view === "dashboard") renderDashboard();
  if (view === "casos") renderCasos();
  if (view === "mis-casos") renderMisCasos();
  if (view === "suscripcion") renderSuscripcion();
}

document.addEventListener("click", e => {
  const btn = e.target.closest("[data-view]");
  if (btn) showView(btn.dataset.view);
  closeMobileMenu();
});

// ---------------- Menú hamburguesa (móvil) ----------------

const menuToggle = document.getElementById("menu-toggle");
const mainTabs = document.getElementById("main-tabs");
const menuBackdrop = document.getElementById("menu-backdrop");

function openMobileMenu() {
  menuToggle.classList.add("open");
  menuToggle.setAttribute("aria-expanded", "true");
  mainTabs.classList.add("open");
  menuBackdrop.classList.add("show");
}

function closeMobileMenu() {
  menuToggle.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  mainTabs.classList.remove("open");
  menuBackdrop.classList.remove("show");
}

menuToggle.addEventListener("click", () => {
  const isOpen = mainTabs.classList.contains("open");
  isOpen ? closeMobileMenu() : openMobileMenu();
});

menuBackdrop.addEventListener("click", closeMobileMenu);

// ---------------- Selector de fundación (dashboard) ----------------

async function renderSelectorFundacion() {
  const wrap = document.getElementById("selector-fundacion");

  if (role === "fundacion") {
    wrap.innerHTML = "";
    return;
  }

  const fundaciones = await withErrorToast(() => DataService.listarFundaciones()) || [];

  if (fundaciones.length === 0) {
    wrap.innerHTML = `<div class="empty-state">${MASCOT_EMPTY}<div>Aún no hay fundaciones registradas.<br>Ve a "Registrar fundación" para crear la primera.</div></div>`;
    return;
  }

  wrap.innerHTML = fundaciones.map(f => `
    <button class="foundation-chip ${f.id === fundacionActualId ? "active" : ""}" data-id="${f.id}">
      ${f.nombre}
    </button>
  `).join("");

  wrap.querySelectorAll(".foundation-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      fundacionActualId = chip.dataset.id;
      renderDashboard();
    });
  });
}

async function renderDashboard() {
  if (role === "fundacion") fundacionActualId = miFundacion.id;
  await renderSelectorFundacion();
  await renderGaleriaCasos();
  const content = document.getElementById("dashboard-content");

  if (!fundacionActualId) {
    content.innerHTML = "";
    return;
  }

  content.innerHTML = `<p class="empty-state">Cargando...</p>`;

  const f = await withErrorToast(() => DataService.obtenerFundacion(fundacionActualId));
  if (!f) { content.innerHTML = ""; return; }
  const resumen = await withErrorToast(() => DataService.resumenFundacion(fundacionActualId));

  const badgeClass = f.estadoVerificacion === "verificada" ? "badge-verified" : "badge-pending";

  content.innerHTML = `
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="margin:0 0 4px;">${f.nombre}</h3>
          <span style="font-size:13px;color:var(--ink-soft);">${f.tipo} · ${f.ciudad}</span>
        </div>
        <span class="badge ${badgeClass}">${estadoLegible(f.estadoVerificacion)}</span>
      </div>
      <p style="font-size:13px;color:var(--ink-soft);margin-top:10px;">Plan actual: <strong>${DataService.listarPlanes().find(p => p.id === f.suscripcion.plan).nombre}</strong></p>
    </div>

    <div class="stats-row">
      <div class="stat-box"><div class="num">${resumen.casosActivos}</div><div class="lbl">Casos activos</div></div>
      <div class="stat-box"><div class="num">${resumen.casosCumplidos}</div><div class="lbl">Casos cumplidos</div></div>
      <div class="stat-box"><div class="num">${formatCLP(resumen.totalRecaudado)}</div><div class="lbl">Total recaudado</div></div>
    </div>
  `;

  renderEdicionFundacion(f);
}

function renderEdicionFundacion(f) {
  const wrap = document.getElementById("admin-edit-fundacion");
  const puedeEditar = adminUser || (role === "fundacion" && miFundacion && miFundacion.id === f.id);
  if (!puedeEditar) { wrap.innerHTML = ""; return; }

  wrap.innerHTML = `
    <details class="card">
      <summary>${adminUser ? "Editar datos de la fundación (solo admin)" : "Editar datos de mi fundación"}</summary>
      <form id="form-editar-fundacion">
        <label>Nombre
          <input type="text" name="nombre" value="${f.nombre}" required />
        </label>
        <label>Ciudad
          <input type="text" name="ciudad" value="${f.ciudad}" list="ciudades-cl" required />
        </label>
        <label>Email de contacto
          <input type="email" name="email" value="${f.email}" required />
        </label>
        <label>Banco
          <input type="text" name="banco" value="${f.banco || ""}" />
        </label>
        <label>Tipo de cuenta
          <input type="text" name="tipoCuenta" value="${f.tipoCuenta || ""}" />
        </label>
        <label>Número de cuenta
          <input type="text" name="numeroCuenta" value="${f.numeroCuenta || ""}" />
        </label>
        <label>RUT
          <input type="text" name="rut" class="rut-input" value="${f.rut || ""}" />
        </label>
        <label>Email para pagos
          <input type="email" name="emailPagos" value="${f.emailPagos || ""}" />
        </label>
        <p class="card-label" style="margin-top:16px;">Redes sociales</p>
        <label>Instagram
          <input type="text" name="instagram" value="${f.redes?.instagram || ""}" />
        </label>
        <label>Facebook
          <input type="text" name="facebook" value="${f.redes?.facebook || ""}" />
        </label>
        <label>WhatsApp
          <input type="text" name="whatsapp" value="${f.redes?.whatsapp || ""}" />
        </label>
        <label>TikTok
          <input type="text" name="tiktok" value="${f.redes?.tiktok || ""}" />
        </label>
        <label>X (Twitter)
          <input type="text" name="twitter" value="${f.redes?.twitter || ""}" />
        </label>
        <button type="submit" class="btn-primary">Guardar cambios ${ICONS.perro}</button>
      </form>
      ${adminUser ? `
      <button class="btn-secondary" id="btn-eliminar-fundacion" style="margin-top:12px;border-color:var(--coral);color:var(--coral-dark);">
        Eliminar fundación
      </button>` : ""}
    </details>
  `;

  document.getElementById("form-editar-fundacion").addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const ok = await withErrorToast(() => DataService.actualizarFundacion(fundacionActualId, data));
    if (!ok) return;
    toast("Fundación actualizada.");
    renderDashboard();
  });

  const btnEliminarFundacion = document.getElementById("btn-eliminar-fundacion");
  if (btnEliminarFundacion) {
    btnEliminarFundacion.addEventListener("click", async () => {
      const confirmado = confirm(`¿Eliminar "${f.nombre}" y todos sus casos y donaciones? Esta acción no se puede deshacer.`);
      if (!confirmado) return;
      const ok = await withErrorToast(async () => { await DataService.eliminarFundacion(fundacionActualId); return true; });
      if (!ok) return;
      toast("Fundación eliminada.");
      fundacionActualId = null;
      renderDashboard();
    });
  }
}

async function renderGaleriaCasos(targetId = "galeria-casos") {
  const wrap = document.getElementById(targetId);
  if (!wrap) return;
  const todos = await withErrorToast(() => DataService.listarCasos()) || [];
  const abiertos = todos.filter(c => c.estado === "abierto").slice(0, 6);

  if (abiertos.length === 0) {
    wrap.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">${MASCOT_EMPTY}<div>Todavía no hay casos abiertos para mostrar aquí.</div></div>`;
    return;
  }

  wrap.innerHTML = abiertos.map(c => {
    const av = avatarPara(c.animal.especie);
    const pct = Math.min(100, Math.round((c.recaudado / c.metaRecaudacion) * 100)) || 0;
    const avatarHtml = c.animal.fotoUrl
      ? `<img src="${c.animal.fotoUrl}" alt="${c.animal.nombre}" style="width:100%;height:100%;object-fit:cover;" />`
      : av.svg;
    return `
      <div class="gallery-card">
        <div class="gallery-avatar ${c.animal.fotoUrl ? "" : av.clase}">${avatarHtml}</div>
        <div class="gallery-body">
          <h3>${c.animal.nombre}</h3>
          <div class="meta">${c.tipoAyuda} · ${c.publicador.nombre}</div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="progress-text">${pct}% recaudado</div>
        </div>
        <div class="gallery-actions">
          <button class="btn-primary" data-ayudar="${c.id}" style="justify-content:center;">Ayudar</button>
          <button class="btn-secondary" data-compartir="${c.id}" data-nombre="${c.animal.nombre}" data-ayuda="${c.tipoAyuda}">Compartir</button>
        </div>
      </div>
    `;
  }).join("");

  wrap.querySelectorAll("[data-ayudar]").forEach(btn => {
    btn.addEventListener("click", () => {
      casoActualId = btn.dataset.ayudar;
      renderDetalleCaso();
      showViewRaw("detalle-caso");
    });
  });

  wrap.querySelectorAll("[data-compartir]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const texto = `Ayuda a ${btn.dataset.nombre} (${btn.dataset.ayuda}) en Patitas Conectadas 🐾`;
      try {
        if (navigator.share) {
          await navigator.share({ text: texto });
        } else {
          await navigator.clipboard.writeText(texto);
          toast("Copiado — pégalo donde quieras compartirlo.");
        }
      } catch {
        // el usuario canceló el diálogo de compartir, no hacemos nada
      }
    });
  });
}

function estadoLegible(estado) {
  return {
    registrada: "Registrada",
    pendiente: "Pendiente de revisión",
    verificada: "Verificada",
    rechazada: "Rechazada",
  }[estado] || estado;
}

// ---------------- Registro de fundación (paso 1) ----------------

document.getElementById("form-registro").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const confirmPass = document.getElementById("password-confirm").value;
  if (data.password !== confirmPass) {
    toast("Las contraseñas no coinciden.");
    return;
  }
  const f = await withErrorToast(() => DataService.crearFundacion(data));
  if (!f) return;
  fundacionActualId = f.id;
  toast(`Fundación "${f.nombre}" creada. Revisa tu correo para confirmar la cuenta y luego sube tus documentos.`);
  goToStep(2);
});

// ---------------- Documentos (paso 2) ----------------

document.getElementById("btn-enviar-revision").addEventListener("click", async () => {
  if (!fundacionActualId) return;

  const f1 = document.getElementById("doc1").files[0];
  const f2 = document.getElementById("doc2").files[0];
  const files = [f1, f2].filter(Boolean);

  if (files.length === 0) {
    toast("Selecciona al menos un archivo antes de enviar.");
    return;
  }

  const ok = await withErrorToast(() => DataService.subirDocumentos(fundacionActualId, files));
  if (!ok) return;
  toast("Documentos enviados a revisión.");
  goToStep(3);
});

// ---------------- Estado de verificación (paso 3) ----------------

async function renderEstadoVerificacion() {
  const card = document.getElementById("estado-verificacion-card");
  card.innerHTML = `<p class="empty-state">Cargando...</p>`;
  const f = await withErrorToast(() => DataService.obtenerFundacion(fundacionActualId));
  if (!f) { card.innerHTML = ""; return; }

  if (f.estadoVerificacion === "pendiente") {
    card.innerHTML = `
      <p class="card-label">Estado de tu fundación</p>
      <p style="margin:0 0 14px;">Tu solicitud está <span class="badge badge-pending">Pendiente</span> — normalmente se revisa en 24–48 horas.</p>
      <button class="btn-secondary" id="btn-simular-aprobacion">Simular aprobación ${ICONS.conejo}</button>
    `;
    document.getElementById("btn-simular-aprobacion").addEventListener("click", async () => {
      const ok = await withErrorToast(() => DataService.verificarFundacion(fundacionActualId, true));
      if (!ok) return;
      toast("¡Fundación verificada!");
      renderEstadoVerificacion();
    });
  } else if (f.estadoVerificacion === "verificada") {
    card.innerHTML = `
      <p class="card-label">Estado de tu fundación</p>
      <p style="margin:0 0 10px;">Tu fundación está <span class="badge badge-verified">Verificada</span>. Ya puedes publicar casos de ayuda.</p>
      <button class="btn-primary" id="btn-ir-a-casos">Ir a casos ${ICONS.loro}</button>
    `;
    document.getElementById("btn-ir-a-casos").addEventListener("click", () => showView("casos"));
  } else {
    card.innerHTML = `<p class="card-label">Estado de tu fundación</p><p>Aún no has enviado tus documentos.</p>`;
  }
}

function goToStep(step) {
  document.querySelectorAll(".step-pill").forEach(p => p.classList.toggle("active", Number(p.dataset.step) === step));
  document.querySelectorAll(".step-panel").forEach(p => p.classList.toggle("active", Number(p.dataset.stepPanel) === step));
  if (step === 3) renderEstadoVerificacion();
}

// ---------------- Casos ----------------

document.getElementById("form-caso").addEventListener("submit", async e => {
  e.preventDefault();
  if (role !== "fundacion" || !miFundacion) {
    toast("Inicia sesión como fundación para publicar un caso.");
    return;
  }
  const data = Object.fromEntries(new FormData(e.target).entries());
  const foto = document.getElementById("foto-caso-fundacion").files[0] || null;
  const ok = await withErrorToast(() => DataService.crearCaso({ publicadorTipo: "fundacion", publicadorId: miFundacion.id, ...data }, foto));
  if (!ok) return;
  toast("Caso publicado con éxito.");
  e.target.reset();
  document.getElementById("nuevo-caso-wrap").removeAttribute("open");
  renderMisCasos();
});

document.getElementById("form-persona").addEventListener("submit", async e => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const foto = document.getElementById("foto-caso-persona").files[0] || null;
  const persona = await withErrorToast(() => DataService.crearPersonaNatural(data));
  if (!persona) return;
  const ok = await withErrorToast(() => DataService.crearCaso({ publicadorTipo: "persona", publicadorId: persona.id, ...data }, foto));
  if (!ok) return;
  toast("¡Listo! Tu caso ya está publicado.");
  e.target.reset();
  showView("casos");
});

function tarjetaCaso(c) {
  const pct = Math.min(100, Math.round((c.recaudado / c.metaRecaudacion) * 100)) || 0;
  const badge = c.estado === "cumplido" ? `<span class="badge badge-done">Meta cumplida</span>` : `<span class="badge badge-open">Abierto</span>`;
  return `
    <div class="caso-card" data-id="${c.id}">
      ${badge}
      <h3>${c.animal.nombre} · ${c.tipoAyuda}</h3>
      <div class="meta">${c.publicador.nombre}${c.publicador.tipo === "persona" ? " · particular" : ""}</div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-text">${formatCLP(c.recaudado)} de ${formatCLP(c.metaRecaudacion)}</div>
    </div>
  `;
}

function attachCasoCardHandlers(wrap) {
  wrap.querySelectorAll(".caso-card").forEach(card => {
    card.addEventListener("click", () => {
      casoActualId = card.dataset.id;
      renderDetalleCaso();
      showViewRaw("detalle-caso");
    });
  });
}

async function renderCasos() {
  const wrap = document.getElementById("lista-casos");
  wrap.innerHTML = `<p class="empty-state">Cargando...</p>`;
  const casos = await withErrorToast(() => DataService.listarCasos()) || [];

  if (casos.length === 0) {
    wrap.innerHTML = `<div class="empty-state">${MASCOT_EMPTY}<div>Todavía no hay casos publicados.</div></div>`;
    return;
  }

  wrap.innerHTML = casos.map(tarjetaCaso).join("");
  attachCasoCardHandlers(wrap);
}

async function renderMisCasos() {
  const subtitle = document.getElementById("mis-casos-subtitle");
  const publishWrap = document.getElementById("nuevo-caso-wrap");
  const wrap = document.getElementById("lista-mis-casos");

  if (role !== "fundacion" || !miFundacion) {
    subtitle.textContent = "Inicia sesión como fundación para ver y publicar tus casos.";
    publishWrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  const verificada = miFundacion.estadoVerificacion === "verificada";
  subtitle.textContent = verificada
    ? "Publica y revisa el estado de los casos de tu fundación."
    : "Tu fundación aún no está verificada — cuando lo esté, podrás publicar casos aquí.";
  publishWrap.style.display = verificada ? "" : "none";

  wrap.innerHTML = `<p class="empty-state">Cargando...</p>`;
  const casos = await withErrorToast(() => DataService.listarCasos({ fundacionId: miFundacion.id })) || [];

  if (casos.length === 0) {
    wrap.innerHTML = `<div class="empty-state">${MASCOT_EMPTY}<div>Todavía no has publicado casos.</div></div>`;
    return;
  }

  wrap.innerHTML = casos.map(tarjetaCaso).join("");
  attachCasoCardHandlers(wrap);
}

function showViewRaw(view) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
}

document.getElementById("btn-volver-casos").addEventListener("click", () => showView("casos"));

async function renderDetalleCaso() {
  const content = document.getElementById("detalle-caso-content");
  content.innerHTML = `<p class="empty-state">Cargando...</p>`;
  const c = await withErrorToast(() => DataService.obtenerCaso(casoActualId));
  if (!c) { content.innerHTML = ""; return; }

  const pct = Math.min(100, Math.round((c.recaudado / c.metaRecaudacion) * 100)) || 0;
  const titular = c.fundacion || c.persona;

  const datosTransferencia = titular && titular.numeroCuenta
    ? `
      <div class="card">
        <p class="card-label">Transfiere directamente ${c.publicador.tipo === "persona" ? "a la persona a cargo" : "a la fundación"}</p>
        <div style="font-size:15px;line-height:1.9;">
          <div><strong>Banco:</strong> ${titular.banco || "—"}</div>
          <div><strong>Tipo de cuenta:</strong> ${titular.tipoCuenta || "—"}</div>
          <div><strong>N° de cuenta:</strong> ${titular.numeroCuenta || "—"}</div>
          <div><strong>RUT:</strong> ${titular.rut || "—"}</div>
          <div><strong>Email para confirmar:</strong> ${titular.emailPagos || titular.email}</div>
        </div>
        <p style="font-size:13px;color:var(--ink-soft);margin-top:10px;">
          100% de tu donación llega directo, sin comisión. Una vez transferido, puedes dejarlo registrado abajo.
        </p>
      </div>
    `
    : `<div class="card"><p class="empty-state">Todavía no se cargaron datos de transferencia para este caso.</p></div>`;

  content.innerHTML = `
    <div class="card">
      ${c.animal.fotoUrl ? `<img src="${c.animal.fotoUrl}" alt="${c.animal.nombre}" style="width:100%;max-height:320px;object-fit:cover;border-radius:12px;margin-bottom:14px;" />` : ""}
      <h1 style="margin:0 0 4px;">${c.animal.nombre}</h1>
      <p class="subtitle">${c.tipoAyuda} · publicado por ${c.publicador.nombre}${c.publicador.tipo === "persona" ? " (particular)" : ""}</p>
      <p>${c.descripcion || "Sin descripción adicional."}</p>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-text">${formatCLP(c.recaudado)} recaudados de ${formatCLP(c.metaRecaudacion)} (${pct}%)</div>
    </div>

    ${datosTransferencia}

    ${renderRedesSociales(titular ? titular.redes : null)}

    <div class="card">
      <p class="card-label">Registrar mi donación (después de transferir)</p>
      <form id="form-donacion">
        <label>Tu nombre (opcional)
          <input type="text" name="nombreDonante" placeholder="Anónimo" />
        </label>
        <label>Monto transferido (CLP)
          <input type="number" name="monto" min="1000" required placeholder="10000" />
        </label>
        <button type="submit" class="btn-primary">Registrar donación ${ICONS.caballo}</button>
      </form>
    </div>

    <div class="card">
      <p class="card-label">Donaciones registradas</p>
      <div id="lista-donaciones">
        ${c.donaciones.length === 0 ? `<p class="empty-state">Aún no hay donaciones para este caso.</p>` :
          c.donaciones.slice().reverse().map(d => `
            <div style="display:flex;justify-content:space-between;font-size:13px;padding:6px 0;border-bottom:1px solid var(--border);">
              <span>${d.nombreDonante}</span><span>${formatCLP(d.monto)}</span>
            </div>
          `).join("")}
      </div>
    </div>

    ${adminUser ? `
      <div class="card">
        <p class="card-label">Zona de administrador</p>
        <p style="font-size:14px;color:var(--ink-soft);margin:0 0 12px;">
          Si el animal ya fue adoptado, encontrado, o la recaudación terminó, puedes eliminar este caso.
        </p>
        <button class="btn-secondary" id="btn-eliminar-caso" style="border-color:var(--coral);color:var(--coral-dark);">
          Eliminar este caso
        </button>
      </div>
    ` : ""}
  `;

  document.getElementById("form-donacion").addEventListener("submit", async e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target).entries());
    const ok = await withErrorToast(() => DataService.donar(casoActualId, data));
    if (!ok) return;
    toast("¡Gracias por tu donación!");
    renderDetalleCaso();
  });

  const btnEliminarCaso = document.getElementById("btn-eliminar-caso");
  if (btnEliminarCaso) {
    btnEliminarCaso.addEventListener("click", async () => {
      const confirmado = confirm(`¿Eliminar el caso de "${c.animal.nombre}"? Esta acción no se puede deshacer.`);
      if (!confirmado) return;
      const ok = await withErrorToast(async () => { await DataService.eliminarCaso(casoActualId); return true; });
      if (!ok) return;
      toast("Caso eliminado.");
      showView("casos");
    });
  }
}

// ---------------- Suscripción ----------------

async function renderSuscripcion() {
  const wrap = document.getElementById("planes-grid");
  const planes = DataService.listarPlanes();

  if (!fundacionActualId) {
    wrap.innerHTML = `<p class="empty-state">Selecciona una fundación en el Panel para gestionar su suscripción.</p>`;
    return;
  }

  wrap.innerHTML = `<p class="empty-state">Cargando...</p>`;
  const f = await withErrorToast(() => DataService.obtenerFundacion(fundacionActualId));
  if (!f) { wrap.innerHTML = ""; return; }

  wrap.innerHTML = planes.map(p => `
    <div class="plan-card ${f.suscripcion.plan === p.id ? "current" : ""}">
      <h3>${p.nombre}</h3>
      <div class="price">${p.precio === 0 ? "Gratis" : formatCLP(p.precio) + "/mes"}</div>
      <ul><li>${p.limiteCasos === Infinity ? "Casos ilimitados" : `Hasta ${p.limiteCasos} casos activos`}</li></ul>
      ${f.suscripcion.plan === p.id
        ? `<span class="badge badge-verified">Plan actual</span>`
        : `<button class="btn-secondary" data-plan="${p.id}">Elegir ${p.id === "gratis" ? ICONS.conejo : p.id === "pro" ? ICONS.gato : ICONS.caballo}</button>`}
    </div>
  `).join("");

  wrap.querySelectorAll("[data-plan]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const ok = await withErrorToast(() => DataService.cambiarPlan(fundacionActualId, btn.dataset.plan));
      if (!ok) return;
      toast("Plan actualizado.");
      renderSuscripcion();
    });
  });
}

// ---------------- Inicio ----------------

(async () => {
  const user = await DataService.sesionActual();
  if (user) {
    await afterLogin(user);
  } else {
    role = "anon";
    renderNav();
    renderSessionArea();
    showView("home");
  }
})();
