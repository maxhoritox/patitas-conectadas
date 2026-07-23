/*
  data-service.js — versión conectada a Supabase
  ------------------------------------------------
  Mismo contrato de funciones que antes (mismos nombres y forma de los
  datos que devuelve), pero ahora todo vive en tu base de datos real.
  Como las llamadas a Supabase son asíncronas, todas las funciones
  ahora son `async` y hay que usarlas con `await` desde app.js.
*/

const SUPABASE_URL = "https://jjkcraowdlkknniwqpag.supabase.co";
const SUPABASE_KEY = "sb_publishable_NTP8WAjv2HXrrCEWbkt-tg_cVappJvY";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const PLANES = {
  gratis: { id: "gratis", nombre: "Gratis", precio: 0, limiteCasos: 2 },
  pro: { id: "pro", nombre: "Pro", precio: 9990, limiteCasos: 40 },
  premium: { id: "premium", nombre: "Premium", precio: 25000, limiteCasos: 250 },
};

function sanitizeFileName(nombre) {
  const sinTildes = nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return sinTildes.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

function checkError(error, contexto) {
  if (error) {
    console.error(contexto, error);
    throw new Error(`${contexto}: ${error.message}`);
  }
}

// ---------- Mapeo de filas (snake_case DB -> camelCase app) ----------

function mapFundacion(row, suscripcionRow) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    tipo: row.tipo,
    ciudad: row.ciudad,
    email: row.email,
    estadoVerificacion: row.estado_verificacion,
    creadoEn: row.creado_en,
    banco: row.banco,
    tipoCuenta: row.tipo_cuenta,
    numeroCuenta: row.numero_cuenta,
    rut: row.rut,
    emailPagos: row.email_pagos,
    suscripcion: suscripcionRow
      ? { plan: suscripcionRow.plan, estado: suscripcionRow.estado }
      : { plan: "gratis", estado: "activa" },
  };
}

function mapPersona(row) {
  if (!row) return null;
  return {
    id: row.id,
    nombre: row.nombre,
    rut: row.rut,
    ciudad: row.ciudad,
    email: row.email,
    banco: row.banco,
    tipoCuenta: row.tipo_cuenta,
    numeroCuenta: row.numero_cuenta,
    emailPagos: row.email_pagos,
    creadoEn: row.creado_en,
  };
}

function mapAnimal(row) {
  if (!row) return null;
  return { id: row.id, nombre: row.nombre, especie: row.especie, estado: row.estado, fotoUrl: row.foto_url || null };
}

function mapCaso(row) {
  if (!row) return null;
  const fundacion = row.fundaciones ? mapFundacion(row.fundaciones) : null;
  const persona = row.personas_naturales ? mapPersona(row.personas_naturales) : null;

  return {
    id: row.id,
    fundacionId: row.fundacion_id,
    personaId: row.persona_id,
    animalId: row.animal_id,
    tipoAyuda: row.tipo_ayuda,
    descripcion: row.descripcion,
    metaRecaudacion: Number(row.meta_recaudacion),
    recaudado: Number(row.recaudado),
    estado: row.estado,
    creadoEn: row.creado_en,
    animal: row.animales ? mapAnimal(row.animales) : undefined,
    fundacion,
    persona,
    // publicador: forma unificada, sea fundación o persona natural
    publicador: fundacion
      ? { tipo: "fundacion", nombre: fundacion.nombre }
      : persona
      ? { tipo: "persona", nombre: persona.nombre }
      : { tipo: "desconocido", nombre: "—" },
  };
}

function mapDonacion(row) {
  return {
    id: row.id,
    casoId: row.caso_id,
    usuarioId: row.usuario_id,
    nombreDonante: row.nombre_donante,
    monto: Number(row.monto),
    fecha: row.fecha,
  };
}

const DataService = {

  // ---------- Fundaciones ----------

  async crearFundacion({ nombre, tipo, ciudad, email, banco, tipoCuenta, numeroCuenta, rut, emailPagos }) {
    const { data, error } = await sb
      .from("fundaciones")
      .insert({
        nombre, tipo, ciudad, email,
        banco: banco || null,
        tipo_cuenta: tipoCuenta || null,
        numero_cuenta: numeroCuenta || null,
        rut: rut || null,
        email_pagos: emailPagos || null,
      })
      .select()
      .single();
    checkError(error, "Error creando fundación");

    const { error: subError } = await sb
      .from("suscripciones")
      .insert({ fundacion_id: data.id, plan: "gratis", estado: "activa" });
    checkError(subError, "Error creando suscripción inicial");

    return mapFundacion(data, { plan: "gratis", estado: "activa" });
  },

  async subirDocumentos(fundacionId, files) {
    for (const file of files) {
      const nombreLimpio = sanitizeFileName(file.name);
      const path = `${fundacionId}/${Date.now()}_${nombreLimpio}`;
      const { error: upError } = await sb.storage
        .from("documentos-fundacion")
        .upload(path, file);
      checkError(upError, "Error subiendo documento");

      const { error: rowError } = await sb
        .from("documentos_fundacion")
        .insert({ fundacion_id: fundacionId, nombre_archivo: file.name, url_archivo: path });
      checkError(rowError, "Error guardando referencia de documento");
    }

    const { data, error } = await sb
      .from("fundaciones")
      .update({ estado_verificacion: "pendiente" })
      .eq("id", fundacionId)
      .select()
      .single();
    checkError(error, "Error actualizando estado de la fundación");
    return mapFundacion(data);
  },

  async verificarFundacion(fundacionId, aprobar = true) {
    const { data, error } = await sb
      .from("fundaciones")
      .update({ estado_verificacion: aprobar ? "verificada" : "rechazada" })
      .eq("id", fundacionId)
      .select()
      .single();
    checkError(error, "Error verificando fundación");
    return mapFundacion(data);
  },

  async obtenerFundacion(id) {
    const { data, error } = await sb.from("fundaciones").select("*").eq("id", id).maybeSingle();
    checkError(error, "Error obteniendo fundación");
    if (!data) return null;

    const { data: sub } = await sb
      .from("suscripciones")
      .select("*")
      .eq("fundacion_id", id)
      .maybeSingle();

    return mapFundacion(data, sub);
  },

  async listarFundaciones() {
    const { data, error } = await sb.from("fundaciones").select("*").order("creado_en");
    checkError(error, "Error listando fundaciones");
    return data.map(row => mapFundacion(row));
  },

  // ---------- Suscripciones ----------

  listarPlanes() {
    return Object.values(PLANES);
  },

  async cambiarPlan(fundacionId, planId) {
    if (!PLANES[planId]) throw new Error("Plan inválido");
    const { error } = await sb
      .from("suscripciones")
      .update({ plan: planId, actualizado_en: new Date().toISOString() })
      .eq("fundacion_id", fundacionId);
    checkError(error, "Error cambiando de plan");
    return this.obtenerFundacion(fundacionId);
  },

  // ---------- Personas naturales ----------

  async crearPersonaNatural({ nombre, rut, ciudad, email, banco, tipoCuenta, numeroCuenta, emailPagos }) {
    const { data, error } = await sb
      .from("personas_naturales")
      .insert({
        nombre, rut, ciudad, email,
        banco: banco || null,
        tipo_cuenta: tipoCuenta || null,
        numero_cuenta: numeroCuenta || null,
        email_pagos: emailPagos || null,
      })
      .select()
      .single();
    checkError(error, "Error registrando persona natural");
    return mapPersona(data);
  },

  async obtenerPersona(id) {
    const { data, error } = await sb.from("personas_naturales").select("*").eq("id", id).maybeSingle();
    checkError(error, "Error obteniendo persona natural");
    return mapPersona(data);
  },

  async listarPersonas() {
    const { data, error } = await sb.from("personas_naturales").select("*").order("creado_en");
    checkError(error, "Error listando personas naturales");
    return data.map(mapPersona);
  },

  // ---------- Animales y casos ----------

  async crearCaso({ publicadorTipo, publicadorId, nombreAnimal, especie, tipoAyuda, metaRecaudacion, descripcion }, fotoFile = null) {
    if (publicadorTipo === "fundacion") {
      const fundacion = await this.obtenerFundacion(publicadorId);
      if (!fundacion) throw new Error("Fundación no encontrada");
      if (fundacion.estadoVerificacion !== "verificada") {
        throw new Error("Solo una fundación verificada puede publicar casos");
      }
    } else if (publicadorTipo === "persona") {
      const persona = await this.obtenerPersona(publicadorId);
      if (!persona) throw new Error("Persona no encontrada");
    } else {
      throw new Error("Tipo de publicador inválido");
    }

    let fotoUrl = null;
    if (fotoFile) {
      const nombreLimpio = sanitizeFileName(fotoFile.name);
      const path = `${publicadorId}/${Date.now()}_${nombreLimpio}`;
      const { error: upError } = await sb.storage.from("fotos-casos").upload(path, fotoFile);
      checkError(upError, "Error subiendo la foto");
      const { data: pub } = sb.storage.from("fotos-casos").getPublicUrl(path);
      fotoUrl = pub.publicUrl;
    }

    const { data: animal, error: animalError } = await sb
      .from("animales")
      .insert({ nombre: nombreAnimal, especie, estado: "en_tratamiento", foto_url: fotoUrl })
      .select()
      .single();
    checkError(animalError, "Error creando animal");

    const { data: caso, error: casoError } = await sb
      .from("casos")
      .insert({
        fundacion_id: publicadorTipo === "fundacion" ? publicadorId : null,
        persona_id: publicadorTipo === "persona" ? publicadorId : null,
        animal_id: animal.id,
        tipo_ayuda: tipoAyuda,
        descripcion,
        meta_recaudacion: Number(metaRecaudacion) || 0,
      })
      .select()
      .single();
    checkError(casoError, "Error creando caso");

    return { caso: mapCaso(caso), animal: mapAnimal(animal) };
  },

  async listarCasos(filtro = {}) {
    let query = sb.from("casos").select("*, animales(*), fundaciones(*), personas_naturales(*)").order("creado_en", { ascending: false });
    if (filtro.fundacionId) query = query.eq("fundacion_id", filtro.fundacionId);
    if (filtro.personaId) query = query.eq("persona_id", filtro.personaId);
    const { data, error } = await query;
    checkError(error, "Error listando casos");
    return data.map(mapCaso);
  },

  async obtenerCaso(casoId) {
    const { data, error } = await sb
      .from("casos")
      .select("*, animales(*), fundaciones(*), personas_naturales(*)")
      .eq("id", casoId)
      .maybeSingle();
    checkError(error, "Error obteniendo caso");
    if (!data) return null;

    const { data: donaciones, error: donError } = await sb
      .from("donaciones")
      .select("*")
      .eq("caso_id", casoId)
      .order("fecha");
    checkError(donError, "Error obteniendo donaciones");

    return { ...mapCaso(data), donaciones: donaciones.map(mapDonacion) };
  },

  // ---------- Borrar (solo administrador) ----------

  async eliminarCaso(casoId) {
    const { error } = await sb.from("casos").delete().eq("id", casoId);
    checkError(error, "Error eliminando caso (¿iniciaste sesión como admin?)");
  },

  async eliminarFundacion(fundacionId) {
    const { error } = await sb.from("fundaciones").delete().eq("id", fundacionId);
    checkError(error, "Error eliminando fundación (¿iniciaste sesión como admin?)");
  },

  async eliminarPersona(personaId) {
    const { error } = await sb.from("personas_naturales").delete().eq("id", personaId);
    checkError(error, "Error eliminando persona (¿iniciaste sesión como admin?)");
  },

  // ---------- Donaciones ----------

  async donar(casoId, { usuarioId = null, monto, nombreDonante }) {
    const { data: caso, error: casoError } = await sb
      .from("casos")
      .select("*")
      .eq("id", casoId)
      .single();
    checkError(casoError, "Error obteniendo caso");
    if (caso.estado !== "abierto") throw new Error("Este caso ya no recibe donaciones");

    const { data: donacion, error: donError } = await sb
      .from("donaciones")
      .insert({
        caso_id: casoId,
        usuario_id: usuarioId,
        nombre_donante: nombreDonante || "Donante anónimo",
        monto: Number(monto) || 0,
      })
      .select()
      .single();
    checkError(donError, "Error registrando donación");

    const nuevoRecaudado = Number(caso.recaudado) + Number(donacion.monto);
    const nuevoEstado = nuevoRecaudado >= Number(caso.meta_recaudacion) ? "cumplido" : caso.estado;

    const { data: casoActualizado, error: updError } = await sb
      .from("casos")
      .update({ recaudado: nuevoRecaudado, estado: nuevoEstado })
      .eq("id", casoId)
      .select()
      .single();
    checkError(updError, "Error actualizando el caso");

    return { donacion: mapDonacion(donacion), caso: mapCaso(casoActualizado) };
  },

  // ---------- Administrador (autenticación) ----------

  async loginAdmin(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    checkError(error, "Error al iniciar sesión");
    return data.user;
  },

  async logoutAdmin() {
    await sb.auth.signOut();
  },

  async sesionActual() {
    const { data } = await sb.auth.getSession();
    return data.session ? data.session.user : null;
  },

  async actualizarFundacion(fundacionId, campos) {
    const payload = {};
    if (campos.nombre !== undefined) payload.nombre = campos.nombre;
    if (campos.tipo !== undefined) payload.tipo = campos.tipo;
    if (campos.ciudad !== undefined) payload.ciudad = campos.ciudad;
    if (campos.email !== undefined) payload.email = campos.email;
    if (campos.banco !== undefined) payload.banco = campos.banco;
    if (campos.tipoCuenta !== undefined) payload.tipo_cuenta = campos.tipoCuenta;
    if (campos.numeroCuenta !== undefined) payload.numero_cuenta = campos.numeroCuenta;
    if (campos.rut !== undefined) payload.rut = campos.rut;
    if (campos.emailPagos !== undefined) payload.email_pagos = campos.emailPagos;

    const { data, error } = await sb
      .from("fundaciones")
      .update(payload)
      .eq("id", fundacionId)
      .select()
      .single();
    checkError(error, "Error actualizando fundación (¿iniciaste sesión como admin?)");
    return mapFundacion(data);
  },

  // ---------- Utilidades ----------

  async resumenFundacion(fundacionId) {
    const casos = await this.listarCasos({ fundacionId });
    return {
      casosActivos: casos.filter(c => c.estado === "abierto").length,
      casosCumplidos: casos.filter(c => c.estado === "cumplido").length,
      totalRecaudado: casos.reduce((sum, c) => sum + c.recaudado, 0),
    };
  },
};
