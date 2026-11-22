# Demo perfil digital NFC

Página estática + una función `/api/track` que registra eventos anónimos.

## Publicar en Vercel
Desde esta carpeta, en tu computador:

    npx vercel        # primera vez: inicia sesión y acepta los valores por defecto
    npx vercel --prod # publica en producción

## Probar la medición
Abre la URL con parámetros:

    https://TU-PROYECTO.vercel.app/?s=nfc&p=mesa1
    https://TU-PROYECTO.vercel.app/?s=qr&p=caja

`s` = origen (nfc / qr), `p` = id de la pieza. Los eventos (view, click_whatsapp,
click_resena, etc.) aparecen en Vercel → Logs buscando "TRACK".

## Escribir el tag NFC
Graba en el tag (tipo URL/NDEF) la dirección con `?s=nfc&p=ID`.
Bloquea el tag contra reescritura al terminar.

## Personalizar
Edita el objeto NEGOCIO al inicio del script en index.html
(WhatsApp, Instagram, mapa, link de reseña de Google con su Place ID).
