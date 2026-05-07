$(document).ready(function () {
    dataFormulario();
    var valor = document.getElementById("primer_ingreso").value;
    var titulo = document.getElementById("modal_actualizacionTitle");

  if (valor === "True") {
    $("#modal_actualizacion").modal("show");
    titulo.innerText =
      "RECOMENDAMOS ACTUALIZAR TUS DATOS PERSONALES EN TU PRIMER INGRESO AL SISTEMA";
  }
  llenardata();
});
const json = {};
function imagePerfil() {
    const idimagen = document.getElementById('perfilImg');
    const inputFile = document.getElementById('floatingFile');
    const file = inputFile.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            idimagen.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        idimagen.src = "#";
    }
}

function llenardata() {
    datacolegios();
}

function datacolegios() {
  var select = $("#colegio");
  select.empty(); // Eliminamos todas las opciones anteriores
  var opcionPorDefecto = new Option("Seleccione un colegio", "", true, true);
  select.append(opcionPorDefecto);
  fetch("/colegiosselect/")
    .then((response) => response.json())
    .then((data) => {
      // Iteramos sobre los valores obtenidos

      data.forEach(function (valor) {
        // Creamos una nueva opción y la agregamos al select
        var opcion = new Option(valor, valor);
        select.append(opcion);
      });
      select.select2({
        dropdownParent: $("#modal_actualizacion"),
        width: "100%", // Ancho del dropdown
      });
    });

  $("#colegio").one("select2:open", function (e) {
    $("input.select2-search__field").prop("placeholder", "Buscador");
  });
}

function dataFormulario() {
  var direccion = document.getElementById("direccion_exacta");
  if (direccion) {
    var direccionValue = direccion.value;
    direccion.addEventListener("change", function () {
      if (direccion.value !== direccionValue) {
        json.direccion = direccion.value;
      }
    });
  }

  var telefono = document.getElementById("telefono");
  if (telefono) {
    var telefonoValue = telefono.value;
    telefono.addEventListener("change", function () {
      if (telefono.value !== telefonoValue) {
        json.telefono = telefono.value;
      }
    });
  }

  var telefonoDos = document.getElementById("telefono2");
  if (telefonoDos) {
    var telefonoDosValue = telefonoDos.value;
    telefonoDos.addEventListener("change", function () {
      if (telefonoDos.value !== telefonoDosValue) {
        json.telefonoDos = telefonoDos.value;
      }
    });
  }

  var correo = document.getElementById("correo");
  if (correo) {
    var correoValue = correo.value;
    correo.addEventListener("change", function () {
      if (correo.value !== correoValue) {
        json.correo = correo.value;
      }
    });
  }
}

function habilitarDireccion() {
    var checkbox = document.getElementById("habilitarDireccion");
    var provinciaSelect = document.getElementById("provincia_select");
    var cantonSelect = document.getElementById("canton_select");
    var distritoSelect = document.getElementById("distrito_select");
    var direccionExacta = document.getElementById("direccion_exacta");

    if (checkbox.checked) {
        provinciaSelect.disabled = false;
        cantonSelect.disabled = false;
        distritoSelect.disabled = false;
        direccionExacta.disabled = false;
    } else {
        provinciaSelect.disabled = true;
        cantonSelect.disabled = true;
        distritoSelect.disabled = true;
        direccionExacta.disabled = true;
    }
}

function habilitarContactos() {
    var checkbox = document.getElementById("habilitarContactos");
    var telefono = document.getElementById("telefono");
    var telefonoDos = document.getElementById("telefono2");
    var correo = document.getElementById("correo");

    if (checkbox.checked) {
        telefono.disabled = false;
        telefonoDos.disabled = false;
        correo.disabled = false;
    } else {
        telefono.disabled = true;
        telefonoDos.disabled = true;
        correo.disabled = true;
    }
}

function enviarFormulario(event) {
  event.preventDefault();
  var data = {};
  function agregarSiExiste(id, propiedad) {
    var el = document.getElementById(id);
    if (el && el.value !== "") {
      data[propiedad] = el.value;
    }
  }
  agregarSiExiste("fechaNa", "fecha_nacimiento");
  agregarSiExiste("colegio", "colegio_procedencia");
  agregarSiExiste("pais_select", "pais");
  agregarSiExiste("fechagrad", "fecha_graduacion");
  agregarSiExiste("correo", "correo_personal");
  agregarSiExiste("ingresoEco", "ingresoEconomico");
  agregarSiExiste("provincia", "provincia");
  agregarSiExiste("canton", "canton");
  agregarSiExiste("distrito", "distrito");
  agregarSiExiste("direccion_exacta", "direccion");
  agregarSiExiste("telefono", "telefono");
  agregarSiExiste("telefono2", "telefono2");
  agregarSiExiste("pais_sexo", "pais_sexo");
  agregarSiExiste("grado", "grado");
  if (typeof json !== "undefined" && Object.keys(json).length > 0) {
    Object.assign(data, json);
  }
  if (Object.keys(json).length > 0) {
    Object.assign(data, json);
  }
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/enviar-solicitud/", true);
  xhr.setRequestHeader("Content-Type", "application/json");

  var csrfToken = getCSRFToken();
  xhr.setRequestHeader("X-CSRFToken", csrfToken);

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      closeModal();
      if (xhr.status === 200) {
        showToast("success");
        var primerIngreso = document.getElementById("primer_ingreso");
        if (primerIngreso) primerIngreso.value = "false";

        setTimeout(function () {
          location.reload();
        }, 2000);
      } else {
        showToast("error");
      }
    }
  };

  xhr.send(JSON.stringify(data));
}

function getCSRFToken() {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, 'csrftoken'.length + 1) === 'csrftoken=') {
                cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function closeModal() {
    $('#modal_actualizacion').modal('hide');
}

function showToast(message, type) {
    var toastElement = document.getElementById('liveToast');
    var toastBody = toastElement.querySelector('.toast-body');
    var toastCloseButton = toastElement.querySelector('.btn-close');
    var toastHeaderImg = toastElement.querySelector('#img_check');

    if (type === 'error') {
        toastElement.classList.add('bg-danger');
        toastHeaderImg.src = "../../../../static/img/error.png";
    } else {
        toastElement.classList.remove('bg-danger');
        toastHeaderImg.src = "../../../../static/img/check.png";
    }
    toastCloseButton.addEventListener('click', function () {
        var bootstrapToast = bootstrap.Toast.getInstance(toastElement);
        bootstrapToast.hide();
    });
    var bootstrapToast = new bootstrap.Toast(toastElement, { delay: 3000 });
    bootstrapToast.show();
}

var provinciasCargadas = false;

function cambiar_foto_modal() {
  $("#modal_foto").modal("show");
}

function cargarProvincias() {
  if (provinciasCargadas) {
    return;
  }

  var select = document.getElementById("provincia_select");

  var url = "/obtener-provincia/";
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
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
      obtenerProvincia(select);
    }
  };
  request.send();
}

function cargarCantones(valor) {
  var select = document.getElementById("canton_select");
  var select2 = document.getElementById("distrito_select");

  var url = "/obtener-canton/?provincia_select=";
  var request = new XMLHttpRequest();
  request.open("GET", url + encodeURIComponent(valor), true);
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
      dataDistritos(select);
      obtenerCanton(select);
    }
  };
  request.send();
}

function cargarDistritos(valor1, valor2) {
  var select = document.getElementById("distrito_select");

  var url =
    "/obtener-distrito/?provincia_select=" +
    encodeURIComponent(valor1) +
    "&canton_select=" +
    encodeURIComponent(valor2);
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
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
      obtenerDistrito(select);
    }
  };
  request.send();
}

var paisCargadas = false;

function cargarPais() {
  if (paisCargadas) {
    return;
  }

  var select = document.getElementById("pais_select");

  select.options.length = 0; // Eliminamos todas las opciones anteriores

  var url = "{% url 'obtener_nacionalidad' %}";
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.onload = function () {
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      for (key in data) {
        var option = document.createElement("option");
        option.value = key;
        option.text = data[key];
        select.add(option);
      }
      paisCargadas = true;
    }
  };
  request.send();
}

function dataCantones(select) {
  var valorSeleccionado = select.options[select.selectedIndex].value;
  cargarCantones(valorSeleccionado);
}

function dataDistritos(select) {
  const miSelect = document.getElementById("provincia_select");
  var valorSeleccionado = select.options[select.selectedIndex].value;

  cargarDistritos(miSelect.value, valorSeleccionado);
}

function obtenerPais(select) {
  var textoSeleccionado = select.options[select.selectedIndex].text;
  document.getElementById("pais").value = textoSeleccionado;
}
function obtenerProvincia(select) {
  var textoSeleccionado = select.options[select.selectedIndex].text;
  document.getElementById("provincia").value = textoSeleccionado;
  dataCantones(select);
}
function obtenerCanton(select) {
  var textoSeleccionado = select.options[select.selectedIndex].text;
  document.getElementById("canton").value = textoSeleccionado;
  dataDistritos(select);
}
function obtenerDistrito(select) {
  var textoSeleccionado = select.options[select.selectedIndex].text;
  document.getElementById("distrito").value = textoSeleccionado;
}
