// Informe para el dueño del negocio.
// Uso: /api/informe?n=demo&k=TU_TOKEN&dias=7
// Requiere las variables SUPABASE_URL, SUPABASE_SERVICE_KEY e INFORME_TOKEN.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const NOMBRES = {
  click_whatsapp: "WhatsApp", click_agenda: "Agendar", click_resena: "Reseña en Google",
  click_mapa: "Cómo llegar", click_instagram: "Instagram", click_llamar: "Llamar", click_contacto: "Guardar contacto"
};

function cuenta(arr, fn) {
  const m = {};
  arr.forEach(x => { const k = fn(x); m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function barras(filas, etiqueta) {
  if (!filas.length) return '<p class="mut">Sin datos todavía.</p>';
  const max = Math.max(...filas.map(f => f[1]));
  return filas.map(([k, v]) =>
    '<div class="fila"><span class="et">' + esc(etiqueta ? etiqueta(k) : k) + '</span>' +
    '<span class="bar"><i style="width:' + Math.max(4, Math.round(v / max * 100)) + '%"></i></span>' +
    '<b>' + v + '</b></div>').join("");
}

module.exports = async (req, res) => {
  const { n = "demo", k = "", dias = "7" } = req.query || {};
  const TOKEN = process.env.INFORME_TOKEN;
  if (!TOKEN || k !== TOKEN) { res.status(401).send("No autorizado"); return; }
  const URL_ = process.env.SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!URL_ || !KEY) { res.status(500).send("Falta configurar la base de datos"); return; }

  const nd = Math.min(Math.max(parseInt(dias, 10) || 7, 1), 90);
  const neg = String(n).toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40) || "demo";
  const desde = new Date(Date.now() - nd * 86400000).toISOString();
  const url = URL_ + "/rest/v1/eventos?select=evento,origen,pieza,dispositivo,created_at" +
    "&negocio=eq." + encodeURIComponent(neg) + "&created_at=gte." + encodeURIComponent(desde) +
    "&order=created_at.desc&limit=10000";

  let rows = [];
  try {
    const r = await fetch(url, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) { res.status(502).send("Error al leer la base de datos (" + r.status + ")"); return; }
    rows = await r.json();
  } catch (e) { res.status(502).send("Error al leer la base de datos"); return; }

  const vistas = rows.filter(x => x.evento === "view");
  const clics = rows.filter(x => x.evento.startsWith("click_"));
  const nfc = vistas.filter(x => x.origen === "nfc").length;
  const qr = vistas.filter(x => x.origen === "qr").length;
  const fmt = (d, o) => new Date(d).toLocaleString("es-CL", Object.assign({ timeZone: "America/Santiago" }, o));
  const porHora = cuenta(vistas, x => fmt(x.created_at, { hour: "2-digit", hour12: false }) + ":00").sort((a, b) => a[0].localeCompare(b[0]));
  const porDia = cuenta(vistas, x => fmt(x.created_at, { weekday: "long" }));
  const tasa = vistas.length ? Math.round(clics.length / vistas.length * 100) : 0;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).send(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Informe · ${esc(neg)}</title>
<style>
body{margin:0;font-family:system-ui,sans-serif;background:#0b1020;color:#eef1ff;padding:20px}
main{max-width:560px;margin:auto}h1{font-size:22px;margin:0 0 4px}.mut{color:#9aa6d1;font-size:13px}
.kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:18px 0}
.kpi{background:#131a30;border:1px solid #27315a;border-radius:14px;padding:14px;text-align:center}
.kpi b{display:block;font-size:26px}.kpi span{font-size:12px;color:#9aa6d1}
section{background:#131a30;border:1px solid #27315a;border-radius:14px;padding:14px;margin-bottom:12px}
h2{font-size:14px;margin:0 0 10px;color:#4f8cff}
.fila{display:flex;align-items:center;gap:8px;margin:6px 0;font-size:13px}
.et{width:130px;flex:none}.bar{flex:1;background:#1a2342;border-radius:6px;height:10px;overflow:hidden}
.bar i{display:block;height:100%;background:linear-gradient(90deg,#4f8cff,#7c5cff)}
</style></head><body><main>
<h1>Informe de ${esc(neg)}</h1>
<p class="mut">Últimos ${nd} días · datos anónimos, sin información personal</p>
<div class="kpis">
<div class="kpi"><b>${vistas.length}</b><span>toques / visitas</span></div>
<div class="kpi"><b>${clics.length}</b><span>clics en botones</span></div>
<div class="kpi"><b>${tasa}%</b><span>visitas con clic</span></div>
</div>
<section><h2>Cómo llegaron</h2>${barras([["NFC", nfc], ["QR", qr], ["Directo / otro", vistas.length - nfc - qr]].filter(f => f[1] > 0))}</section>
<section><h2>Qué botones usaron</h2>${barras(cuenta(clics, x => x.evento), k2 => NOMBRES[k2] || k2)}</section>
<section><h2>Por pieza</h2>${barras(cuenta(vistas, x => x.pieza || "-"))}</section>
<section><h2>Por hora del día</h2>${barras(porHora)}</section>
<section><h2>Por día de la semana</h2>${barras(porDia)}</section>
<p class="mut">Los clics a "Reseña en Google" indican interés; que la reseña se publique depende de cada cliente.</p>
</main></body></html>`);
};
