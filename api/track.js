// Registra eventos anónimos (sin IP, sin cookies, sin datos personales).
// Siempre escribe en los logs de Vercel (buscar "TRACK"); si hay base de datos
// configurada (SUPABASE_URL y SUPABASE_SERVICE_KEY), además los guarda ahí.
const clean = (s, n) => String(s || "").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  let b = req.body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch (_) { b = {}; }
  }
  b = b || {};

  const evento = clean(b.e, 30);
  // Solo aceptamos los eventos que la página realmente envía.
  if (evento !== "view" && !evento.startsWith("click_")) {
    res.status(204).end();
    return;
  }

  const ua = String(req.headers["user-agent"] || "");
  const ev = {
    negocio: clean(b.n, 40) || "demo",
    evento,
    origen: clean(b.s, 10),
    pieza: clean(b.p, 30),
    dispositivo: /iPhone|iPad/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : "otro"
  };
  console.log("TRACK " + JSON.stringify(ev));

  const URL_ = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_KEY;
  if (URL_ && KEY) {
    try {
      const r = await fetch(URL_ + "/rest/v1/eventos", {
        method: "POST",
        headers: {
          apikey: KEY,
          Authorization: "Bearer " + KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(ev)
      });
      if (!r.ok) console.error("TRACK_DB_ERROR " + r.status);
    } catch (e) {
      console.error("TRACK_DB_ERROR " + e.message);
    }
  }
  res.status(204).end();
};
