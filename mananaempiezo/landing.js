/**
 * =============================================================================
 *  MAÑANA EMPIEZO · landing.js
 *  Compartido por index.html, test.html y gracias.html.
 *  - Captura y persistencia de UTMs (sessionStorage) + armado del link a Hotmart
 *  - Meta Pixel (solo si hay metaPixelId) con event_id por evento
 *  - Render de contenido desde config.js (precio, capítulos, plan, testimonios)
 *  - Acordeones, CTA sticky, animaciones de entrada y tracking de engagement
 * =============================================================================
 */
(function () {
    'use strict';

    var CFG = window.EBOOK_CONFIG || {};
    var PAGE = document.body.getAttribute('data-page') || 'landing';
    var IS_DEV = /^(localhost|127\.0\.0\.1|\[::1\]|.*\.localhost|.*\.test)$/.test(location.hostname) ||
        location.protocol === 'file:';

    // -------------------------------------------------------------------------
    // 1. UTMs y atribución
    // -------------------------------------------------------------------------
    var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];
    var STORAGE_KEY = 'me_attribution';

    function readStored() {
        try {
            return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') || {};
        } catch (e) {
            return {};
        }
    }

    function captureAttribution() {
        var params = new URLSearchParams(location.search);
        var stored = readStored();
        var fresh = {};
        var hasFresh = false;
        UTM_KEYS.forEach(function (k) {
            var v = params.get(k);
            if (v) { fresh[k] = v.slice(0, 200); hasFresh = true; }
        });
        // Si la URL trae UTMs nuevas, pisan a las guardadas (último click).
        var merged = hasFresh ? fresh : stored;
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged)); } catch (e) { /* modo privado */ }
        return merged;
    }

    var ATTR = captureAttribution();

    /** Limpia un valor para los parámetros de Hotmart (sin espacios ni símbolos raros). */
    function slug(v) {
        return String(v || '').toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
    }

    /**
     * Link de checkout de Hotmart con atribución.
     * - Se reenvían las UTMs y el fbclid tal cual.
     * - `src`: origen del tráfico (utm_source) → aparece en los reportes de ventas de Hotmart.
     * - `sck`: código de seguimiento con campaña y anuncio (source_medium_campaign_content),
     *   para saber qué campaña/anuncio vendió desde Hotmart > Ventas > filtro "SCK".
     */
    function buildCheckoutUrl(extra) {
        var base = CFG.hotmartCheckoutUrl;
        if (!base) return '';
        var url;
        try { url = new URL(base); } catch (e) { return base; }
        UTM_KEYS.forEach(function (k) { if (ATTR[k]) url.searchParams.set(k, ATTR[k]); });
        var src = slug(ATTR.utm_source) || 'landing';
        var sckParts = [ATTR.utm_source, ATTR.utm_medium, ATTR.utm_campaign, ATTR.utm_content]
            .map(slug).filter(Boolean);
        url.searchParams.set('src', src);
        url.searchParams.set('sck', sckParts.length ? sckParts.join('_') : 'organico_' + PAGE);
        if (extra) Object.keys(extra).forEach(function (k) { url.searchParams.set(k, extra[k]); });
        return url.toString();
    }

    /** Agrega las UTMs guardadas a un link interno (ej. test → landing). */
    function withAttribution(href) {
        try {
            var url = new URL(href, location.href);
            UTM_KEYS.forEach(function (k) { if (ATTR[k] && !url.searchParams.has(k)) url.searchParams.set(k, ATTR[k]); });
            return url.pathname + url.search + url.hash;
        } catch (e) {
            return href;
        }
    }

    // -------------------------------------------------------------------------
    // 2. Meta Pixel
    //    IMPORTANTE: el evento Purchase NO se dispara desde este sitio.
    //    Lo envía Hotmart al confirmar el pago (se configura el Pixel ID dentro
    //    del producto en Hotmart > Herramientas > Pixel de rastreo). Si también
    //    lo mandáramos desde gracias.html, Meta contaría cada venta dos veces.
    // -------------------------------------------------------------------------
    var PIXEL_ON = Boolean(CFG.metaPixelId);

    if (PIXEL_ON) {
        /* eslint-disable */
        !function (f, b, e, v, n, t, s) {
            if (f.fbq) return; n = f.fbq = function () {
                n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
            };
            if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
            n.queue = []; t = b.createElement(e); t.async = !0;
            t.src = v; s = b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t, s)
        }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */
        window.fbq('init', CFG.metaPixelId);
    }

    function newEventId(name) {
        var rnd = (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
            : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        return name + '.' + rnd;
    }

    /**
     * Dispara un evento del Pixel. Devuelve el event_id generado.
     *
     * CONVERSIONS API (a futuro): cuando haya un backend (ej. una función
     * serverless), enviar acá mismo el evento al servidor con el mismo
     * `event_id`, `event_name`, `event_source_url`, `fbp`/`fbc` (cookies _fbp y
     * _fbc) y los datos de usuario hasheados. Meta deduplica navegador + servidor
     * usando ese event_id. No se implementa ahora porque el sitio es estático.
     */
    function track(name, params, custom) {
        var eventId = newEventId(name);
        params = params || {};
        if (PIXEL_ON && window.fbq) {
            window.fbq(custom ? 'trackCustom' : 'track', name, params, { eventID: eventId });
        }
        if (IS_DEV || !PIXEL_ON) {
            console.info('[pixel' + (PIXEL_ON ? '' : ':dev') + '] ' + (custom ? 'trackCustom ' : 'track ') + name, params, eventId);
        }
        return eventId;
    }

    var PRODUCT_PARAMS = {
        content_name: CFG.titulo || 'Mañana empiezo',
        content_type: 'product',
        content_ids: ['manana-empiezo-ebook'],
        value: CFG.precioValor,
        currency: CFG.moneda
    };

    // PageView en todas las páginas
    track('PageView');
    if (PAGE === 'landing') track('ViewContent', PRODUCT_PARAMS);

    // -------------------------------------------------------------------------
    // 3. Render desde la config
    // -------------------------------------------------------------------------
    function $(sel, ctx) { return (ctx || document).querySelector(sel); }
    function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    $all('[data-price]').forEach(function (el) { el.textContent = CFG.precio; });
    $all('[data-price-old]').forEach(function (el) {
        if (CFG.precioAnterior) { el.textContent = CFG.precioAnterior; el.hidden = false; }
        else el.hidden = true;
    });
    $all('[data-garantia]').forEach(function (el) { el.textContent = CFG.garantiaDias; });
    $all('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // WhatsApp
    $all('[data-wa]').forEach(function (el) {
        var msg = el.getAttribute('data-wa-text') || CFG.whatsappMensaje || '';
        el.href = 'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(msg);
        el.addEventListener('click', function () { track('WhatsAppClick', { page: PAGE }, true); });
    });

    // Instagram
    $all('[data-instagram]').forEach(function (el) {
        if (!CFG.instagram) { el.hidden = true; return; }
        el.hidden = false;
        var a = el.tagName === 'A' ? el : $('a', el);
        if (a) a.href = 'https://www.instagram.com/' + encodeURIComponent(CFG.instagram) + '/';
        $all('[data-instagram-user]', el).forEach(function (s) { s.textContent = '@' + CFG.instagram; });
    });

    // Capítulos
    var chapters = $('#chapters-list');
    if (chapters && Array.isArray(CFG.capitulos)) {
        chapters.innerHTML = CFG.capitulos.map(function (t, i) {
            return '<li><span class="ch-num">' + String(i + 1).padStart(2, '0') + '</span><span>' + esc(t) + '</span></li>';
        }).join('');
    }

    // Plan de 7 días
    var plan = $('#plan-days');
    if (plan && Array.isArray(CFG.planSieteDias)) {
        plan.innerHTML = CFG.planSieteDias.map(function (d, i) {
            return '<li class="day reveal"><span class="day-dot" aria-hidden="true">' + (i + 1) + '</span>' +
                '<div><p class="day-label">Día ' + (i + 1) + '</p><h3>' + esc(d.titulo) + '</h3><p>' + esc(d.texto) + '</p></div></li>';
        }).join('');
    }

    // Testimonios: solo si hay
    var testiSection = $('#testimonios');
    if (testiSection) {
        var list = Array.isArray(CFG.testimonios) ? CFG.testimonios.filter(function (t) { return t && t.texto; }) : [];
        if (list.length) {
            $('#testimonios-list').innerHTML = list.map(function (t) {
                return '<figure class="testi-card reveal"><blockquote>“' + esc(t.texto) + '”</blockquote>' +
                    '<figcaption><strong>' + esc(t.nombre || '') + '</strong>' +
                    (t.detalle ? ' · ' + esc(t.detalle) : '') + '</figcaption></figure>';
            }).join('');
            testiSection.hidden = false;
        } else {
            testiSection.remove();
        }
    }

    // Datos estructurados (Book + Product) desde la config
    if (PAGE === 'landing') {
        var ld = {
            '@context': 'https://schema.org',
            '@type': ['Book', 'Product'],
            name: CFG.titulo,
            alternateName: CFG.subtitulo,
            description: CFG.subtitulo + '. Guía psicoeducativa basada en ACT con 11 capítulos, ejercicios prácticos y un plan de 7 días.',
            image: CFG.siteUrl + 'img/portada-720.webp',
            url: CFG.siteUrl,
            inLanguage: 'es',
            bookFormat: 'https://schema.org/EBook',
            author: {
                '@type': 'Person',
                name: CFG.autora,
                jobTitle: 'Psicóloga clínica',
                url: 'https://candelahidalgo.com.ar/'
            },
            brand: { '@type': 'Person', name: CFG.autora },
            offers: {
                '@type': 'Offer',
                price: CFG.precioValor,
                priceCurrency: CFG.moneda,
                availability: 'https://schema.org/InStock',
                url: CFG.siteUrl
            }
        };
        var s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(ld);
        document.head.appendChild(s);
    }

    // -------------------------------------------------------------------------
    // 4. Botones de compra → InitiateCheckout + redirección a Hotmart
    // -------------------------------------------------------------------------
    $all('[data-buy]').forEach(function (btn) {
        var href = buildCheckoutUrl();
        if (href) btn.href = href;
        btn.addEventListener('click', function (ev) {
            var target = buildCheckoutUrl();
            track('InitiateCheckout', Object.assign({ num_items: 1, placement: btn.getAttribute('data-buy') || '' }, PRODUCT_PARAMS));
            if (!target) {
                ev.preventDefault();
                console.warn('[mananaempiezo] Falta hotmartCheckoutUrl en config.js');
                return;
            }
            // Abrir en pestaña nueva (cmd/ctrl/shift/clic medio) → no interferir.
            if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;
            ev.preventDefault();
            // Pequeña espera para que el Pixel alcance a enviar el evento.
            setTimeout(function () { location.href = target; }, PIXEL_ON ? 300 : 0);
        });
    });

    // Links internos que tienen que conservar UTMs (test ↔ landing)
    $all('[data-keep-utm]').forEach(function (a) {
        a.href = withAttribution(a.getAttribute('href'));
    });

    // -------------------------------------------------------------------------
    // 5. Acordeones (índice y FAQ)
    // -------------------------------------------------------------------------
    $all('.acc-btn').forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        btn.addEventListener('click', function () {
            var open = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', String(!open));
            panel.hidden = open;
            if (!open && btn.hasAttribute('data-faq')) {
                track('FAQOpen', { question: btn.textContent.trim().slice(0, 80) }, true);
            }
        });
    });

    // -------------------------------------------------------------------------
    // 6. CTA sticky en mobile (aparece al pasar el hero, se oculta en la oferta)
    // -------------------------------------------------------------------------
    var sticky = $('#sticky-cta');
    var hero = $('#hero');
    var offer = $('#oferta');
    if (sticky && hero && 'IntersectionObserver' in window) {
        var heroVisible = true, offerVisible = false;
        var update = function () {
            var show = !heroVisible && !offerVisible;
            sticky.classList.toggle('is-visible', show);
            sticky.setAttribute('aria-hidden', String(!show));
            $all('a', sticky).forEach(function (a) { a.tabIndex = show ? 0 : -1; });
        };
        new IntersectionObserver(function (e) { heroVisible = e[0].isIntersecting; update(); }, { threshold: 0 }).observe(hero);
        if (offer) new IntersectionObserver(function (e) { offerVisible = e[0].isIntersecting; update(); }, { threshold: 0.15 }).observe(offer);
        update();
    }

    // -------------------------------------------------------------------------
    // 7. Engagement: scroll 50% / 90%
    // -------------------------------------------------------------------------
    var marks = { 50: false, 90: false };
    var onScroll = function () {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        if (max <= 0) return;
        var pct = (window.scrollY / max) * 100;
        [50, 90].forEach(function (m) {
            if (!marks[m] && pct >= m) { marks[m] = true; track('Scroll' + m, { page: PAGE }, true); }
        });
        if (marks[90]) window.removeEventListener('scroll', onScroll);
    };
    if (PAGE !== 'test') window.addEventListener('scroll', onScroll, { passive: true });

    // -------------------------------------------------------------------------
    // 8. Animaciones de entrada (respetan prefers-reduced-motion vía CSS)
    // -------------------------------------------------------------------------
    var reveals = $all('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add('is-in'); });
    }

    // API pública para test.js
    window.ME = {
        config: CFG,
        attribution: function () { return Object.assign({}, ATTR); },
        track: track,
        buildCheckoutUrl: buildCheckoutUrl,
        withAttribution: withAttribution,
        isDev: IS_DEV
    };
})();
