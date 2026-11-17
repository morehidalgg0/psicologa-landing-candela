/**
 * Test "¿Qué te frena a empezar?" — lead magnet de Mañana empiezo.
 * 7 preguntas → 4 perfiles. La captura de datos es opcional y nunca bloquea
 * el resultado (si Neon no responde, el resultado se muestra igual).
 */
(function () {
    'use strict';

    var ME = window.ME;
    var CFG = window.EBOOK_CONFIG || {};

    // p = perfeccionismo · g = esperar tener ganas · a = agobio · i = evitar lo incómodo
    var QUESTIONS = [
        {
            q: 'Cuando pensás en eso que venís postergando, ¿qué aparece primero?',
            o: [
                ['p', 'Que no me va a salir lo suficientemente bien.'],
                ['g', 'Que hoy no tengo energía; mejor cuando tenga más ganas.'],
                ['a', 'Que es demasiado y no sé por dónde empezar.'],
                ['i', 'Una sensación incómoda que prefiero no sentir.']
            ]
        },
        {
            q: 'Cuando por fin te sentás a hacerlo…',
            o: [
                ['p', 'Reviso y corrijo tanto que avanzo muy poco.'],
                ['g', 'Si no me engancho en los primeros minutos, lo dejo.'],
                ['a', 'Salto de una cosa a otra sin terminar ninguna.'],
                ['i', 'De repente aparece algo “más urgente” para hacer.']
            ]
        },
        {
            q: '¿Qué frase te suena más?',
            o: [
                ['p', '“Si lo voy a hacer, que sea bien.”'],
                ['g', '“Cuando tenga ganas, lo hago.”'],
                ['a', '“Tengo tantas cosas que no sé cuál elegir.”'],
                ['i', '“Prefiero no pensar en eso ahora.”']
            ]
        },
        {
            q: 'Tenés un fin de semana libre. Con lo pendiente…',
            o: [
                ['p', 'Espero un bloque de tiempo ideal para hacerlo como corresponde.'],
                ['g', 'Veo si me levanto con ánimo y decido en el momento.'],
                ['a', 'Armo una lista enorme y me canso antes de empezar.'],
                ['i', 'Busco otras cosas para hacer y así no pensarlo.']
            ]
        },
        {
            q: 'Si alguien te pregunta cómo va eso que querías hacer…',
            o: [
                ['p', 'Me da pudor mostrar algo que todavía no está bien.'],
                ['g', 'Digo que estoy esperando el momento.'],
                ['a', 'Explico todo lo que tengo encima.'],
                ['i', 'Cambio de tema lo más rápido posible.']
            ]
        },
        {
            q: 'Después de postergarlo otra vez, ¿qué sentís?',
            o: [
                ['p', 'Que tengo que exigirme todavía más.'],
                ['g', 'Que mañana voy a tener más energía.'],
                ['a', 'Que la montaña se hizo más grande.'],
                ['i', 'Alivio en el momento y culpa después.']
            ]
        },
        {
            q: '¿Qué te ayudaría más hoy?',
            o: [
                ['p', 'Animarme a hacerlo “suficientemente bien”.'],
                ['g', 'Poder empezar aunque no tenga ganas.'],
                ['a', 'Saber cuál es el primer paso concreto.'],
                ['i', 'Poder estar con la incomodidad sin escaparme.']
            ]
        }
    ];

    var PROFILES = {
        p: {
            key: 'perfeccionismo',
            title: 'Lo que más te frena: el perfeccionismo',
            body: [
                'Cuando la vara está muy alta, empezar se siente como rendir un examen. Postergar, en ese contexto, es una forma de evitar la posibilidad de que algo salga “mal”.',
                'Desde ACT no se trata de convencerte de que lo vas a hacer perfecto, sino de notar que <strong>“tiene que salir bien” es un pensamiento</strong>, no una orden. Podés escucharlo sin dejar que decida por vos.'
            ],
            exTitle: 'El borrador permitido (10 minutos)',
            ex: [
                'Elegí una sola tarea de las que venís postergando.',
                'Poné un temporizador de 10 minutos con una consigna: hacer una versión imperfecta a propósito.',
                'Cuando aparezca “esto no alcanza”, decilo así: “Estoy teniendo el pensamiento de que no alcanza”. Y seguí.',
                'Al terminar, anotá qué pasó. No lo que salió: lo que te animaste a hacer.'
            ]
        },
        g: {
            key: 'ganas',
            title: 'Lo que más te frena: esperar a tener ganas',
            body: [
                'Es muy común esperar a sentirse con energía o motivación para empezar. El problema es que, muchas veces, las ganas llegan <strong>después</strong> de empezar, no antes.',
                'ACT propone guiarte por lo que te importa y no solo por cómo te sentís en el momento. Podés no tener ganas y, aun así, dar un paso pequeño.'
            ],
            exTitle: 'Dos minutos con sentido',
            ex: [
                'Escribí en una línea por qué te importa eso que postergás. No un “debería”: algo que valorás (cuidarte, crecer, cumplir con alguien que querés).',
                'Definí la versión de dos minutos de la tarea (abrir el archivo, ponerte las zapatillas, escribir el asunto del mail).',
                'Hacela ahora, con o sin ganas. Solo dos minutos.',
                'Si querés seguir, seguí. Si no, ya empezaste: eso cuenta.'
            ]
        },
        a: {
            key: 'agobio',
            title: 'Lo que más te frena: el agobio',
            body: [
                'Cuando todo parece igual de urgente e importante, la mente se satura y la respuesta más común es quedarse quieto. No es falta de capacidad: es demasiada carga junta.',
                'Desde ACT, una forma de salir es <strong>volver al presente</strong>: no tenés que resolver toda la lista, solo elegir el próximo paso.'
            ],
            exTitle: 'Un solo paso visible',
            ex: [
                'Volcá todo lo pendiente en una hoja, sin ordenar. Sacarlo de la cabeza ya alivia.',
                'Marcá una sola cosa que, si avanzara, te daría tranquilidad.',
                'Escribí el paso más chico posible de esa tarea (tan chico que te dé un poco de risa).',
                'Hacelo hoy. El resto de la lista puede esperar en el papel.'
            ]
        },
        i: {
            key: 'incomodidad',
            title: 'Lo que más te frena: evitar lo incómodo',
            body: [
                'Postergar alivia: en el momento en que lo dejás para después, la ansiedad o el malestar bajan. Por eso se repite. Pero a largo plazo, lo evitado suele hacerse más grande.',
                'ACT propone algo distinto a pelear con la emoción o escaparle: <strong>hacerle lugar</strong> y avanzar igual, con la incomodidad al lado.'
            ],
            exTitle: 'Nombrar y hacer lugar (5 minutos)',
            ex: [
                'Antes de empezar, hacé tres respiraciones lentas.',
                'Nombrá lo que sentís: “Acá está la ansiedad” o “Acá está el fastidio”. Notá en qué parte del cuerpo aparece.',
                'Decite: “Puedo sentir esto y hacer algo igual”.',
                'Dedicale cinco minutos a la tarea con esa sensación presente. No hace falta que se vaya.'
            ]
        }
    };

    var ORDER = ['p', 'g', 'a', 'i'];
    var answers = new Array(QUESTIONS.length);
    var current = 0;
    var resultKey = null;
    var started = false;

    function $(id) { return document.getElementById(id); }

    function show(id) {
        ['screen-intro', 'screen-quiz', 'screen-lead', 'screen-result'].forEach(function (s) {
            $(s).hidden = s !== id;
        });
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    function focusEl(el) { if (el) { try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } } }

    function renderQuestion() {
        var q = QUESTIONS[current];
        $('q-count').textContent = 'Pregunta ' + (current + 1) + ' de ' + QUESTIONS.length;
        $('q-title').textContent = q.q;
        $('btn-back').disabled = current === 0;
        var pct = (current / QUESTIONS.length) * 100;
        $('progress-fill').style.width = pct + '%';
        $('progress-bar').setAttribute('aria-valuenow', String(current));
        var box = $('q-options');
        box.innerHTML = '';
        q.o.forEach(function (opt) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'option';
            b.textContent = opt[1];
            b.setAttribute('aria-pressed', String(answers[current] === opt[0]));
            b.addEventListener('click', function () { choose(opt[0]); });
            box.appendChild(b);
        });
        focusEl($('q-title'));
    }

    function choose(key) {
        answers[current] = key;
        if (current < QUESTIONS.length - 1) {
            current++;
            renderQuestion();
        } else {
            $('progress-fill').style.width = '100%';
            resultKey = computeResult();
            ME.track('TestComplete', { perfil: PROFILES[resultKey].key }, true);
            show('screen-lead');
            focusEl($('lead-title'));
        }
    }

    function computeResult() {
        var count = { p: 0, g: 0, a: 0, i: 0 };
        answers.forEach(function (a) { if (a) count[a]++; });
        var max = Math.max.apply(null, ORDER.map(function (k) { return count[k]; }));
        var tied = ORDER.filter(function (k) { return count[k] === max; });
        if (tied.length === 1) return tied[0];
        // Desempate: lo que la persona dijo que más la ayudaría (última pregunta).
        var last = answers[answers.length - 1];
        return tied.indexOf(last) !== -1 ? last : tied[0];
    }

    function renderResult() {
        var p = PROFILES[resultKey];
        $('result-title').textContent = p.title;
        $('result-body').innerHTML = p.body.map(function (t) { return '<p>' + t + '</p>'; }).join('');
        $('exercise-title').textContent = p.exTitle;
        $('exercise-steps').innerHTML = p.ex.map(function (t) {
            var li = document.createElement('li');
            li.textContent = t;
            return li.outerHTML;
        }).join('');
        var chNum = (CFG.capituloPorPerfil || {})[p.key];
        var chTitle = chNum && CFG.capitulos ? CFG.capitulos[chNum - 1] : '';
        // Si el título sigue siendo placeholder, solo mostramos el número.
        if (chTitle && /pendiente/i.test(chTitle)) chTitle = 'el capítulo ' + chNum;
        $('result-chapter').textContent = chTitle || 'el libro';
        show('screen-result');
        focusEl($('result-title'));
    }

    // ---- Captura de datos ------------------------------------------------
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

    function withTimeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise(function (resolve) { setTimeout(function () { resolve({ error: new Error('timeout') }); }, ms); })
        ]);
    }

    $('lead-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var nombre = $('lead-name').value.trim();
        var email = $('lead-email').value.trim();
        var wa = $('lead-wa').value.trim();
        var consent = $('lead-consent').checked;
        var err = $('lead-error');
        var msg = '';
        if (!email && !wa) msg = 'Dejá un email o un WhatsApp, o tocá “Ver mi resultado sin dejar datos”.';
        else if (email && !validEmail(email)) msg = 'Revisá el email: parece que tiene un error.';
        else if (wa && wa.replace(/\D/g, '').length < 8) msg = 'Revisá el número de WhatsApp.';
        else if (!consent) msg = 'Para guardar tus datos necesitamos que marques la casilla de consentimiento.';
        if (msg) { err.textContent = msg; err.hidden = false; return; }
        err.hidden = true;

        var btn = $('btn-lead');
        btn.disabled = true;
        btn.textContent = 'Enviando…';

        var attr = ME.attribution();
        ME.track('Lead', { content_name: 'Test ¿Qué te frena a empezar?', perfil: PROFILES[resultKey].key });

        var payload = {
            nombre: nombre || null,
            email: email || null,
            whatsapp: wa || null,
            perfil_resultado: PROFILES[resultKey].key,
            utm_source: attr.utm_source || null,
            utm_medium: attr.utm_medium || null,
            utm_campaign: attr.utm_campaign || null,
            utm_content: attr.utm_content || null,
            utm_term: attr.utm_term || null,
            fbclid: attr.fbclid || null,
            consentimiento: true
        };

        var save = typeof window.createEbookLead === 'function'
            ? withTimeout(window.createEbookLead(payload), 6000)
            : Promise.resolve({ error: new Error('Neon no disponible') });

        save.then(function (res) {
            if (res && res.error) console.warn('[test] No se pudo guardar el lead:', res.error);
        }).catch(function (e) {
            console.warn('[test] No se pudo guardar el lead:', e);
        }).then(function () {
            renderResult();
        });
    });

    $('btn-skip').addEventListener('click', renderResult);

    // ---- Navegación ------------------------------------------------------
    $('btn-start').addEventListener('click', function () {
        if (!started) { started = true; ME.track('TestStart', {}, true); }
        current = 0;
        show('screen-quiz');
        renderQuestion();
    });
    $('btn-back').addEventListener('click', function () {
        if (current > 0) { current--; renderQuestion(); }
    });
    $('btn-restart').addEventListener('click', function () {
        answers = new Array(QUESTIONS.length);
        current = 0;
        resultKey = null;
        $('lead-form').reset();
        var btn = $('btn-lead');
        btn.disabled = false;
        btn.textContent = 'Enviar y ver mi resultado';
        show('screen-intro');
        focusEl($('intro-title'));
    });
})();
