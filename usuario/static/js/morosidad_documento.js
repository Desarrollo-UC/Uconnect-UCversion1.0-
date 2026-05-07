$(document).ready(function () {
    const financiero = window.morosoDoc

    // Si el valor es 'true', muestra el modal
    if (financiero === true) {
        document.getElementById('modal_morosoMessage').innerText = '';
        const modal = new bootstrap.Modal(document.getElementById('modal_morosoDoc'));
        document.getElementById('modal_morosoMessage').innerHTML = `
        <p>Usted tiene documentos pendientes por entregar. Por favor, complete la entrega en el área de Registro Académico.</p>
        <p>📞 <strong>Contáctenos al:</strong> <a>4108 9400</a></p>
        
    `;
        modal.show();
        document.getElementById('closeModalButtonDO').addEventListener('click', function () {
            modal.hide();
        });
    }
});