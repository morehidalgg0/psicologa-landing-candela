# Prompt para Claude Code — Landing de venta del ebook "Mañana empiezo"

> Pegá todo lo que está debajo de la línea en Claude Code, abierto en la carpeta del repo `psicologa-landing-candela`.
> Antes de pegarlo, completá los datos marcados con `⚠️ COMPLETAR` (o dejalos así: Claude Code los va a dejar como placeholders en un único archivo de configuración).

---

## Rol y objetivo

Actuá como desarrollador front-end senior + especialista en conversión (CRO) y en campañas de Meta Ads. Vas a construir, dentro de este repo, una **landing de venta profesional para el ebook "Mañana empiezo"** de la Lic. Candela Hidalgo, pensada para recibir tráfico frío de anuncios de Meta (Instagram + Facebook) y convertirlo en ventas en Hotmart.

La URL final tiene que ser: `https://candelahidalgo.com.ar/mananaempiezo/`

Trabajá en una rama nueva (`feat/landing-ebook-mananaempiezo`), con commits chicos y descriptivos en español (siguiendo el estilo del historial: `feat: ...`, `fix: ...`). No hagas push sin preguntarme.

## Contexto del producto

- **Título:** Mañana empiezo
- **Subtítulo:** Una guía simple para empezar lo que venís postergando
- **Autora:** Lic. Candela Hidalgo, psicóloga clínica (M.P. 49169), enfoque integrativo, consultorio en Pinamar y atención online.
- **Enfoque:** basado en ACT (Terapia de Aceptación y Compromiso).
- **Contenido:** 11 capítulos · ejercicios prácticos · plan de 7 días.
- **Formato:** ebook digital (PDF), descarga inmediata.
- **Plataforma de venta:** Hotmart (el checkout, el cobro en moneda local, la garantía y la entrega los resuelve Hotmart).
- **Mercado:** países de habla hispana (Argentina, México, Colombia, Chile, Perú, España, Uruguay, etc.). Escribí en español neutro-rioplatense amable (voseo suave, como en la portada: "lo que venís postergando"), sin modismos que no se entiendan fuera de Argentina.
- **Índice de capítulos:** ⚠️ COMPLETAR (pegá acá los 11 títulos de capítulo; si no están, dejá un placeholder claro en la config).
- **Precio:** ⚠️ COMPLETAR (ej. USD 9,90 / precio tachado USD 19,90 — solo si el precio anterior es real).
- **Link de checkout de Hotmart:** ⚠️ COMPLETAR (ej. `https://pay.hotmart.com/XXXXXXX`).
- **Meta Pixel ID:** ⚠️ COMPLETAR.

Las imágenes ya están en el repo:
- `mananaempiezo/img/portada.webp` — portada plana del libro (1024×1535).
- `mananaempiezo/img/mockup.webp` — mockup 3D del libro (1536×1024, fondo blanco).

## Lo primero: leé el repo antes de tocar nada

1. Leé `index.html`, `styles.css`, `script.js`, `neon-config.js` y `neon-schema.sql` para entender la estructura, la convención de nombres, cómo se arman los links de WhatsApp y cómo se inserta un turno de forma anónima en Neon (`appointments_insert`).
2. El sitio es **HTML + CSS + JS vanilla, sin build ni framework**. Mantené eso: nada de React, Tailwind, npm ni bundlers. Solo archivos estáticos que funcionen en cualquier hosting.
3. **No rompas nada existente**: la home, el sistema de turnos, `admin.html` y la integración con Neon tienen que seguir funcionando igual.

## Estructura de archivos a crear

```
mananaempiezo/
  index.html          ← landing de venta
  gracias.html        ← página post-compra (Hotmart redirige acá)
  test.html           ← lead magnet: test "¿Qué te frena a empezar?" (ver más abajo)
  config.js           ← TODOS los datos editables en un solo lugar
  landing.css         ← estilos propios de la landing
  landing.js          ← interacciones, tracking y UTMs
  img/                ← portada.webp, mockup.webp + og-image.jpg que generes
```

`config.js` tiene que exponer un objeto único, por ejemplo:

```js
window.EBOOK_CONFIG = {
  precio: "USD 9,90",            // ⚠️ COMPLETAR
  precioAnterior: null,          // solo si es real; si es null no se muestra tachado
  hotmartCheckoutUrl: "",        // ⚠️ COMPLETAR
  metaPixelId: "",               // ⚠️ COMPLETAR; si está vacío, no se carga el pixel
  whatsapp: "5492236683822",     // mismo número que usa la home
  capitulos: [ /* 11 títulos */ ],
  testimonios: [],               // vacío = la sección NO se renderiza
  garantiaDias: 7
};
```

Todo lo que dependa de estos datos (precio, botones, capítulos, testimonios) se renderiza desde la config. Así yo cambio precio o link sin tocar HTML.

## Identidad visual

La landing tiene que verse como **el libro**, no como la web de turnos, pero conectada con la marca de Candela.

**Paleta (sacada de la portada):**
- Crema fondo: `#FDF4E9` · crema cálido secundario: `#FEE3D0`
- Naranja principal (CTA y acentos): `#E56217`
- Marrón casi negro (títulos y texto fuerte): `#300C05`
- Rosa pastilla (badges, cajas suaves): `#F4CDC3`
- Salmón del reloj (ilustraciones, detalles): `#F0A08C`
- Rojo ladrillo para íconos chicos: aprox. `#A8321E`
- Verificá contraste AA en todos los textos sobre fondo (en especial blanco sobre naranja en los botones: si no da, usá marrón oscuro o un naranja más profundo).

**Tipografía:**
- Títulos: **Outfit** 700–800 (ya está cargada en la home y es la más parecida al título de la portada).
- Cuerpo: **Plus Jakarta Sans** (la misma de la home, para mantener coherencia de marca).
- Un detalle de marca: el subrayado curvo naranja que tiene "empiezo" en la portada → recrealo en SVG para subrayar palabras clave en los títulos.

**Estilo:** cálido, limpio, mucho aire, bordes redondeados, sombras suaves, motivo del reloj / "z z Z" como recurso gráfico sutil. Mobile-first (el 90% del tráfico de Meta es celular). Nada de estética de "vendehumo" (sin flechas rojas, sin textos en mayúsculas gritando, sin contadores falsos).

## Estructura de la landing (`mananaempiezo/index.html`)

Pensala como página de venta larga, orden de conversión. Escribí el copy completo (no lorem ipsum), en tono empático y profesional, coherente con ACT: no culpar, no prometer "curas", hablar de acción con valores, de aceptar la incomodidad y dar el primer paso.

1. **Barra superior mínima**: logo de texto "Mañana empiezo" + link discreto "por Lic. Candela Hidalgo" que lleva a la home. Sin menú de navegación completo (en una landing de anuncios, cada salida es una venta perdida). En mobile, **botón de compra sticky abajo** que aparece después de pasar el hero.
2. **Hero**: titular orientado al dolor/deseo (ej. "Dejá de esperar el momento perfecto para empezar"), subtítulo del libro, mockup 3D, badge "Basado en ACT · Lic. Candela Hidalgo", precio, CTA principal "Quiero empezar hoy" y microcopy de confianza debajo ("Descarga inmediata · Pago seguro con Hotmart · Garantía de 7 días").
3. **Identificación ("¿Te pasa esto?")**: 5–6 situaciones concretas de procrastinación con las que el lector se identifique (la lista de pendientes que crece, el lunes que nunca llega, la culpa de la noche, etc.).
4. **Reencuadre**: por qué no es falta de voluntad ni "ser vago" — explicación breve y accesible desde ACT (evitación de emociones incómodas, perfeccionismo, miedo a fallar). Este bloque es el que diferencia al libro de los "tips de productividad".
5. **Qué vas a encontrar**: los 3 pilares de la portada como tarjetas (11 capítulos · Ejercicios prácticos · Plan de 7 días) + **índice de capítulos en acordeón** renderizado desde `config.js`.
6. **El plan de 7 días**: línea de tiempo visual día por día (si no tengo el contenido exacto de cada día, dejá títulos genéricos marcados como placeholder en la config).
7. **Para quién es / para quién no es**: dos columnas honestas. En "para quién no es" incluí que el libro no reemplaza un tratamiento psicológico.
8. **Sobre la autora**: foto (`../fotocandela.jpeg`), nombre, M.P. 49169, enfoque integrativo, link "Conocé mi espacio terapéutico" a la home. Esto es autoridad real: es nuestro mayor diferencial frente a otros ebooks.
9. **Testimonios**: la sección solo se muestra si `testimonios` tiene elementos. **No inventes testimonios**: si está vacío, no se renderiza nada.
10. **Oferta**: caja destacada con mockup, lista de todo lo que incluye, precio, CTA grande, logos/textos de medios de pago genéricos ("Tarjeta, transferencia y medios locales según tu país") y el sello de garantía.
11. **Garantía**: bloque propio explicando la garantía de 7 días de Hotmart (si no te sirve, pedís el reembolso).
12. **FAQ en acordeón**: ¿En qué formato llega? ¿Cómo lo recibo? ¿Puedo pagar desde mi país y en mi moneda? ¿Es un tratamiento psicológico? ¿Cuánto tiempo me lleva? ¿Qué pasa si no me sirve? ¿Necesito saber algo de ACT?
13. **Cierre**: titular emocional final + CTA + link secundario "¿Tenés dudas? Escribime por WhatsApp" con mensaje prellenado sobre el ebook.
14. **Footer**: © año dinámico, "Lic. Candela Hidalgo · M.P. 49169", link a la home, aviso: "Este material es psicoeducativo y no reemplaza la atención psicológica profesional."

## Embudo y tracking para Meta

**Embudo:** Anuncio de Meta → landing → checkout de Hotmart → `gracias.html`. Camino alternativo para tráfico frío: Anuncio → `test.html` → resultado → landing/checkout.

**Meta Pixel (en `landing.js`, cargado solo si `metaPixelId` no está vacío):**
- `PageView` en todas las páginas.
- `ViewContent` en la landing (con `content_name: "Mañana empiezo"`, `content_type: "product"`, `value` y `currency`).
- `InitiateCheckout` al hacer click en cualquier botón de compra, antes de redirigir.
- `Lead` al completar el test y dejar datos.
- **No** dispares `Purchase` desde el sitio: el Purchase lo manda Hotmart (se configura el Pixel ID dentro de Hotmart). Dejá un comentario en el código explicándolo para no duplicar eventos.
- Agregá eventos de engagement con `trackCustom`: scroll al 50% y 90%, apertura de FAQ, click en WhatsApp. Sirven para armar públicos personalizados de remarketing.
- Preparalo para Conversions API a futuro: generá un `event_id` por evento y dejá un comentario indicando dónde se conectaría (no lo implementes ahora; no hay backend).

**UTMs y atribución:**
- Leé `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` y `fbclid` de la URL, guardalos en `sessionStorage` (con try/catch) y **pasalos al link de Hotmart** en todos los botones: agregá también `src` y `sck` (los parámetros de tracking de Hotmart) armados a partir de las UTMs, para ver en Hotmart qué campaña/anuncio vendió.
- Si el usuario entra por `test.html` y después pasa a la landing, las UTMs tienen que mantenerse.

**`gracias.html` (página post-compra):**
- Agradecimiento cálido, instrucciones claras de cómo acceder al ebook (llega por mail de Hotmart; revisar spam), e indicación de empezar por el Día 1 del plan.
- Siguiente paso del embudo (una sola oferta, sin abrumar): invitación a agendar una primera consulta con Candela (link a `/#agendar`) y/o a seguirla en Instagram (⚠️ COMPLETAR usuario).
- `noindex`.

## Lead magnet: `test.html` — "¿Qué te frena a empezar?"

Test corto de 6–8 preguntas de opción múltiple, una por pantalla, con barra de progreso, que devuelva uno de 3–4 perfiles (ej. "El perfeccionista", "El que espera tener ganas", "El abrumado", "El que evita lo incómodo"). Cada resultado tiene:
- una explicación breve y empática desde ACT,
- un mini-ejercicio para hacer hoy (valor real, gratis),
- qué capítulo del libro lo trabaja + CTA a la landing con el precio.

**Captura de datos (opcional para el usuario, antes de ver el resultado o como "recibí tu resultado completo"):** nombre + email o WhatsApp, con checkbox de consentimiento explícito. Guardalo en Neon siguiendo exactamente el mismo patrón de inserción anónima que usa `appointments`:
- Agregá al final de `neon-schema.sql` una tabla `ebook_leads` (id, created_at, nombre, email, whatsapp, perfil_resultado, utm_*, consentimiento) con política de **solo INSERT para `anonymous`** y lectura únicamente para `authenticated`. Nada de SELECT anónimo.
- Si Neon no está configurado o falla, el test igual muestra el resultado (nunca bloquear al usuario).
- Opcional: una pestaña o tabla simple en `admin.html` para que Candela vea los leads, reutilizando el login existente. Si complica demasiado, dejalo anotado como siguiente paso.

## Integración con la web principal

- En la home (`index.html`), agregá **un** acceso al ebook sin romper el diseño: un link "Ebook" en el menú y una sección/banner chico antes del footer ("Nuevo: Mañana empiezo — una guía basada en ACT para dejar de postergar") que lleve a `/mananaempiezo/`. Usá la paleta de la home en ese banner, solo con el mockup como imagen.

## SEO, redes y rendimiento

- `<title>`, meta description, canonical, Open Graph y Twitter Card completos en la landing y el test. Generá `img/og-image.jpg` de 1200×630 a partir del mockup sobre fondo crema (para que el link se vea bien al compartirlo por WhatsApp e Instagram).
- Datos estructurados JSON-LD tipo `Book` / `Product` con autora, precio y moneda tomados de la config.
- Imágenes con `width`/`height`, `loading="lazy"` excepto la del hero, `alt` descriptivos. Hero liviano: el LCP tiene que cargar rápido en 4G (es clave para el costo por resultado en Meta).
- Sin librerías externas salvo Google Fonts y el pixel. Animaciones solo con CSS/IntersectionObserver y respetando `prefers-reduced-motion`.
- Accesibilidad: jerarquía de headings correcta, acordeones con `button` + `aria-expanded`, foco visible, áreas táctiles de al menos 44px.

## Reglas de ética y políticas de Meta (importante)

- Nada de contadores regresivos falsos, escasez inventada, "últimas unidades" ni precios tachados que no sean reales.
- Nada de testimonios ni números inventados ("+10.000 lectores", etc.).
- No prometas resultados garantizados ni presentes el libro como tratamiento o cura. Es material psicoeducativo.
- Las políticas de Meta prohíben afirmar o insinuar atributos personales del usuario en los anuncios, y la coherencia entre anuncio y landing cuenta para la revisión. En los títulos usá formulaciones del tipo "Para quienes postergan…" o "Una guía para empezar lo que venís postergando" en lugar de "¿Sos procrastinador?". Agregá en un comentario al inicio de `index.html` 5 titulares y 5 textos de anuncio sugeridos que respeten esto, para usar en Meta Ads Manager.

## Verificación antes de terminar

1. Levantá un servidor local (`python3 -m http.server`) y revisá la landing, el test y la página de gracias en **375px, 768px y 1280px**. Corregí cualquier desborde o texto cortado.
2. Comprobá en consola que no haya errores y que los eventos del pixel se disparen en el momento correcto (logueá en consola en modo desarrollo cuando `metaPixelId` está vacío).
3. Probá que las UTMs de una URL como `/mananaempiezo/?utm_source=meta&utm_campaign=prueba&utm_content=video1` lleguen al link de Hotmart.
4. Verificá que la home y el sistema de turnos sigan funcionando igual que antes.
5. Al final, dame:
   - un resumen de lo que hiciste y los archivos tocados,
   - **la lista exacta de lo que tengo que completar** (precio, link de Hotmart, Pixel ID, índice, Instagram, testimonios) y dónde,
   - los pasos a configurar en Hotmart: Pixel de Meta en el producto, URL de página de agradecimiento → `https://candelahidalgo.com.ar/mananaempiezo/gracias.html`, y si conviene un order bump,
   - la consulta SQL a correr en Neon para crear `ebook_leads`.
