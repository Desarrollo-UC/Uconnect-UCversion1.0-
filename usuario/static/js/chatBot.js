$(document).ready(function () {
    var inputElement = document.getElementById('chat-input');
    inputElement.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { // Comprueba si se ha presionado la tecla Enter (código 13)
            sendMessage();
        }
    });
});

function mostrarForm() {
    const floatingForm = document.getElementById('floatingForm');
    if (floatingForm.style.display !== 'none') {
        floatingForm.style.display = 'none';
    } else {
        floatingForm.style.display = '';
    }
}

function sendMessage() {
    var messageDiv = document.createElement('div');
    messageDiv.id = 'cm-msg-1';
    messageDiv.className = 'chat-msg self';
    var message = document.createElement('div');
    message.className = 'cm-msg-text mb-3';
    messageDiv.appendChild(message);

    var inputMessage = document.getElementById('chat-input');
    var texto = inputMessage.value;
    var textoFormateado = "";

    for (var i = 0; i < texto.length; i++) {
        textoFormateado += texto[i];
        if ((i + 1) % 22 === 0) {
            textoFormateado += '\n';
        }
    }
    message.innerText = textoFormateado;
    setTimeout(function () {
        getResponse(textoFormateado);
    }, 1000);
    inputMessage.value = '';
    var logs = document.getElementById('chat-logs');
    inputMessage.focus();
    logs.appendChild(messageDiv);
}

function getResponse(repuesta) {
    var responseDiv = document.createElement('div');
    responseDiv.id = 'cm-msg-2';
    responseDiv.className = 'chat-msg user';
    var response = document.createElement('div');
    response.className = 'cm-msg-text';
    responseDiv.appendChild(response);
    response.innerText = repuesta;

    var logs = document.getElementById('chat-logs');
    logs.appendChild(responseDiv);
}