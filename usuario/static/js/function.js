async function datacedula() {
  const input = document.getElementById("identificacion");
  const tipo = document.getElementById("tipo").value;
  const idLen = input.value.length;
  const tiposLargos = ["Dimex", "Cédula Residente", "Refugiado"];
  const esCedula = tipo === "Cédula" && idLen === 9;
  const esTipoLargo = tiposLargos.includes(tipo) && idLen >= 10 && idLen <= 12;

  if (!esCedula && !esTipoLargo) {
    setReadOnly(false);
    return;
  }
  const url = `${window.location.origin}/obtener-datos/?identificacion=${encodeURIComponent(input.value)}`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Error HTTP ${resp.status}`);
    const text = await resp.text();
    const datos = text.split(",").map(s =>
    s.replace(/[\\\[\]"]/g, " ")
        .replace(/u00f1/g, 'ñ')
        .replace(/u00D1/g, 'Ñ')
        .trim()
    );
    const existe = datos.length > 1;
    if (existe && esCedula) {
      document.getElementById("nombre").value = datos[0];
      document.getElementById("primerapellido").value = datos[1].replace(/\s+/g, '') || "";
      document.getElementById("segundoapellido").value = datos[2] || "";
    }
    setReadOnly(existe);
  } catch (err) {
    console.error("Falló al obtener datos:", err);
    setReadOnly(false);
  }

  function setReadOnly(isReadOnly) {
    ["nombre", "primerapellido", "segundoapellido"].forEach(id => {
      document.getElementById(id).readOnly = isReadOnly;
    });
  }
}

function datacarreras() {
    var select = document.getElementById("mi_select");
    select.options.length = 0; // Eliminamos todas las opciones anteriores

    fetch("/carrerasselect/").then(response => response.json()).then(data => {
        // Iteramos sobre los valores obtenidos
        data.forEach(function (valor) {
            // Creamos una nueva opción y la agregamos al select
            var opcion = document.createElement("option");
            opcion.value = valor;
            opcion.text = valor;
            select.add(opcion);
        });
    });
}


function checkOtro() {
    // Obtener el valor seleccionado del select
    var selectedValue = document.getElementById("genero").value;
    // Si se seleccionó "Otro", mostrar el modal
    if (selectedValue === "Otro") {
        $('#modal_inclusivo').modal('show');
    }
}

function continuarGenero() {
    var inputValue = document.getElementById("trato2").value;
    var selectedValue = document.getElementById("tipoTrato").value;

    document.getElementById("otro_trato").value = inputValue;
    document.getElementById("otro_sexo").value = selectedValue;

    $('#modal_inclusivo').modal('hide');
}

var provinciasCargadas = false;

function cargarProvincias() {
    if (provinciasCargadas) {
        return;
    }

    var select = document.getElementById("provincia_select");

    var url = "/obtener-provincia/";
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            select.options.length = 0;
            for (key in data) {
                var option = document.createElement("option");
                option.value = key;
                option.text = data[key];
                select.add(option);
            }
            provinciasCargadas = true;
            dataCantones(select);
            obtenerProvincia(select)
        }
    };
    request.send();
}

function cargarCantones(valor) {
    var select = document.getElementById("canton_select");
    var select2 = document.getElementById("distrito_select");

    var url = "/obtener-canton/?provincia_select=";
    var request = new XMLHttpRequest();
    request.open('GET', url + encodeURIComponent(valor), true);
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            select.options.length = 0;
            for (key in data) {
                var option = document.createElement("option");
                option.value = key;
                option.text = data[key];
                select.add(option);
            }
            dataDistritos(select)
            obtenerCanton(select)
        }
    };
    request.send();
}

function cargarDistritos(valor1, valor2) {
    var select = document.getElementById("distrito_select");

    var url = "/obtener-distrito/?provincia_select=" + encodeURIComponent(valor1) + "&canton_select=" + encodeURIComponent(valor2);
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
        if (request.status === 200) {
            var data = JSON.parse(request.responseText);
            select.options.length = 0;
            for (key in data) {
                var option = document.createElement("option");
                option.value = key;
                option.text = data[key];
                select.add(option);
            }
            obtenerDistrito(select)
        }
    };
    request.send();
}

var paisCargadas = false;
function cargarPais() {
    if (paisCargadas) {
        return;
    }
    var select = $('#pais_select');
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccione Nacionalidad", "", true, true);
    select.append(opcionPorDefecto);
    fetch("/obtener-nacionalidad/")
    .then((response) => response.json())
    .then((data) => {
        data.forEach(function (valor) {
            // Creamos una nueva opción y la agregamos al select
            var opcion = new Option(valor, valor);
            select.append(opcion);
        });
        paisCargadas = true;
        $('#pais_select').select2({
            width: "100%", // Ancho del dropdown
        });
        $('#pais_select').one('select2:open',function (e) {
            $('input.select2-search__field').prop('placeholder', 'Buscar País');
        });
    });
}

function dataCantones(select) {
    var valorSeleccionado = select.options[select.selectedIndex].value;
    cargarCantones(valorSeleccionado);
}

function dataDistritos(select) {
    const miSelect = document.getElementById('provincia_select');
    var valorSeleccionado = select.options[select.selectedIndex].value;

    cargarDistritos(miSelect.value, valorSeleccionado);
}

function obtenerPais(select) {
    var textoSeleccionado = select.options[select.selectedIndex].text;
    document.getElementById('pais').value = textoSeleccionado;
}

function obtenerProvincia(select) {
    var textoSeleccionado = select.options[select.selectedIndex].text;
    document.getElementById('provincia').value = textoSeleccionado;
    dataCantones(select)
}

function obtenerCanton(select) {
    var textoSeleccionado = select.options[select.selectedIndex].text;
    document.getElementById('canton').value = textoSeleccionado;
    dataDistritos(select)
}

function obtenerDistrito(select) {
    var textoSeleccionado = select.options[select.selectedIndex].text;
    document.getElementById('distrito').value = textoSeleccionado;
}

function mostrarAnterior() {
    const tabActivo = document.querySelector(".tab-pane.active");
    const tabAnterior = tabActivo.previousElementSibling;

    if (tabAnterior) {
        const linkActivo = document.querySelector(".nav-link.active");
        const linkAnterior = linkActivo.parentElement.previousElementSibling.querySelector(".nav-link");

        tabActivo.classList.remove("active");
        tabActivo.classList.remove("show");
        tabAnterior.classList.add("active");
        tabAnterior.classList.add("show");

        linkActivo.classList.remove("active");
        linkAnterior.classList.add("active");
    }
}
function mostrarSiguiente() {
    const tabActivo = document.querySelector(".tab-pane.active");
    const tabSiguiente = tabActivo.nextElementSibling;

    if (tabActivo) {
        const linkActivo = document.querySelector(".nav-link.active");
        const linkSiguiente = linkActivo.parentElement.nextElementSibling.querySelector(".nav-link");

        tabActivo.classList.remove("active");
        tabActivo.classList.remove("show");
        tabSiguiente.classList.add("active");
        tabSiguiente.classList.add("show");

        linkActivo.classList.remove("active");
        linkSiguiente.classList.add("active");
    }
}

var codigo = 0;
var result;
function enviarCodigo() {
    var nombre = document.getElementById("nombre");
    var primer_apellido = document.getElementById("primerapellido");
    var segundo_apellido = document.getElementById("segundoapellido");
    var nombreCompleto = nombre.value + ' ' + primer_apellido.value + ' ' + segundo_apellido.value;
    console.log(nombreCompleto);
    var correo = document.getElementById("correo");
    console.log(correo.value);
    var url = "/codigoVerificacion/?nombre=" + encodeURIComponent(nombreCompleto) + "&correo=" + encodeURIComponent(correo.value);

    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = function () {
        if (request.status === 200) {
            codigo = JSON.parse(request.responseText);
            console.log(codigo)
        }
    };
    request.send();
}

function llamarFunciones() {
    validatePasswords()
    if (!result) {
        if (codigo == 0) {
            enviarCodigo();
        }
        mostrarSiguiente();
    }
}

function moverInput(evento, siguiente) {
    const tamano = evento.target.value.length;
    const maximo = evento.target.getAttribute("maxlength");

    if (tamano >= maximo) {
        if (siguiente <= 4) {
            document.getElementById("input" + siguiente).focus();
        } else {
            document.getElementById("input" + siguiente).blur();
        }
    }
}

function verificarCodigo() {
    var input1 = document.getElementById('input1');
    var input2 = document.getElementById('input2');
    var input3 = document.getElementById('input3');
    var input4 = document.getElementById('input4');
    var butonRegistrar = document.getElementById('registrarEstudiante');
    var codigoCompleto = input1.value + input2.value + input3.value + input4.value;
    const resultado = codigoCompleto == codigo;
    butonRegistrar.classList.toggle('disabled', !resultado);
}

$(document).ready(function () {
    $('#tipo, #identificacion, #nombre, #primerapellido, #segundoapellido, #fechanacimiento, #telefono, #genero, #pais_select').on('change input', habilitarStep2);

    $('#provincia_select, #distrito_select, #canton_select, #direccion_exacta').on('change input', habilitarStep3);

    $('#correo, #password1, #password2').on('input', habilitarStep4);

    cargarPais();

    cargarCalendario();
});

function cargarCalendario(){
    var fechaActual = new Date();

    // Calcula la fecha hace 16 años
    var fechaHace16Anios = new Date(fechaActual.getFullYear() - 16, fechaActual.getMonth(), fechaActual.getDate());

    // Formatea la fecha en el formato YYYY-MM-DD
    var fechaFormateada = fechaHace16Anios.toISOString().slice(0, 10);

    // Establece el atributo 'max' en el input de fecha
    document.getElementById('fechanacimiento').setAttribute('max', fechaFormateada);
}

function habilitarStep2() {
    const botonSiguienteDatosP = document.getElementById('botonSiguienteDatosP');
    const direccionUl = document.getElementById('direccionUl');
    const tipoSelect = document.getElementById('tipo');
    const identificacion = document.getElementById('identificacion');
    const nombre = document.getElementById('nombre');
    const primerApe = document.getElementById('primerapellido');
    const segundoApe = document.getElementById('segundoapellido');
    const fecha = document.getElementById('fechanacimiento');
    const genero = document.getElementById('genero');
    const telefono = document.getElementById('telefono');
    const nacionalidad = document.getElementById('pais_select');

    const tipoValue = tipoSelect.value;
    const identificacionValue = identificacion.value;
    const nombreValue = nombre.value;
    const primerApeValue = primerApe.value;
    const segundoApeValue = segundoApe.value;
    const fechaValue = fecha.value;
    const generoValue = genero.value;
    const telefonoValue = telefono.value;
    const nacionalidadValue = nacionalidad.value;

    const resultado = tipoValue && identificacionValue
        && nombreValue && primerApeValue && segundoApeValue
        && fechaValue && generoValue && telefonoValue
         && nacionalidadValue;

    botonSiguienteDatosP.classList.toggle('disabled', !resultado);
    direccionUl.classList.toggle('disabled', !resultado);
}

function habilitarStep3() {
    const botonSiguienteDireccionP = document.getElementById('botonSiguienteDireccionP');
    const correoUl = document.getElementById('correoUl');
    const provincia = document.getElementById('provincia_select');
    const canton = document.getElementById('canton_select');
    const distrito = document.getElementById('tipo');
    const direccionExacta = document.getElementById('direccion_exacta');
    const provinciaValue = provincia.value;
    const cantonValue = canton.value;
    const distritoValue = distrito.value;
    const direccionExactaValue = direccionExacta.value;
    const resultado = provinciaValue && cantonValue && distritoValue && direccionExactaValue

    botonSiguienteDireccionP.classList.toggle('disabled', !resultado);
    correoUl.classList.toggle('disabled', !resultado);
}

function habilitarStep4() {
    const botonSiguienteCorreoP = document.getElementById('botonSiguienteCorreoP');
    codigo = 0;
    const correo = document.getElementById('correo');
    const contrasena = document.getElementById('password1');
    const contrasena2 = document.getElementById('password2');
    const correoValue = correo.value;
    const contrasenaValue = contrasena.value;
    const contrasena2Value = contrasena2.value;
    const resultado = correoValue && contrasenaValue && contrasena2Value;

    botonSiguienteCorreoP.classList.toggle('disabled', !resultado);
}

function validatePasswords() {
    const passwordErrorDiv = document.getElementById('messageDiv');
    const passwordError = document.getElementById('message');
    const passwordInput = document.getElementById('password1');
    const passwordInput2 = document.getElementById('password2');
    const password = passwordInput.value;
    const password2 = passwordInput2.value;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_.:;,\-\+\]\[\}\{\¡\¿\'\?=\´~\"!°¬|])[A-Za-z\d!@#$%^&*()_.:;,\-\+\]\[\}\{\¡\¿\'\?=\´~\"!°¬|]{8,}$/;

    if (password !== password2) {
        passwordErrorDiv.style.display = 'block';
        passwordError.textContent = "Las contraseñas no coinciden";
        result = true;
        botonSiguienteCorreoP.classList.toggle('disabled', result);
        validarUl.classList.toggle('disabled', result);
        setTimeout(function () {
            passwordErrorDiv.style.display = 'none';
        }, 8000);
    } else if (!passwordPattern.test(password)) {
        passwordErrorDiv.style.display = 'block';
        passwordError.textContent = "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un carácter especial.";
        result = true;
        botonSiguienteCorreoP.classList.toggle('disabled', result);
        validarUl.classList.toggle('disabled', result);
        setTimeout(function () {
            passwordErrorDiv.style.display = 'none';
        }, 8000);
    } else {
        passwordErrorDiv.style.display = 'none';
        passwordError.textContent = "";
        result = false;
        botonSiguienteCorreoP.classList.toggle('disabled', result);
        validarUl.classList.toggle('disabled', result);
    }
}


showPassword = (id, icono) => {
    var password = document.getElementById(id);
    const eyeButton = document.querySelector(icono);
    if (password.type === "password") {
        password.type = "text";
        eyeButton.classList.remove("fa-eye-slash");
        eyeButton.classList.add("fa-eye");
    } else {
        password.type = "password";
        eyeButton.classList.remove("fa-eye");
        eyeButton.classList.add("fa-eye-slash");
    }
}