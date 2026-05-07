document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            start: '',
            center: '',
            end: ''
        },
        views: {
            timeGridWeek: {
                titleFormat: { year: 'numeric', month: 'long', day: 'numeric' },
                buttonText: 'Semana',
            }
        },
        dayHeaderFormat: { weekday: 'long'},
        dayHeaderContent: function(arg) {
            let dayName = arg.text.charAt(0).toUpperCase() + arg.text.slice(1);
            let initial = arg.text === 'martes' ? 'K' : arg.text.charAt(0).toUpperCase();
            return `${dayName} (${initial})`;
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        allDaySlot: false,
        navLinks: false,
        hiddenDays: [0], // ocultar domingo (0) y sábado (6)
        selectable: false,
        locale: 'es',
        timeFormat: 'h:mm A',
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
        },
        
    });
    calendar.render();
});
