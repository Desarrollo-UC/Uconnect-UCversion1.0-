function detalleLineaCredito(value){
    const url = `/detallelineacredito/` + "?carrera=" + encodeURIComponent(value);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            lineaCredito(data);
        }
    };
    xhr.send();
}

function lineaCredito(data){
    var lineaCreBox = document.getElementById('lineaCreBox');
    lineaCreBox.style.display = 'block';
    var pLinea = document.getElementById('lineaCreditosD');
    data.forEach(linea => {
        pLinea.innerText = '₡ ' + linea.data.carrera_Linea_Credito.disponible;
    });
}

function realizarAbono(consecutivo, tipo) {
    const url = `/get_consecutivo/?consecutivo=${encodeURIComponent(consecutivo)}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
       
        return realizarVerAbono(consecutivo, tipo);
    })
    .catch(error => {
        console.error('Ocurrió un error:', error);
    });
}

var interesC = 0;
var interesM = 0;

function realizarVerAbono(consecutivo, tipo) {
    const url = `/${encodeURIComponent(tipo)}/abono/`;
    
    return fetch(url, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener el abono: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const redirectUrl = `/${encodeURIComponent(tipo)}/abono/`;
        interesC = data.interesC;
        interesM = data.interesM;
        sessionStorage.setItem('interesC', interesC);
        sessionStorage.setItem('interesM', interesM);
        window.location.href = redirectUrl;
    })
    .catch(error => {
        console.error('Ocurrió un error:', error);
    });
}


const cleanNumber = (val) => parseFloat(String(val).replace(/[^\d.-]/g, '')) || 0;

function getInteresMinimo() {
    const montoI = cleanNumber(sessionStorage.getItem('interesC'));
    const montoM = cleanNumber(sessionStorage.getItem('interesM'));
    return Math.round((montoI + montoM) * 100) / 100;
}

function mostrarErrorMonto(sumaInteres) {
    document.getElementById('textoValidar').innerHTML =
        'El monto mínimo a pagar es de ₡' + sumaInteres.toFixed(2);
    $('#abonoModal').modal('show');
}

function validarAbonoInput() {
    const sumaInteres  = getInteresMinimo();
    const abonoInput   = document.getElementById('abonoInput');
    const montoAbono   = abonoInput.readOnly ? 0 : cleanNumber(abonoInput.value);
    const montoContado = cleanNumber(document.getElementById('contado').value);

    // Si abonoInput está vacío, no validar todavía
    if (montoAbono === 0) {
        return { validadar: true, montoMin: sumaInteres };
    }

    // Si el otro campo también tiene valor, usar la suma
    const montoAValidar = montoContado > 0
        ? Math.round((montoAbono + montoContado) * 100) / 100
        : montoAbono;

    if (montoAValidar < sumaInteres) {
        mostrarErrorMonto(sumaInteres);
        return { validadar: false, montoMin: sumaInteres };
    }

    return { validadar: true, montoMin: sumaInteres };
}

function validarContadoInput() {
    const sumaInteres  = getInteresMinimo();
    const abonoInput   = document.getElementById('abonoInput');
    const montoAbono   = abonoInput.readOnly ? 0 : cleanNumber(abonoInput.value);
    const montoContado = cleanNumber(document.getElementById('contado').value);

    // Si contado está vacío, no validar todavía
    if (montoContado === 0) {
        return { validadar: true, montoMin: sumaInteres };
    }

    // Si el otro campo también tiene valor, usar la suma
    const montoAValidar = montoAbono > 0
        ? Math.round((montoAbono + montoContado) * 100) / 100
        : montoContado;

    if (montoAValidar < sumaInteres) {
        mostrarErrorMonto(sumaInteres);
        return { validadar: false, montoMin: sumaInteres };
    }

    return { validadar: true, montoMin: sumaInteres };
}

function validarPagoTotal() {
    const sumaInteres = getInteresMinimo();

    const abonoInput  = document.getElementById('abonoInput');
    const montoAbono  = abonoInput.readOnly ? 0 : cleanNumber(abonoInput.value);
    const montoContado = cleanNumber(document.getElementById('contado').value);

    const totalPago = Math.round((montoAbono + montoContado) * 100) / 100;

    if (totalPago === 0) {
        return { validadar: false, montoMin: sumaInteres, totalPago, montoAbono, montoContado };
    }

    if (totalPago < sumaInteres) {
        mostrarErrorMonto(sumaInteres);
        return { validadar: false, montoMin: sumaInteres, totalPago, montoAbono, montoContado };
    }

    return { validadar: true, montoMin: sumaInteres, totalPago, montoAbono, montoContado };
}

function validarAbono() {
    const result = validarPagoTotal();

    if (!result.validadar) {
        return false;
    }

    $('#modal_factura').modal('show');
    // ✅ Ahora result sí trae montoContado y montoAbono
    realizarAbonoC(result.montoContado, result.montoAbono, result.totalPago);
    return true;
}

function realizarAbonoC(montoC, montoS, totalPago) {
    // ✅ Eliminadas las redeclaraciones con var que pisaban los parámetros
    montoC = montoC || 0;
    montoS = montoS || 0;
    const url = "/get_monto_total/?contado=" + encodeURIComponent(montoC) + "&saldoFavor=" + encodeURIComponent(montoS);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log(data);
        }
    };
    xhr.send();
}

$(document).ready(function () {
    getSaldo();
    const financiero = false
    const documento = Boolean(document.getElementById('rowContacto').getAttribute('data-documento'));

    // Si el valor es 'true', muestra el modal
    if (financiero === true) {
        document.getElementById('modal_morosoMessage').innerText = '';
        const modal = new bootstrap.Modal(document.getElementById('modal_moroso'));
        if (documento === true && financiero === true) {
            document.getElementById('modal_morosoMessage').innerHTML = `<p>Usted está en estado de morosidad. Complete el pago requerido para desbloquear los servicios.</p>
            <p>Además tiene documentos pendientes por entregar. Por favor, complete la entrega en el área de Registro Académico.</p>
            <p>📞 <strong>Contáctenos al:</strong> <a>+(502) 1234-5678</a></p> 
            `;
        }else{
            document.getElementById('modal_morosoMessage').innerText = 'Usted está en estado de morosidad. Complete el pago requerido para desbloquear los servicios.';
        }
        modal.show();
        document.getElementById('closeModalButton').addEventListener('click', function () {
            modal.hide();
        });
    }
});

var saldoF = 1;
function getSaldo() {
    const url = `/get_consecutivo/`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            console.log(data);
            saldoF = data.saldoFavor;
            console.log(saldoF);
            validadrSaldo();
        }
    };
    xhr.send();
}

function validadrSaldo() {
    if (saldoF === 0){
        document.getElementById('abonoInput').setAttribute('readOnly', true);
        document.getElementById('abonoInput').value = 0;
    }
}