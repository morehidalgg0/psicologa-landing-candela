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
    // 4. INTERACTIVE APPOINTMENT BOOKING SYSTEM (TURNERO)
    // =========================================================================
    
    // Booking State
    const bookingState = {
        modality: 'Online (Videollamada)',
        type: 'Primera Consulta / Inicio de Proceso',
        date: '',
        dateFormatted: '',
        time: '',
        name: '',
        phone: '',
        notes: ''
    };

    const phoneNumber = '5492236683822'; // Candela Hidalgo's WhatsApp Number

    // DOM Elements - Summary
    const summaryModality = document.getElementById('summary-modality');
    const summaryDate = document.getElementById('summary-date');
    const summaryTime = document.getElementById('summary-time');
    const summaryName = document.getElementById('summary-name');
    const btnSubmitBooking = document.getElementById('btn-submit-booking');
    const daysContainer = document.getElementById('days-carousel');
    const customDateInput = document.getElementById('custom-date-picker');
    const nameInput = document.getElementById('patient-name');
    const phoneInput = document.getElementById('patient-phone');
    const typeSelect = document.getElementById('consultation-type');
    const notesInput = document.getElementById('patient-notes');

    // Spanish Calendar Strings
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fullDayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fullMonthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Helper: Update Summary Display
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

    // Helper: Toast Notification
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

    // Generate Dynamic Next Business Days (Mon-Fri)
    function generateDays() {
        if (!daysContainer) return;
        daysContainer.innerHTML = '';

        const days = [];
        let current = new Date();
        // Start from tomorrow
        current.setDate(current.getDate() + 1);

        while (days.length < 5) {
            const dayOfWeek = current.getDay();
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(new Date(current));
            }
            current.setDate(current.getDate() + 1);
        }

        days.forEach((dateObj, index) => {
            const dayChip = document.createElement('div');
            dayChip.className = 'day-chip';
            if (index === 0) {
                // Auto-select first available day
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

        // Set min date for custom picker to tomorrow
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
        bookingState.dateFormatted = `${fullDay} ${dayNum} de ${fullMonth}`;
        updateSummary();
    }

    // Custom Date Picker Handler
    if (customDateInput) {
        customDateInput.addEventListener('change', (e) => {
            if (!e.target.value) return;
            const parts = e.target.value.split('-');
            const customDate = new Date(parts[0], parts[1] - 1, parts[2]);

            // Check if weekend
            if (customDate.getDay() === 0 || customDate.getDay() === 6) {
                showToast('ℹ️ Candela atiende de Lunes a Viernes. Por favor seleccioná un día hábil.');
                return;
            }

            // Deselect day chips
            document.querySelectorAll('.day-chip').forEach(c => c.classList.remove('selected'));
            selectDate(customDate);
        });
    }

    // Modality Selection Handling
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
        updateSummary();
    }

    modalityCards.forEach(card => {
        card.addEventListener('click', () => {
            const val = card.getAttribute('data-modality');
            setModality(val);
        });
    });

    // Quick Book Buttons from Services section
    const quickBookButtons = document.querySelectorAll('.quick-book-btn');
    quickBookButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetModality = btn.getAttribute('data-modality-target');
            if (targetModality) {
                setModality(targetModality);
            }
        });
    });

    // Time Slot Selection Handling
    const slotChips = document.querySelectorAll('.slot-chip');
    slotChips.forEach(chip => {
        chip.addEventListener('click', () => {
            slotChips.forEach(c => c.classList.remove('selected'));
            chip.classList.add('selected');
            bookingState.time = chip.getAttribute('data-time') || chip.textContent.trim();
            updateSummary();
        });
    });

    // Form Inputs Sync
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

    // Submit Booking -> Generate WhatsApp Message
    if (btnSubmitBooking) {
        btnSubmitBooking.addEventListener('click', (e) => {
            e.preventDefault();

            // Validation
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

            // Construct WhatsApp Message for Enfoque Integrativo
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

    // Initialize dynamic days on page load
    generateDays();
    updateSummary();
});
