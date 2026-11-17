/**
 * =============================================================================
 *  CONFIGURACIÓN DEL EBOOK "MAÑANA EMPIEZO"
 *  -----------------------------------------------------------------------------
 *  Todos los datos editables de la landing, el test y la página de gracias
 *  viven acá. Cambiá precio, link de Hotmart, Pixel, capítulos, etc. sin tocar
 *  el HTML.
 *
 *  Buscá "⚠️ COMPLETAR" para ver lo que falta cargar.
 * =============================================================================
 */
window.EBOOK_CONFIG = {
    titulo: "Mañana empiezo",
    subtitulo: "Una guía simple para empezar lo que venís postergando",
    autora: "Lic. Candela Hidalgo",
    matricula: "M.P. 49169",
    siteUrl: "https://candelahidalgo.com.ar/mananaempiezo/",

    // ---------------------------------------------------------------------
    // PRECIO (el que cobra Hotmart; Hotmart lo convierte a la moneda local)
    // ---------------------------------------------------------------------
    precio: "USD 9,99",          // texto que se muestra
    precioValor: 9.99,           // número (para el Pixel y los datos estructurados)
    moneda: "USD",
    precioAnterior: null,        // ej. "USD 19,99" SOLO si fue un precio real. null = no se muestra tachado.

    // ---------------------------------------------------------------------
    // HOTMART Y META
    // ---------------------------------------------------------------------
    hotmartCheckoutUrl: "",      // ⚠️ COMPLETAR: ej. "https://pay.hotmart.com/XXXXXXXX"
    metaPixelId: "",             // ⚠️ COMPLETAR: si queda vacío, no se carga el Pixel (los eventos se loguean en consola)

    // ---------------------------------------------------------------------
    // CONTACTO
    // ---------------------------------------------------------------------
    whatsapp: "5492236683822",   // mismo número que usa la home
    whatsappMensaje: "Hola Candela, tengo una consulta sobre el ebook \"Mañana empiezo\".",
    instagram: "",               // ⚠️ COMPLETAR: usuario sin @ (ej. "lic.candelahidalgo"). Vacío = no se muestra.

    garantiaDias: 7,

    // ---------------------------------------------------------------------
    // ÍNDICE (11 capítulos) — ⚠️ COMPLETAR con los títulos reales
    // ---------------------------------------------------------------------
    capitulos: [
        "Capítulo 1 · (título pendiente)",
        "Capítulo 2 · (título pendiente)",
        "Capítulo 3 · (título pendiente)",
        "Capítulo 4 · (título pendiente)",
        "Capítulo 5 · (título pendiente)",
        "Capítulo 6 · (título pendiente)",
        "Capítulo 7 · (título pendiente)",
        "Capítulo 8 · (título pendiente)",
        "Capítulo 9 · (título pendiente)",
        "Capítulo 10 · (título pendiente)",
        "Capítulo 11 · (título pendiente)"
    ],

    // ---------------------------------------------------------------------
    // PLAN DE 7 DÍAS — ⚠️ COMPLETAR: títulos genéricos de referencia.
    // Reemplazalos por los del libro.
    // ---------------------------------------------------------------------
    planSieteDias: [
        { titulo: "Darte cuenta", texto: "Identificás qué estás postergando y qué te pasa cuando pensás en hacerlo." },
        { titulo: "Lo que te importa", texto: "Conectás esa tarea con algo que valorás de verdad, no con un “debería”." },
        { titulo: "Hacer lugar a la incomodidad", texto: "Practicás notar la resistencia sin pelearte con ella ni obedecerle." },
        { titulo: "El paso más chico posible", texto: "Achicás la tarea hasta que empezar sea casi inevitable." },
        { titulo: "Empezar sin ganas", texto: "Probás actuar aunque la motivación no haya llegado todavía." },
        { titulo: "Cuando aparece la autocrítica", texto: "Aprendés a tomar distancia de la voz que dice “no alcanza”." },
        { titulo: "Sostener el movimiento", texto: "Armás tu forma de seguir, con margen para los días difíciles." }
    ],

    // ---------------------------------------------------------------------
    // TESTIMONIOS — vacío = la sección NO se muestra. No inventar testimonios.
    // Formato: { texto: "...", nombre: "Sofía", detalle: "Buenos Aires" }
    // ---------------------------------------------------------------------
    testimonios: [],

    // ---------------------------------------------------------------------
    // TEST "¿Qué te frena a empezar?" — capítulo del libro que trabaja cada
    // perfil (número del 1 al 11). ⚠️ COMPLETAR cuando tengas el índice.
    // ---------------------------------------------------------------------
    capituloPorPerfil: {
        perfeccionismo: 3,
        ganas: 4,
        agobio: 5,
        incomodidad: 6
    }
};
