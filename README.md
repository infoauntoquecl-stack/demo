# InfoAUnToque · demo de perfil digital NFC

Página estática + funciones serverless que guardan eventos anónimos y muestran un informe.

## URL de cada tag
    https://TU-PROYECTO.vercel.app/?n=NEGOCIO&s=nfc&p=PIEZA

- `n` = id del negocio (demo, barberia-x...)
- `s` = origen (`nfc` o `qr`)
- `p` = id de la pieza (mesa1, caja, barbero1...)

## Guardar eventos (Supabase)
1. Crea un proyecto en supabase.com y ejecuta `supabase/schema.sql` en SQL Editor.
2. En Vercel → proyecto → Settings → Environment Variables, agrega:
   - `SUPABASE_URL` (Project Settings → API → Project URL)
   - `SUPABASE_SERVICE_KEY` (clave `service_role`; es secreta, nunca la pegues en un chat ni en el código)
   - `INFORME_TOKEN` (una clave larga inventada por ti, para proteger el informe)
3. Redeploy (Deployments → ⋯ → Redeploy).

Sin esas variables, los eventos solo se ven en Vercel → Logs buscando `TRACK`.

## Informe para el dueño
    https://TU-PROYECTO.vercel.app/api/informe?n=NEGOCIO&k=INFORME_TOKEN&dias=7

Muestra toques, clics por botón, origen NFC/QR, piezas, horas y días. Anónimo: no guarda IP ni cookies.

## Personalizar
Edita el objeto NEGOCIO al inicio del script en `index.html`.
