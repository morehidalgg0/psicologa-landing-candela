/**
 * CANDELA HIDALGO - PSICÓLOGA · CLÍNICA · ENFOQUE INTEGRATIVO
 * Interactive Booking Engine & Site Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const spans = menuToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    menuToggle.click();
                }
            });
        });
    }

    // 2. Header Scroll Shadow
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.style.boxShadow = '0 4px 20px rgba(18, 52, 86, 0.08)';
            header.style.backgroundColor = 'rgba(250, 247, 240, 0.98)';
        } else {
            header.style.boxShadow = 'none';
            header.style.backgroundColor = 'rgba(250, 247, 240, 0.92)';
        }
    });

    // 3. Scroll Intersection Observer for Animations
    const fadeElements = document.querySelectorAll('.fade-in-up');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => { scrollObserver.observe(el); });

    // =========================================================================
    // 4. INTERACTIVE APPOINTMENT BOOKING SYSTEM (DISPONIBILIDAD PERSONALIZADA)
    // =========================================================================
    
    // Configuración de disponibilidad exacta por día de la semana y modalidad:
    // 0 = Domingo, 1 = Lunes, 2 = Martes, 3 = Miércoles, 4 = Jueves, 5 = Viernes, 6 = Sábado
    const SCHEDULE_CONFIG = {
        1: { // Lunes
            presencial: ['08:00', '09:00', '18:00'],
            online: ['08:00', '09:00', '18:00']
        },
        2: { // Martes
            presencial: ['18:00'],
            online: ['18:00']
        },
        3: { // Miércoles
            presencial: ['08:00', '09:00', '14:00', '15:00'],
            online: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
        },
        4: { // Jueves
            presencial: ['08:00', '09:00', '14:00', '15:00'],
            online: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
        }
    };

    // Estado del turno
    const bookingState = {
        modality: 'Online (Videollamada)',
        type: 'Primera Consulta / Inicio de Proceso',
        date: '',
        dateObj: null,
        dateFormatted: '',
        time: '',
        name: '',
        phone: '',
        notes: ''
    };

    const phoneNumber = '5492236683822'; // WhatsApp Lic. Candela Hidalgo

    // Elementos DOM
    const summaryModality = document.getElementById('summary-modality');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryName = document.getElementById('summary-name');
    const btnSubmitBooking = document.getElementById('btn-submit-booking');
    const daysContainer = document.getElementById('days-carousel');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const customDateInput = document.getElementById('custom-date-picker');
    const nameInput = document.getElementById('patient-name');
    const phoneInput = document.getElementById('patient-phone');
    const typeSelect = document.getElementById('consultation-type');
    const notesInput = document.getElementById('patient-notes');

    // Nombres de días y meses en español
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fullMonthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Actualizar panel lateral de resumen
    function updateSummary() {
        if (summaryModality) {
            summaryModality.textContent = bookingState.modality;
            summaryModality.classList.remove('empty');
        }

        if (summaryDate) {
            if (bookingState.dateFormatted) {
                summaryDate.textContent = bookingState.dateFormatted;
                summaryDate.classList.remove('empty');
            } else {
                summaryDate.textContent = 'Seleccionar fecha';
                summaryDate.classList.add('empty');
            }
        }

        if (summaryTime) {
            if (bookingState.time) {
                summaryTime.textContent = `${bookingState.time} hs`;
                summaryTime.classList.remove('empty');
            } else {
                summaryTime.textContent = 'Seleccionar horario';
                summaryTime.classList.add('empty');
            }
        }

        if (summaryName) {
            if (bookingState.name.trim()) {
                summaryName.textContent = bookingState.name.trim();
                summaryName.classList.remove('empty');
            } else {
                summaryName.textContent = 'Ingresar tu nombre';
                summaryName.classList.add('empty');
            }
        }
    }

    // Toast de notificación
    function showToast(message) {
        let toast = document.getElementById('toast-alert');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast-alert';
            toast.className = 'toast-alert';
            document.body.appendChild(toast);
        }
        toast.innerHTML = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    // Renderizar horarios disponibles según el día y la modalidad
    function renderTimeSlots() {
        if (!timeSlotsContainer) return;
        timeSlotsContainer.innerHTML = '';

        if (!bookingState.dateObj) {
            timeSlotsContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem;">Por favor seleccioná un día primero.</p>`;
            return;
        }

        const dayOfWeek = bookingState.dateObj.getDay();
        const isOnline = bookingState.modality.includes('Online');
        const daySchedule = SCHEDULE_CONFIG[dayOfWeek];

        if (!daySchedule) {
            timeSlotsContainer.innerHTML = `
                <div style="background: var(--celeste-bg); border-radius: var(--radius-md); padding: 1.2rem; border: 1px solid var(--cream-border); text-align: center;">
                    <p style="color: var(--navy-primary); font-weight: 600; font-size: 0.95rem; margin-bottom: 0.2rem;">No hay turnos disponibles para este día</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Candela atiende de <strong>Lunes a Jueves</strong>. Por favor seleccioná otro día.</p>
                </div>
            `;
            bookingState.time = '';
            updateSummary();
            return;
        }

        const availableSlots = isOnline ? daySchedule.online : daySchedule.presencial;

        if (!availableSlots || availableSlots.length === 0) {
            timeSlotsContainer.innerHTML = `
                <div style="background: var(--celeste-bg); border-radius: var(--radius-md); padding: 1.2rem; border: 1px solid var(--cream-border); text-align: center;">
                    <p style="color: var(--navy-primary); font-weight: 600; font-size: 0.95rem;">No hay horarios en modalidad presencial para este día.</p>
                    <p style="color: var(--text-muted); font-size: 0.85rem;">Podés seleccionar la modalidad <strong>Online</strong> o elegir otro día.</p>
                </div>
            `;
            bookingState.time = '';
            updateSummary();
            return;
        }

        // Separar horarios por mañana / tarde
        const morningSlots = availableSlots.filter(t => parseInt(t.split(':')[0], 10) < 14);
        const afternoonSlots = availableSlots.filter(t => parseInt(t.split(':')[0], 10) >= 14);

        // Si el horario seleccionado previamente no está disponible en la nueva lista, seleccionar el primero disponible
        if (!availableSlots.includes(bookingState.time)) {
            bookingState.time = availableSlots[0];
        }

        // Crear contenedor para mañana
        if (morningSlots.length > 0) {
            const morningGroup = document.createElement('div');
            morningGroup.className = 'time-group';
            morningGroup.innerHTML = `
                <div class="time-group-title">☀️ Franja Mañana / Mediodía</div>
                <div class="slots-grid" id="slots-morning"></div>
            `;
            timeSlotsContainer.appendChild(morningGroup);

            const gridMorning = morningGroup.querySelector('#slots-morning');
            morningSlots.forEach(slot => {
                const chip = document.createElement('div');
                chip.className = 'slot-chip';
                chip.setAttribute('data-time', slot);
                chip.textContent = `${slot} hs`;

                if (slot === bookingState.time) {
                    chip.classList.add('selected');
                }

                chip.addEventListener('click', () => {
                    document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    bookingState.time = slot;
                    updateSummary();
                });

                gridMorning.appendChild(chip);
            });
        }

        // Crear contenedor para tarde
        if (afternoonSlots.length > 0) {
            const afternoonGroup = document.createElement('div');
            afternoonGroup.className = 'time-group';
            if (morningSlots.length > 0) {
                afternoonGroup.style.marginTop = '1.2rem';
            }
            afternoonGroup.innerHTML = `
                <div class="time-group-title">🌙 Franja Tarde / Noche</div>
                <div class="slots-grid" id="slots-afternoon"></div>
            `;
            timeSlotsContainer.appendChild(afternoonGroup);

            const gridAfternoon = afternoonGroup.querySelector('#slots-afternoon');
            afternoonSlots.forEach(slot => {
                const chip = document.createElement('div');
                chip.className = 'slot-chip';
                chip.setAttribute('data-time', slot);
                chip.textContent = `${slot} hs`;

                if (slot === bookingState.time) {
                    chip.classList.add('selected');
                }

                chip.addEventListener('click', () => {
                    document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
                    chip.classList.add('selected');
                    bookingState.time = slot;
                    updateSummary();
                });

                gridAfternoon.appendChild(chip);
            });
        }

        updateSummary();
    }

    // Generar los próximos días de atención disponibles (Lunes a Jueves)
    function generateDays() {
        if (!daysContainer) return;
        daysContainer.innerHTML = '';

        const days = [];
        let current = new Date();
        // Empezar desde mañana
        current.setDate(current.getDate() + 1);

        while (days.length < 5) {
            const dayOfWeek = current.getDay();
            // Solo incluir días donde Candela atiende (1=Lun, 2=Mar, 3=Mié, 4=Jue)
            if (SCHEDULE_CONFIG[dayOfWeek]) {
                days.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        days.forEach((dateObj, index) => {
            const dayChip = document.createElement('div');
            dayChip.className = 'day-chip';
            if (index === 0) {
                dayChip.classList.add('selected');
                selectDate(dateObj);
            }

            const dName = dayNames[dateObj.getDay()];
            const dNum = dateObj.getDate();
            const dMonth = monthNames[dateObj.getMonth()];

            dayChip.innerHTML = `
                <span class="day-name">${dName}</span>
                <span class="day-num">${dNum}</span>
                <span class="day-month">${dMonth}</span>
            `;

            dayChip.addEventListener('click', () => {
                document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('selected'));
                dayChip.classList.add('selected');
                if (customDateInput) customDateInput.value = '';
                selectDate(dateObj);
            });

            daysContainer.appendChild(dayChip);
        });

        // Configurar fecha mínima para selector alternativo
        if (customDateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            customDateInput.min = tomorrow.toISOString().split('T')[0];
        }
    }

    function selectDate(dateObj) {
        const fullDay = fullDayNames[dateObj.getDay()];
        const dayNum = dateObj.getDate();
        const fullMonth = fullMonthNames[dateObj.getMonth()];

        bookingState.date = dateObj.toISOString().split('T')[0];
        bookingState.dateObj = dateObj;
        bookingState.dateFormatted = `${fullDay} ${dayNum} de ${fullMonth}`;
        
        renderTimeSlots();
        updateSummary();
    }

    // Selector de fecha personalizada
    if (customDateInput) {
        customDateInput.addEventListener('change', (e) => {
            if (!e.target.value) return;
            const parts = e.target.value.split('-');
            const customDate = new Date(parts[0], parts[1] - 1, parts[2]);
            const dayOfWeek = customDate.getDay();

            // Verificar si es día de atención (Lunes a Jueves)
            if (!SCHEDULE_CONFIG[dayOfWeek]) {
                showToast('ℹ️ Candela atiende de Lunes a Jueves. Por favor seleccioná uno de esos días.');
            }

            // Deseleccionar chips predeterminados
            document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('selected'));
            selectDate(customDate);
        });
    }

    // Selección de modalidad (Online / Presencial)
    const modalityCards = document.querySelectorAll('.option-card[data-modality]');
    function setModality(modalityValue) {
        modalityCards.forEach(card => {
            if (card.getAttribute('data-modality') === modalityValue) {
                card.classList.add('selected');
                bookingState.modality = modalityValue;
            } else {
                card.classList.remove('selected');
            }
        });
        renderTimeSlots();
        updateSummary();
    }

    modalityCards.forEach(card => {
        card.addEventListener('click', () => {
            const val = card.getAttribute('data-modality');
            setModality(val);
        });
    });

    // Botones de acceso rápido desde la sección de servicios
    const quickBookButtons = document.querySelectorAll('.quick-book-btn');
    quickBookButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetModality = btn.getAttribute('data-modality-target');
            if (targetModality) {
                setModality(targetModality);
            }
        });
    });

    // Sincronización de inputs del formulario
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            bookingState.name = e.target.value;
            updateSummary();
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            bookingState.phone = e.target.value;
        });
    }

    if (typeSelect) {
        typeSelect.addEventListener('change', (e) => {
            bookingState.type = e.target.value;
        });
    }

    if (notesInput) {
        notesInput.addEventListener('input', (e) => {
            bookingState.notes = e.target.value;
        });
    }

    // Enviar Reserva -> Construir y abrir WhatsApp
    if (btnSubmitBooking) {
        btnSubmitBooking.addEventListener('click', (e) => {
            e.preventDefault();

            // Validaciones
            if (!bookingState.name.trim()) {
                showToast('⚠️ Por favor ingresá tu nombre completo.');
                if (nameInput) {
                    nameInput.focus();
                    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            if (!bookingState.dateFormatted) {
                showToast('⚠️ Por favor seleccioná un día para tu turno.');
                return;
            }

            if (!bookingState.time) {
                showToast('⚠️ Por favor seleccioná un horario disponible.');
                return;
            }

            // Construir mensaje enriquecido para WhatsApp
            let message = `¡Hola Lic. Candela Hidalgo! 👋 Quisiera solicitar un turno:\n\n`;
            message += `🗓️ *Día:* ${bookingState.dateFormatted}\n`;
            message += `⏰ *Horario:* ${bookingState.time} hs\n`;
            message += `🛋️ *Modalidad:* ${bookingState.modality}\n`;
            message += `🌿 *Tipo de consulta:* ${bookingState.type}\n`;
            message += `👤 *Paciente:* ${bookingState.name.trim()}\n`;
            
            if (bookingState.phone.trim()) {
                message += `📱 *Teléfono:* ${bookingState.phone.trim()}\n`;
            }
            
            if (bookingState.notes.trim()) {
                message += `📝 *Motivo / Mensaje:* ${bookingState.notes.trim()}\n`;
            }

            message += `\n¿Tenés disponibilidad en ese horario? ¡Muchas gracias!`;

            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            showToast('✅ ¡Abriendo WhatsApp con tu turno solicitado!');
            
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 600);
        });
    }

    // Inicializar turnero dinámico
    generateDays();
});
