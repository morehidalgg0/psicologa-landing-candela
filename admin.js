/**
 * =============================================================================
 *  PANEL DE TURNOS · Lic. Candela Hidalgo
 *  Lógica de la aplicación (login, turnos, disponibilidad y bloqueos)
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const $ = (id) => document.getElementById(id);

    const configWarning = $('config-warning');
    const loginView = $('login-view');
    const appView = $('app-view');
    const loginForm = $('login-form');
    const loginError = $('login-error');
    const toastEl = $('admin-toast');

    const dayNamesFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const monthNamesFull = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const statusLabels = {
        pendiente: 'Pendiente',
        confirmado: 'Confirmado',
        atendido: 'Atendido',
        cancelado: 'Cancelado'
    };

    const TIME_OPTIONS = (() => {
        const list = [];
        for (let h = 7; h <= 21; h++) list.push(`${String(h).padStart(2, '0')}:00`);
        return list;
    })();

    let client = null;
    let currentFilter = 'proximos';
    let appointments = [];
    const availabilityState = {};

    // -------------------------------------------------------------------------
    // Utilidades
    // -------------------------------------------------------------------------
    function showToast(message, isError = false) {
        toastEl.textContent = message;
        toastEl.classList.toggle('error', isError);
        toastEl.classList.add('show');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => toastEl.classList.remove('show'), 3500);
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function formatDate(iso) {
        if (!iso) return '';
        const [y, m, d] = iso.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return `${dayNamesFull[date.getDay()]} ${d} de ${monthNamesFull[m - 1]} de ${y}`;
    }

    function todayISO() {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    function fillTimeSelect(select) {
        TIME_OPTIONS.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = `${t} hs`;
            select.appendChild(opt);
        });
    }

    // -------------------------------------------------------------------------
    // Inicialización / Autenticación
    // -------------------------------------------------------------------------
    if (typeof isNeonConfigured !== 'function' || !isNeonConfigured() ||
        typeof getNeonAuthClient !== 'function' || !getNeonAuthClient()) {
        configWarning.hidden = false;
        if (loginView) loginView.hidden = true;
        if (appView) appView.hidden = true;
        return;
    }
    client = getNeonAuthClient();

    function showLogin() {
        loginView.hidden = false;
        appView.hidden = true;
    }

    function showApp(user) {
        loginView.hidden = true;
        appView.hidden = false;
        $('admin-user-email').textContent = user?.email || '';
        loadAppointments();
        loadAvailability();
        loadBlocks();
    }

    client.auth.getSession()
        .then(({ data }) => {
            if (data?.session) showApp(data.user);
            else showLogin();
        })
        .catch((err) => {
            console.error('Error al obtener la sesión:', err);
            showLogin();
        });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginError.hidden = true;
        const btn = $('login-submit');
        btn.disabled = true;
        btn.textContent = 'Ingresando...';

        const { data, error } = await client.auth.signIn.email({
            email: $('login-email').value.trim(),
            password: $('login-password').value
        });

        btn.disabled = false;
        btn.textContent = 'Ingresar';

        if (error) {
            loginError.textContent = 'No pudimos ingresar: revisá el email y la contraseña.';
            loginError.hidden = false;
            return;
        }

        showApp(data?.user);
    });

    $('logout-btn').addEventListener('click', async () => {
        await client.auth.signOut();
        showLogin();
    });

    // -------------------------------------------------------------------------
    // Navegación por pestañas
    // -------------------------------------------------------------------------
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            $(`panel-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // =========================================================================
    // 1. TURNOS
    // =========================================================================
    async function loadAppointments() {
        const list = $('appointments-list');
        list.innerHTML = '<div class="empty-state">Cargando turnos...</div>';

        const { data, error } = await client
            .from('appointments')
            .select('*')
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });

        if (error) {
            console.error(error);
            list.innerHTML = '<div class="empty-state">No se pudieron cargar los turnos.</div>';
            showToast('Error al cargar los turnos', true);
            return;
        }

        appointments = data || [];
        updateStats();
        renderAppointments();
    }

    function updateStats() {
        const today = todayISO();
        $('stat-pending').textContent = appointments.filter(a => a.status === 'pendiente').length;
        $('stat-confirmed').textContent = appointments.filter(a => a.status === 'confirmado').length;
        $('stat-upcoming').textContent = appointments.filter(a =>
            a.appointment_date >= today && (a.status === 'pendiente' || a.status === 'confirmado')
        ).length;
        $('stat-total').textContent = appointments.length;
    }

    function renderAppointments() {
        const list = $('appointments-list');
        const today = todayISO();

        let filtered = appointments;
        if (currentFilter === 'proximos') {
            filtered = appointments.filter(a =>
                a.appointment_date >= today && (a.status === 'pendiente' || a.status === 'confirmado')
            );
        } else if (currentFilter !== 'todos') {
            filtered = appointments.filter(a => a.status === currentFilter);
        }

        if (filtered.length === 0) {
            list.innerHTML = '<div class="empty-state">No hay turnos para mostrar. 🗓️</div>';
            return;
        }

        list.innerHTML = filtered.map(a => {
            const modalityLabel = a.modality === 'presencial' ? '🛋️ Presencial' : '💻 Online';
            const phoneLink = a.patient_phone
                ? `<a class="btn-mini wa" target="_blank" rel="noopener" href="https://wa.me/${a.patient_phone.replace(/[^0-9]/g, '')}">💬 WhatsApp</a>`
                : '';

            let actions = '';
            if (a.status === 'pendiente') {
                actions = `
                    <button class="btn-mini confirm" data-action="confirmado" data-id="${a.id}">✓ Confirmar</button>
                    <button class="btn-mini cancel" data-action="cancelado" data-id="${a.id}">✕ Cancelar</button>`;
            } else if (a.status === 'confirmado') {
                actions = `
                    <button class="btn-mini confirm" data-action="atendido" data-id="${a.id}">✓ Marcar atendido</button>
                    <button class="btn-mini cancel" data-action="cancelado" data-id="${a.id}">✕ Cancelar</button>`;
            } else if (a.status === 'atendido') {
                actions = `<button class="btn-mini" data-action="confirmado" data-id="${a.id}">↩ Reabrir</button>`;
            } else if (a.status === 'cancelado') {
                actions = `<button class="btn-mini" data-action="pendiente" data-id="${a.id}">↩ Reactivar</button>`;
            }
            actions += `<button class="btn-mini cancel" data-action="delete" data-id="${a.id}">🗑</button>`;

            return `
                <div class="appointment-card status-${a.status}">
                    <div class="appointment-main">
                        <div class="appointment-date">📅 ${escapeHtml(formatDate(a.appointment_date))} · ⏰ ${escapeHtml(a.appointment_time)} hs</div>
                        <div class="appointment-meta">
                            <strong>${escapeHtml(a.patient_name)}</strong> · ${modalityLabel}<br>
                            ${a.patient_phone ? `📱 ${escapeHtml(a.patient_phone)} · ` : ''}🌿 ${escapeHtml(a.consultation_type || 'Consulta')}
                        </div>
                        ${a.notes ? `<div class="appointment-notes">📝 ${escapeHtml(a.notes)}</div>` : ''}
                    </div>
                    <div class="appointment-side">
                        <span class="badge status-${a.status}">${statusLabels[a.status] || a.status}</span>
                        <div class="appointment-actions">
                            ${phoneLink}
                            ${actions}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    $('appointments-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;

        if (action === 'delete') {
            if (!confirm('¿Eliminar este turno definitivamente?')) return;
            const { error } = await client.from('appointments').delete().eq('id', id);
            if (error) return showToast('No se pudo eliminar el turno', true);
            showToast('Turno eliminado');
        } else {
            const { error } = await client.from('appointments').update({ status: action }).eq('id', id);
            if (error) return showToast('No se pudo actualizar el turno', true);
            showToast(`Turno marcado como "${statusLabels[action]}"`);
        }
        loadAppointments();
    });

    $('appointment-filter').addEventListener('change', (e) => {
        currentFilter = e.target.value;
        renderAppointments();
    });

    $('refresh-appointments').addEventListener('click', () => {
        loadAppointments();
        showToast('Turnos actualizados');
    });

    // =========================================================================
    // 2. DISPONIBILIDAD SEMANAL
    // =========================================================================
    async function loadAvailability() {
        const grid = $('availability-grid');
        grid.innerHTML = '<div class="empty-state">Cargando disponibilidad...</div>';

        const config = await loadAvailabilityConfig();

        for (let d = 0; d <= 6; d++) {
            availabilityState[d] = {
                online: new Set(config?.[d]?.online || []),
                presencial: new Set(config?.[d]?.presencial || [])
            };
        }
        renderAvailability();
    }

    function renderAvailability() {
        const grid = $('availability-grid');
        grid.innerHTML = '';

        for (let d = 0; d <= 6; d++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'avail-day';

            const total = availabilityState[d].online.size + availabilityState[d].presencial.size;

            dayEl.innerHTML = `
                <h3>${dayNamesFull[d]} <span class="day-count">${total} horario(s)</span></h3>
                <div class="avail-modality">
                    <div class="avail-modality-title">💻 Online</div>
                    <div class="slot-grid" data-day="${d}" data-modality="online"></div>
                </div>
                <div class="avail-modality">
                    <div class="avail-modality-title">🛋️ Presencial</div>
                    <div class="slot-grid" data-day="${d}" data-modality="presencial"></div>
                </div>
            `;

            ['online', 'presencial'].forEach(modality => {
                const gridEl = dayEl.querySelector(`.slot-grid[data-modality="${modality}"]`);
                TIME_OPTIONS.forEach(time => {
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'slot-toggle' + (availabilityState[d][modality].has(time) ? ' on' : '');
                    btn.textContent = time;
                    btn.addEventListener('click', () => {
                        const set = availabilityState[d][modality];
                        if (set.has(time)) set.delete(time);
                        else set.add(time);
                        btn.classList.toggle('on');
                        dayEl.querySelector('.day-count').textContent =
                            `${availabilityState[d].online.size + availabilityState[d].presencial.size} horario(s)`;
                    });
                    gridEl.appendChild(btn);
                });
            });

            grid.appendChild(dayEl);
        }
    }

    $('save-availability').addEventListener('click', async () => {
        const btn = $('save-availability');
        btn.disabled = true;
        btn.textContent = 'Guardando...';

        const rows = [];
        for (let d = 0; d <= 6; d++) {
            ['online', 'presencial'].forEach(modality => {
                availabilityState[d][modality].forEach(time => {
                    rows.push({ day_of_week: d, modality, time });
                });
            });
        }

        const del = await client
            .from('availability')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
        if (del.error) {
            console.error(del.error);
            btn.disabled = false;
            btn.textContent = 'Guardar cambios';
            return showToast('No se pudieron guardar los cambios', true);
        }

        if (rows.length) {
            const ins = await client.from('availability').insert(rows);
            if (ins.error) {
                console.error(ins.error);
                btn.disabled = false;
                btn.textContent = 'Guardar cambios';
                return showToast('No se pudieron guardar los cambios', true);
            }
        }

        btn.disabled = false;
        btn.textContent = 'Guardar cambios';
        showToast('✅ Disponibilidad guardada');
    });

    // =========================================================================
    // 3. BLOQUEOS
    // =========================================================================
    async function loadBlocks() {
        const list = $('blocks-list');
        list.innerHTML = '<div class="empty-state">Cargando bloqueos...</div>';

        const { data, error } = await client
            .from('blocked_slots')
            .select('*')
            .order('blocked_date', { ascending: true });

        if (error) {
            console.error(error);
            list.innerHTML = '<div class="empty-state">No se pudieron cargar los bloqueos.</div>';
            return;
        }

        if (!data || data.length === 0) {
            list.innerHTML = '<div class="empty-state">No hay bloqueos cargados. ✅</div>';
            return;
        }

        list.innerHTML = data.map(b => {
            const modLabel = b.modality ? (b.modality === 'online' ? 'Online' : 'Presencial') : 'Ambas modalidades';
            const timeLabel = b.time ? `${b.time} hs` : 'Todo el día';
            return `
                <div class="block-card">
                    <div>
                        <strong>${escapeHtml(formatDate(b.blocked_date))}</strong>
                        <div class="block-sub">${timeLabel} · ${modLabel}${b.reason ? ` · ${escapeHtml(b.reason)}` : ''}</div>
                    </div>
                    <button class="btn-mini cancel" data-block-id="${b.id}">Eliminar</button>
                </div>
            `;
        }).join('');
    }

    $('blocks-list').addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-block-id]');
        if (!btn) return;
        if (!confirm('¿Eliminar este bloqueo?')) return;
        const { error } = await client.from('blocked_slots').delete().eq('id', btn.dataset.blockId);
        if (error) return showToast('No se pudo eliminar el bloqueo', true);
        showToast('Bloqueo eliminado');
        loadBlocks();
    });

    $('block-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            blocked_date: $('block-date').value,
            time: $('block-time').value || null,
            modality: $('block-modality').value || null,
            reason: $('block-reason').value.trim() || null
        };
        if (!payload.blocked_date) return showToast('Elegí una fecha', true);

        const { error } = await client.from('blocked_slots').insert(payload);
        if (error) {
            console.error(error);
            return showToast('No se pudo agregar el bloqueo', true);
        }
        e.target.reset();
        showToast('✅ Bloqueo agregado');
        loadBlocks();
    });

    // Poblar selects de horarios y fecha mínima
    fillTimeSelect($('block-time'));
    $('block-date').min = todayISO();
});
