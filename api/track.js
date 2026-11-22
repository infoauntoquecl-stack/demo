// Registra eventos anónimos (sin IP, sin cookies, sin datos personales).
// Los verás en Vercel → tu proyecto → Logs, filtrando por "TRACK".
module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  let b = req.body;
  if (typeof b === "string") {
    try { b = JSON.parse(b); } catch (_) { b = {}; }
  }
  b = b || {};
  const ua = String(req.headers["user-agent"] || "");
  const ev = {
    t: new Date().toISOString(),
    e: String(b.e || "").slice(0, 30),
    s: String(b.s || "").slice(0, 10),
    p: String(b.p || "").slice(0, 30),
    d: /iPhone|iPad/.test(ua) ? "ios" : /Android/.test(ua) ? "android" : "otro"
  };
  console.log("TRACK " + JSON.stringify(ev));
  res.status(204).end();
};
