function enviarCorreo(event) {
    event.preventDefault();
    var data = {};
    var identificacion = document.getElementById('idE');
    var status = document.getElementById('StatusE');
    var type = document.getElementById('typeE');

    var nombre = document.getElementById('nombre');
    var correo = document.getElementById('correo');
    var correoSend = document.getElementById('correoSend');
    var categorias = document.getElementById('categorias');
    var mensaje = document.getElementById('mensaje');
    const radios = document.querySelectorAll('input[name="departamento"]');
    let valorSeleccionado;

    radios.forEach((radio) => {
        if (radio.checked) {
            valorSeleccionado = radio.value;
        }
    });

    let correoSendNew;
     if (valorSeleccionado === 'Registro') {
        correoSendNew = 'registro@uc.ac.cr';
    } else {
        correoSendNew = 'soporte@uc.ac.cr';
    }
    
    data.nombre = nombre.value;
    data.correo = correo.value;
    data.correoSend = correoSendNew;
    data.departamento = valorSeleccionado;
    data.categorias = categorias.value;
    data.mensaje = mensaje.value;
    var jsonString = JSON.stringify(data);
    var xhr = new XMLHttpRequest();
    var url = `/${type.textContent}/${identificacion.textContent}/${status.textContent}/envioConsulta/`;
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    var csrfToken = getCSRFToken();
    xhr.setRequestHeader("X-CSRFToken", csrfToken);

    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response);

                if (response.response) {
                    closeModal();
                    showToast("success", valorSeleccionado);
                } else {
                    closeModal();
                    showToast("error", valorSeleccionado);
                }
            }

        };
    }
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
    $('#modal_contactenos').modal('hide');
}

function showToast(type, departamento) {
    var toastElement = document.getElementById('liveToast');
    var toastBody = toastElement.querySelector('.toast-body');
    var toastTittle = toastElement.querySelector('#titleToast');
    var toastCloseButton = toastElement.querySelector('.btn-close');
    var toastHeaderImg = toastElement.querySelector('#img_check');

    if (type === 'error') {
        toastTittle.innerText = 'Error en el envió de correo al departamento ' + departamento;
        toastElement.classList.add('bg-danger');
        toastHeaderImg.src = "../../../../static/img/error.png";
    } else {
        toastTittle.innerText = 'Se envio correctamente el correo al departamento ' + departamento;
        toastElement.classList.remove('bg-danger');
        toastHeaderImg.src = "../../../../static/img/check.png";
    }
    toastCloseButton.addEventListener('click', function () {
        var bootstrapToast = bootstrap.Toast.getInstance(toastElement);
        bootstrapToast.hide();
    });
    var bootstrapToast = new bootstrap.Toast(toastElement, { delay: 8000 });
    bootstrapToast.show();
}

function adjuntar() {
    document.getElementById("file").click();
    document.getElementById("file").addEventListener("change", function () {
        var fileName = this.value.split("\\").pop();
        document.getElementById('fileName').innerText = fileName;
        var selectedFile = this.files[0]; // Get the first selected file from the FileList
        if (selectedFile) {
            var fileSizeInBytes = selectedFile.size;
            var fileSizeInKB = fileSizeInBytes / 1024; // Convert to KB
            var roundedSize = Math.round(fileSizeInKB);
            document.getElementById('fileSize').innerText = ' ( ' + roundedSize + ' K )';
        }

        document.getElementById('rowFile').style.display = '';
    });
}

function enviarCorreoP(event) {
    event.preventDefault();
    const paraInput = document.getElementById("to");
    if (paraInput.value === "") {
        paraInput.setCustomValidity("Debe especificar al menos una dirección de correo en el campo 'Para'.");
    } else {
        paraInput.setCustomValidity("");
    }

    // Validación personalizada para el campo "CC"
    const ccInput = document.getElementById("cc");
    if (ccInput.value === "") {
        ccInput.setCustomValidity("Debe especificar al menos una dirección de correo en el campo 'CC'.");
    } else {
        ccInput.setCustomValidity("");
    }
    var selectedEmails = $('#to').val();
    var selectedEmailsCc = $('#cc').val();
    var emailsTextSeparatedByComma = selectedEmails.join(',');
    var emailInput = document.getElementById('paraE');
    emailInput.value = emailsTextSeparatedByComma;
    var emailAddresses = emailInput.value.split(',').map(email => email.trim());

    var emailsCC = selectedEmailsCc.join(',');
    var emailInputCC = document.getElementById('paraCC');
    emailInputCC.value = emailsCC;
    var emailAddressesCC = emailInputCC.value.split(',').map(emailCC => emailCC.trim());

    var formData = new FormData();
    formData.append('email', emailAddresses);
    formData.append('emailCC', emailAddressesCC);
    formData.append('asunto', document.getElementById('asunto').value);
    formData.append('mensaje', document.getElementById('message').value);

    // Obtener el archivo seleccionado
    var fileInput = document.getElementById('file');
    var archivo = fileInput.files[0];
    if (archivo) {
        formData.append('file', archivo);
    }

    var id = document.getElementById('idCP');
    var url = `/${id.textContent}/envioCorreoP/`;
    $('#exampleModal').modal('show');
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    var toastElement = document.getElementById('liveToast');
    var toastBody = toastElement.querySelector('#toastCorreo');
    var toastHeaderImg = toastElement.querySelector('#img_check');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                // Handle success response
                var response = JSON.parse(xhr.responseText);
                console.log(response);
                // Remueve todas las opciones
                $('#to').empty();
                $('#cc').empty();

                document.getElementById('asunto').value = '';
                document.getElementById('message').value = '';

                document.getElementById('file').value = '';
                document.getElementById('fileName').innerText = '';
                document.getElementById('fileSize').innerText = '';
                document.getElementById('rowFile').style.display = 'none'
                $('#exampleModal').modal('hide');
                toastElement.classList.remove('bg-danger');
                toastHeaderImg.src = "../../../../static/img/check.png";
                toastBody.innerText = response.message;
                var bootstrapToast = new bootstrap.Toast(toastElement, { delay: 3000 });
                bootstrapToast.show();
            } else {
                toastElement.classList.add('bg-danger');
                toastHeaderImg.src = "../../../../static/img/error.png";
                toastBody.innerText = xhr.responseText.message;
                var bootstrapToastE = new bootstrap.Toast(toastElement, { delay: 3000 });
                bootstrapToastE.show();
                console.error(xhr.status, xhr.responseText);
            }
        }
    };

    xhr.send(formData);
}

function cleanInput() {
    document.getElementById('file').value = '';
    document.getElementById('fileName').innerText = '';
    document.getElementById('fileSize').innerText = '';
    document.getElementById('rowFile').style.display = 'none'
}