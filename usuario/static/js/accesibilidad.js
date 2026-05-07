$(document).ready(function () {
    var zoomIn = document.getElementById('zoomIn');
    zoomIn.onclick = function () {
        aumentarFuente();
    }

    var zoomOut = document.getElementById('zoomOut');
    zoomOut.onclick = function () {
        disminuirFuente();
    }

    var restablecer = document.getElementById('refres');
    restablecer.onclick = function () {
        restablecerFuente();
    }

    var daltonize = document.getElementById('daltonismType');
    daltonize.onchange = function () {
        changeColor();
    }

    var closeSocial = document.getElementById('closeSocial');
    closeSocial.onclick = function () {
        hideNavbar();
    }
    var openSocial = document.getElementById('openSocial');
    openSocial.onclick = function () {
        toggleNavbar();
    }

    loadGoogleTranslateAPI();
    $('.google-translate-select').select2();
});


function aumentarFuente() {
    var contenido = document.getElementById('htmlbody');
    var tamañoActual = window.getComputedStyle(contenido, null).getPropertyValue("font-size");
    var tamañoNuevo = parseInt(tamañoActual) + 2;
    var texto = document.getElementById('textoCardForm');
    if (texto){
        document.getElementById('textoCardForm').style.fontSize = tamañoNuevo + "px";
    }
    contenido.style.fontSize = tamañoNuevo + "px";
}


function disminuirFuente() {
    var contenido = document.getElementById('htmlbody');
    var tamañoActual = window.getComputedStyle(contenido, null).getPropertyValue("font-size");
    var tamañoNuevo = parseInt(tamañoActual) - 2;
    if (texto){
        document.getElementById('textoCardForm').style.fontSize = tamañoNuevo + "px";
    }
    contenido.style.fontSize = tamañoNuevo + "px";
}

function restablecerFuente() {
    var contenido = document.getElementById('htmlbody');
    contenido.style.fontSize = "";
    if (texto){
        document.getElementById('textoCardForm').style.fontSize = tamañoNuevo + "px";
    }
}

function googleTranslateElementInit() {
    new google.translate.TranslateElement(
      {
        pageLanguage: 'es',
        autoDisplay: false,
        gaTrack: true,
      },
      'google_translate_element'
    );

    // Add 'select2' styles to the language dropdown
    const googleTranslateSelect = document.querySelector('.goog-te-combo');
    googleTranslateSelect.classList.add('google-translate-select');
    googleTranslateSelect.classList.add('form-select');
    $('#skiptranslate').text('Hola');
  }

  // Load the Google Translate API script
  function loadGoogleTranslateAPI() {
    const script = document.createElement('script');
    script.src = '/static/js/pluginJs/traductor.js';
    document.body.appendChild(script);
  }

function changeColor() {
    var type = document.getElementById('daltonismType').value;
    var body = document.getElementById('htmlbody');
    body.classList.add('scroll-horizontal');
    if (type === 'normal') {
        body.style.filter = 'none';
        body.classList.remove('scroll-horizontal');
    } else if (type === 'protanopia') {
        body.style.filter = 'url(#protanopia)';
    } else if (type === 'deuteranopia') {
        body.style.filter = 'url(#deuteranopia)';
    } else if (type === 'tritanopia') {
        body.style.filter = 'url(#tritanopia)';
    } else if (type === 'monochromacy') {
        body.style.filter = 'url(#monochromacy)';
    } else if (type === 'enhance-r') {
        body.style.filter = 'url(#enhance-r)';
    } else if (type === 'enhance-g') {
        body.style.filter = 'url(#enhance-g)';
    }
    localStorage.setItem('selectedDaltonismType', type);
}
window.onload = function() {
    var selectedType = localStorage.getItem('selectedDaltonismType');
    if (selectedType) {
        document.getElementById('daltonismType').value = selectedType;
        changeColor(); // Aplicar el estilo según el valor guardado
    }
};
function hideNavbar() {
    var navbars = document.querySelectorAll('#liSocial');
    var hideButton = document.getElementById('closeSocial');
    var toggleButton = document.getElementById('openSocial');
    var navbar = document.getElementById('social-sidebar');

    navbars.forEach(function (navbar) {
        navbar.style.display = 'none'; // Ocultar la barra de navegación
    });
    hideButton.style.display = 'none'; // Ocultar el botón de ocultar navbar
    toggleButton.style.display = 'block'; // Mostrar el botón de mostrar navbar
    
}

function toggleNavbar() {
    var navbar = document.querySelectorAll('#liSocial');
    var hideButton = document.getElementById('closeSocial');
    var toggleButton = document.getElementById('openSocial');
    navbar.forEach(function (navbar) {
        navbar.style.display = ''; // Ocultar la barra de navegación
    });
    hideButton.style.display = 'block'; // Mostrar el botón de ocultar navbar
    toggleButton.style.display = 'none'; // Ocultar el botón de mostrar navbar
}