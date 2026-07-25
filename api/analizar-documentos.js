// /api/analizar-documentos.js
//
// Se llama desde el navegador (app.js) justo después de subir los
// documentos del paso 2 del registro de fundación. Esta función:
//  1. Lee los datos de la fundación y sus documentos desde Supabase
//     (usando la Secret key, que nunca se expone al navegador).
//  2. Descarga cada documento y se lo manda a Gemini para que revise
//     legibilidad y si coincide con los datos del formulario.
//  3. Guarda el resultado en documentos_fundacion y actualiza
//     fundaciones.estado_verificacion.
//
// Variables de entorno necesarias (configurar en Vercel > Settings > Environment Variables):
//   SUPABASE_URL          -> https://jjkcraowdlkknniwqpag.supabase.co
//   SUPABASE_SECRET_KEY   -> la "Secret key" (sb_secret_...) de Supabase
//   GEMINI_API_KEY        -> tu clave de Google AI Studio

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function mimeTypeDeArchivo(nombre) {
  const ext = nombre.split(".").pop().toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}

async function supabaseFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_SECRET_KEY,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  return res;
}

async function descargarDocumento(pathEnStorage) {
  const res = await supabaseFetch(`/storage/v1/object/documentos-fundacion/${pathEnStorage}`, {
    headers: {},
  });
  if (!res.ok) throw new Error(`No se pudo descargar el documento: ${pathEnStorage}`);
  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

async function analizarConGemini(fundacion, documentosConBase64) {
  const partesDocumentos = documentosConBase64.map((doc) => ({
    inline_data: { mime_type: doc.mimeType, data: doc.base64 },
  }));

  const prompt = `
Eres un asistente que ayuda a pre-revisar documentos de fundaciones sin fines de lucro en Chile, antes de una confirmación humana final.

Datos que la fundación ingresó en su formulario de registro:
- Nombre: ${fundacion.nombre}
- RUT: ${fundacion.rut || "no informado"}
- Ciudad: ${fundacion.ciudad || "no informado"}

Te voy a mostrar ${documentosConBase64.length} documento(s) subido(s) por esta fundación, en el mismo orden que te los listo aquí:
${documentosConBase64.map((d, i) => `${i + 1}. ${d.nombreArchivo}`).join("\n")}

Para cada documento, evalúa:
- ¿Es legible? (se puede leer el texto con claridad, no está cortado, borroso o vacío)
- ¿Qué tipo de documento parece ser? (ej: certificado de personalidad jurídica, RUT, estatutos, cédula, otro)
- ¿Qué nombre y RUT aparecen en el documento, si se pueden leer?
- ¿Los datos del documento coinciden razonablemente con el nombre y RUT del formulario de arriba?

Responde SOLO con un JSON válido, sin texto adicional ni marcadores de código, con esta forma exacta:
{
  "documentos": [
    {
      "nombre_archivo": "...",
      "legible": true,
      "tipo_documento_detectado": "...",
      "nombre_extraido": "...",
      "rut_extraido": "...",
      "coincide_formulario": true,
      "observaciones": "..."
    }
  ],
  "resultado_general": "aprobado_para_revision_oficial"
}

"resultado_general" debe ser "aprobado_para_revision_oficial" solo si TODOS los documentos son legibles y coinciden con el formulario. Si algún documento no es legible o no coincide, "resultado_general" debe ser "rechazado".
`.trim();

  const body = {
    contents: [{ parts: [{ text: prompt }, ...partesDocumentos] }],
    generationConfig: { responseMimeType: "application/json" },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Error llamando a Gemini: ${errText}`);
  }

  const data = await res.json();
  const textoRespuesta = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textoRespuesta) throw new Error("Gemini no devolvió una respuesta utilizable.");

  return JSON.parse(textoRespuesta);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  try {
    const { fundacionId } = req.body;
    if (!fundacionId) {
      res.status(400).json({ error: "Falta fundacionId" });
      return;
    }

    // 1. Traer datos de la fundación
    const resFundacion = await supabaseFetch(`/rest/v1/fundaciones?id=eq.${fundacionId}&select=*`);
    const fundaciones = await resFundacion.json();
    const fundacion = fundaciones[0];
    if (!fundacion) throw new Error("Fundación no encontrada");

    // 2. Traer sus documentos
    const resDocs = await supabaseFetch(`/rest/v1/documentos_fundacion?fundacion_id=eq.${fundacionId}&select=*`);
    const documentos = await resDocs.json();
    if (documentos.length === 0) throw new Error("Esta fundación no tiene documentos subidos");

    // 3. Descargar cada documento y convertirlo a base64
    const documentosConBase64 = [];
    for (const doc of documentos) {
      const base64 = await descargarDocumento(doc.url_archivo);
      documentosConBase64.push({
        id: doc.id,
        nombreArchivo: doc.nombre_archivo,
        mimeType: mimeTypeDeArchivo(doc.nombre_archivo),
        base64,
      });
    }

    // 4. Analizar con Gemini
    const resultado = await analizarConGemini(fundacion, documentosConBase64);

    // 5. Guardar el resultado de cada documento
    for (const docResultado of resultado.documentos) {
      const docOriginal = documentosConBase64.find((d) => d.nombreArchivo === docResultado.nombre_archivo);
      if (!docOriginal) continue;

      await supabaseFetch(`/rest/v1/documentos_fundacion?id=eq.${docOriginal.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          legible: docResultado.legible,
          tipo_documento_detectado: docResultado.tipo_documento_detectado,
          nombre_extraido: docResultado.nombre_extraido,
          rut_extraido: docResultado.rut_extraido,
          coincide_formulario: docResultado.coincide_formulario,
          observaciones_ia: docResultado.observaciones,
          analizado_en: new Date().toISOString(),
        }),
      });
    }

    // 6. Actualizar el estado de la fundación según el resultado general
    const nuevoEstado =
      resultado.resultado_general === "aprobado_para_revision_oficial"
        ? "pendiente_confirmacion_oficial"
        : "rechazada_automatica";

    await supabaseFetch(`/rest/v1/fundaciones?id=eq.${fundacionId}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ estado_verificacion: nuevoEstado }),
    });

    res.status(200).json({ ok: true, estado: nuevoEstado });
  } catch (err) {
    console.error("Error en analizar-documentos:", err);
    res.status(500).json({ error: err.message });
  }
};
