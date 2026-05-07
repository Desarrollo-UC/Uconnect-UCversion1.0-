$(document).ready(function () {
    dataFormulario();
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

function dataFormulario() {
    var direccion = document.getElementById("direccion_exacta");
    var direccionValue = direccion.value;
    direccion.addEventListener("change", function () {
        var newDireccion = direccion.value;
        if (newDireccion !== direccionValue) {
            newDireccion = direccion.value;
            json.direccion = newDireccion;
        }
    });

    var telefono = document.getElementById("telefono");
    var telefonoValue = telefono.value;
    telefono.addEventListener("change", function () {
        var newtelefono = telefono.value;
        if (newtelefono !== telefonoValue) {
            newtelefono = telefono.value;
            json.telefono = newtelefono;
        }
    });

    var telefonoDos = document.getElementById("telefono2");
    var telefonoDosValue = telefonoDos.value;
    telefonoDos.addEventListener("change", function () {
        var newtelefonoDos = telefonoDos.value;
        if (newtelefonoDos !== telefonoDosValue) {
            newtelefonoDos = telefonoDos.value;
            json.telefonoDos = newtelefonoDos;
        }
    });

    var correo = document.getElementById("correo");
    var correoValue = correo.value;
    correo.addEventListener("change", function () {
        var newcorreo = correo.value;
        if (newcorreo !== correoValue) {
            newcorreo = correo.value;
            json.correo = newcorreo;
        }
    });
}

function enviarFormulario(event) {
    event.preventDefault();
    var data = {};
    data.provincia = document.getElementById('provincia').value;
    data.canton = document.getElementById('canton').value;
    data.distrito = document.getElementById('distrito').value;
    data.direccion = document.getElementById('direccion_exacta').value;
    data.telefono = document.getElementById('telefono').value;
    data.telefono2 = document.getElementById('telefono2').value;
    if (Object.keys(json).length > 0) {
        Object.assign(data, json);
    }
    var jsonString = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    var url = `/enviar-solicitud-temp/`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var csrfToken = getCSRFToken();
    xhr.setRequestHeader("X-CSRFToken", csrfToken);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                closeModal();
                $('#modal_act_final').modal('show');
                showToast(response.message, "success");
            } else {
                closeModal();
                showToast(response.message, "error");
            }
        }

    };
    xhr.send(jsonString);
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

    toastBody.innerText = message;

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