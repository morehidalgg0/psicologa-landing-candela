/**
 * =============================================================================
 *  CONFIGURACIÓN DE NEON + HELPERS DE DATOS COMPARTIDOS
 *  -----------------------------------------------------------------------------
 *  Acá va la URL HTTPS de la base (SIN usuario, SIN contraseña y SIN la cadena
 *  de conexión de Postgres). El SDK deriva de acá las URLs de Auth y Data API.
 *
 *  La encontrás en: Neon Console -> Postgres database -> Data API -> pestaña API
 *  (o armala a partir del endpoint: quitá "-pooler" del host de conexión).
 *  Formato: https://<endpoint>.<cell>.<region>.aws.neon.tech/<database>
 *
 *  Nunca pongas acá la cadena "postgresql://...": contiene la contraseña.
 *
 *  Si queda vacía, la landing funciona con la agenda por defecto (y no guarda
 *  los turnos en la base de datos).
 *
 *  Este archivo es un MÓDULO ES (se carga con <script type="module">) porque el
 *  SDK de Neon se importa desde un CDN. Expone las funciones en `window` para
 *  que el resto de los scripts (clásicos) puedan usarlas.
 * =============================================================================
 */

import { createClient } from 'https://esm.sh/@neondatabase/neon-js@0.8.0-beta';

// URL base de la base (obligatoria). Ejemplos válidos (todos sirven):
//   'https://ep-cool-1234.c-7.us-east-2.aws.neon.tech/neondb'
//   'https://ep-cool-1234.apirest.c-7.us-east-2.aws.neon.tech/neondb/rest/v1'
const NEON_DATABASE_URL = 'https://ep-weathered-haze-b5pn92f7.c-7.us-east-2.aws.neon.tech/neondb';

// URL de Auth (opcional). Si la dejás vacía, se deriva automáticamente de la
// URL de arriba. Solo completala si tu proyecto usa hosts personalizados.
// Ej: 'https://ep-cool-1234.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth'
const NEON_AUTH_URL = '';

// Normaliza la URL quitando etiquetas de host (.apirest/.neonauth) y paths
// finales (/rest/v1, /auth) para obtener la URL base que espera el SDK.
function normalizeNeonUrl(raw) {
    let url = String(raw || '').trim().replace(/\/+$/, '');
    if (!url) return '';
    url = url.replace(/\/(rest\/v1|auth)$/, '');
    url = url.replace('.apirest.', '.').replace('.neonauth.', '.');
    return url;
}

// Agenda por defecto (se usa solo si Neon no está configurado).
// 0=Dom, 1=Lun, 2=Mar, 3=Mié, 4=Jue, 5=Vie, 6=Sáb
const DEFAULT_SCHEDULE = {
    1: {
        presencial: ['08:00', '09:00', '16:00', '17:00', '18:00'],
        online: ['08:00', '09:00', '16:00', '17:00', '18:00']
    },
    2: {
        presencial: ['18:00'],
        online: ['18:00']
    },
    3: {
        presencial: ['08:00', '09:00', '14:00', '15:00'],
        online: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    },
    4: {
        presencial: ['08:00', '09:00', '14:00', '15:00'],
        online: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
    }
};

let neonClient = null;

function isNeonConfigured() {
    return Boolean(NEON_DATABASE_URL);
}

function getNeonClient() {
    if (neonClient) return neonClient;
    if (!isNeonConfigured()) return null;

    const baseUrl = normalizeNeonUrl(NEON_DATABASE_URL);
    const authUrl = NEON_AUTH_URL ? NEON_AUTH_URL.trim() : '';

    if (authUrl) {
        neonClient = createClient({
            dataApi: { url: normalizeNeonUrl(NEON_DATABASE_URL) },
            auth: { url: authUrl, allowAnonymous: true }
        });
    } else {
        neonClient = createClient(baseUrl, {
            auth: { allowAnonymous: true }
        });
    }
    return neonClient;
}

function getNeonAuthClient() {
    if (!isNeonConfigured()) return null;
    const baseUrl = normalizeNeonUrl(NEON_DATABASE_URL);
    const authUrl = NEON_AUTH_URL ? NEON_AUTH_URL.trim() : '';

    if (authUrl) {
        return createClient({
            dataApi: { url: normalizeNeonUrl(NEON_DATABASE_URL) },
            auth: { url: authUrl }
        });
    }
    return createClient(baseUrl);
}

/** Traduce la etiqueta larga de la UI a la clave corta que usamos en la base. */
function modalityKey(label) {
    return String(label || '').toLowerCase().includes('presencial') ? 'presencial' : 'online';
}

/** Lee la disponibilidad semanal desde Neon. Devuelve null si no hay conexión. */
async function loadAvailabilityConfig() {
    const client = getNeonClient();
    if (!client) return null;

    const { data, error } = await client
        .from('availability')
        .select('day_of_week, modality, time');

    if (error) {
        console.error('Error al cargar la disponibilidad:', error);
        return null;
    }

    const config = {};
    (data || []).forEach(row => {
        const day = row.day_of_week;
        if (!config[day]) config[day] = { online: [], presencial: [] };
        if (!config[day][row.modality].includes(row.time)) {
            config[day][row.modality].push(row.time);
        }
    });

    Object.values(config).forEach(day => {
        day.online.sort();
        day.presencial.sort();
    });

    return config;
}

/** Bloqueos entre dos fechas (formato 'YYYY-MM-DD'). */
async function loadBlockedSlots(fromISO, toISO) {
    const client = getNeonClient();
    if (!client) return [];

    const { data, error } = await client
        .from('blocked_slots')
        .select('blocked_date, time, modality')
        .gte('blocked_date', fromISO)
        .lte('blocked_date', toISO);

    if (error) {
        console.error('Error al cargar los bloqueos:', error);
        return [];
    }
    return data || [];
}

/** Horarios ya ocupados (vista pública, sin datos de pacientes). */
async function loadBookedSlots(fromISO, toISO) {
    const client = getNeonClient();
    if (!client) return [];

    const { data, error } = await client
        .from('booked_slots')
        .select('appointment_date, appointment_time, modality')
        .gte('appointment_date', fromISO)
        .lte('appointment_date', toISO);

    if (error) {
        console.error('Error al cargar los horarios ocupados:', error);
        return [];
    }
    return data || [];
}

/** Guarda una solicitud de turno (vía función segura del lado del servidor). */
async function createAppointment(payload) {
    const client = getNeonClient();
    if (!client) return { data: null, error: new Error('Neon no configurado') };

    return client.rpc('create_appointment', {
        p_patient_name: payload.patient_name,
        p_patient_phone: payload.patient_phone,
        p_consultation_type: payload.consultation_type,
        p_notes: payload.notes,
        p_modality: payload.modality,
        p_appointment_date: payload.appointment_date,
        p_appointment_time: payload.appointment_time
    });
}

/** Devuelve 'YYYY-MM-DD' de un objeto Date respetando la zona local. */
function toISODate(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Exponer helpers en el scope global (para los scripts clásicos)
window.isNeonConfigured = isNeonConfigured;
window.getNeonClient = getNeonClient;
window.getNeonAuthClient = getNeonAuthClient;
window.DEFAULT_SCHEDULE = DEFAULT_SCHEDULE;
window.modalityKey = modalityKey;
window.loadAvailabilityConfig = loadAvailabilityConfig;
window.loadBlockedSlots = loadBlockedSlots;
window.loadBookedSlots = loadBookedSlots;
window.createAppointment = createAppointment;
window.toISODate = toISODate;
