$(document).ready(function () {
    $('.linkTitulo').hover(function () {
        $('#modalArchivoTitulo').modal('show');
    });
    $('.linkTituloUniver').hover(function () {
        $('#modalArchivoTituloUniver').modal('show');
    });
    $('.linkIdentificacion').hover(function () {
        $('#modalArchivoIdentificacion').modal('show');
    });
    $('.linkFoto').hover(function () {
        $('#modalArchivoFoto').modal('show');
    });
    $('.linkNota').hover(function () {
        $('#modalArchivoNota').modal('show');
    });
    $('.linkPlan').hover(function () {
        $('#modalArchivoPlan').modal('show');
    });
});


document.addEventListener('DOMContentLoaded', () => {
    var valor;
    var estado = document.getElementById('estado');
    var convalidacion = document.getElementById('conv').value;
    var universitario = document.getElementById('univer').value;
    var tipoform = document.getElementById('tipoform').value;

    var doc_titulo = document.getElementById('tituloTF').value;
    var doc_tituloU = document.getElementById('tituloTU').value;
    var doc_ident = document.getElementById('identificacionTF').value;
    var doc_pasaporte = document.getElementById('fotoTF').value;
    var doc_notas = document.getElementById('notaTF').value;
    var doc_estudio = document.getElementById('planTF').value;

    if (estado !== null) {
        valor = estado.textContent;
    } else {
        console.log('El elemento span no existe en el documento');
    }

    var progressBar = document.getElementById("barra_progreso");
    var comentarios = document.getElementById("comentarios");
    var estadotext = document.getElementById("comentarios");

    var divconvalidacion = document.getElementById("div_convalidacion");
    var divconvalidacion2 = document.getElementById("div_convalidacion2");

    var divtitUniversitario = document.getElementById("div_titUniversitario");

    var divtitulo = document.getElementById("div_tituloEducacion");
    var divfotoperfil = document.getElementById("div_fotopasaporte");

    var imgtitulo = document.getElementById("img_titulo");
    var imgtituloU = document.getElementById("img_tituloU");
    var imgidentificacion = document.getElementById("img_ident");
    var imgpasaporte = document.getElementById("img_pasaporte");
    var imgnotas = document.getElementById("img_notas");
    var imgestudio = document.getElementById("img_estudio");


    // Obtener el estado del objeto de la base de datos en Django
    var documentocargado = document.getElementById("documentocargado");

    switch (valor) {
        case "Enviado":
            progressBar.style.width = "10%";
            break;
        case "Recibido":
            progressBar.style.width = "25%";
            break;
        case "En Revisión":
            progressBar.style.width = "50%";
            break;
        case "Revisión de Convalidaciones":
            progressBar.style.width = "75%";
            break;
        case "Aprobado":
            progressBar.style.width = "100%";
            progressBar.style.backgroundColor = "green";
            aprobado();
            break;
        case "Corrección Requerida":
            progressBar.style.width = "75%";
            progressBar.style.backgroundColor = "rgb(255, 80, 0)";

            var btnINT = document.getElementById('btnINT');
            var btnINTU = document.getElementById('btnINTU');
            var btnINI = document.getElementById('btnINI');
            var btnINF = document.getElementById('btnINF');
            var btnINN = document.getElementById('btnINN');
            var btnINP = document.getElementById('btnINP');

            var btnCET = document.getElementById('btn_cambiarestado_titulo');
            var btnCETU = document.getElementById('btn_cambiarestado_tituloU');
            var btnCEI = document.getElementById('btn_cambiarestado_ident');
            var btnCEF = document.getElementById('btn_cambiarestado_foto');
            var btnCEN = document.getElementById('btn_cambiarestado_notas');
            var btnCEE = document.getElementById('btn_cambiarestado_estudio');

            btnINT.onclick = function () {
                cambiarInput('titulo');
            }

            btnINTU.onclick = function () {
                cambiarInput('tituloU');
            }

            btnINI.onclick = function () {
                cambiarInput('identificacion');
            }

            btnINF.onclick = function () {
                cambiarInput('foto');
            }

            btnINN.onclick = function () {
                cambiarInput('nota');
            }

            btnINP.onclick = function () {
                cambiarInput('plan');
            }


            btnCET.onclick = function () {
                console.log('entre 1')
                documentocargado.value = "tituloeducacion";
                cambiarestado('titulo');
            }

            btnCETU.onclick = function () {
                console.log('entre 2')
                documentocargado.value = "titulouniversitario";
                cambiarestado('tituloU');
            }

            btnCEI.onclick = function () {
                documentocargado.value = "identificacion";
                cambiarestado('identificacion');
            }

            btnCEF.onclick = function () {
                documentocargado.value = "fotoperfil";
                cambiarestado('foto');
            }

            btnCEN.onclick = function () {
                documentocargado.value = "record_academico";
                cambiarestado('notas');
            }

            btnCEE.onclick = function () {
                documentocargado.value = "plan_estudio";
                cambiarestado('plan');
            }

            correccion();
            break;
        case "Rechazado":
            progressBar.style.width = "50%";
            break;
        default:
            progressBar.style.width = "0%";
    }

    if (convalidacion == "True") {
        divconvalidacion.style.display = "block";
        divconvalidacion2.style.display = "block";
    }

    if (universitario == "True") {
        divtitUniversitario.style.display = "block";
    }

    if (tipoform == "CL") {
        divtitulo.style.display = "none";
        divfotoperfil.style.display = "none";
    }

    function correccion() {
        var spinner0 = document.getElementById("spinner0");
        var spinner1 = document.getElementById("spinner1");
        var spinner2 = document.getElementById("spinner2");
        var spinner3 = document.getElementById("spinner3");
        var spinner4 = document.getElementById("spinner4");
        var spinner5 = document.getElementById("spinner5");

        var cardT = document.getElementById("cardT");
        var cardTU = document.getElementById("cardTU");
        var cardI = document.getElementById("cardI");
        var cardF = document.getElementById("cardF");
        var cardN = document.getElementById("cardN");
        var cardP = document.getElementById("cardP");

        if (doc_titulo == "False") {

            imgtitulo.src = "../../../../static/img/error.png";
            imgtitulo.hidden = false;
            cardT.style.backgroundColor = '#FFA67E';
            spinner1.style.display = "none";
            imgtitulo.width = 35;
            imgtitulo.height = 35;
        }

        if (doc_tituloU == "False") {

            imgtituloU.src = "../../../../static/img/error.png";
            imgtituloU.hidden = false;
            cardTU.style.backgroundColor = '#FFA67E';
            spinner0.style.display = "none";
            imgtituloU.width = 35;
            imgtituloU.height = 35;
        }

        if (doc_ident == "False") {

            imgidentificacion.src = "../../../../static/img/error.png";
            cardI.style.backgroundColor = '#FFA67E';
            imgidentificacion.hidden = false;
            spinner2.style.display = "none";
            imgidentificacion.width = 35;
            imgidentificacion.height = 35;

        }

        if (doc_pasaporte == "False") {

            imgpasaporte.src = "../../../../static/img/error.png";
            cardF.style.backgroundColor = '#FFA67E';
            imgpasaporte.hidden = false;
            spinner3.style.display = "none";
            imgpasaporte.width = 35;
            imgpasaporte.height = 35;

        }

        if (convalidacion == "True") {
            if (doc_notas == "False") {

                imgnotas.src = "../../../../static/img/error.png";
                cardN.style.backgroundColor = '#FFA67E';
                imgnotas.hidden = false;
                spinner4.style.display = "none";
                imgnotas.width = 35;
                imgnotas.height = 35;

            }

            if (doc_estudio == "False") {

                imgestudio.src = "../../../../static/img/error.png";
                cardP.style.backgroundColor = '#FFA67E';
                imgestudio.hidden = false;
                spinner5.style.display = "none";
                imgestudio.width = 35;
                imgestudio.height = 35;


            }
        }

    }

    function aprobado() {
        var spinner0 = document.getElementById("spinner0");
        var spinner1 = document.getElementById("spinner1");
        var spinner2 = document.getElementById("spinner2");
        var spinner3 = document.getElementById("spinner3");
        var spinner4 = document.getElementById("spinner4");
        var spinner5 = document.getElementById("spinner5");
        var cardT = document.getElementById("cardT");
        var cardTU = document.getElementById("cardTU");
        var cardI = document.getElementById("cardI");
        var cardF = document.getElementById("cardF");
        var cardN = document.getElementById("cardN");
        var cardP = document.getElementById("cardP");

        imgtitulo.src = "../../../../static/img/check.png";
        imgtitulo.hidden = false;
        cardT.style.backgroundColor = '#7FFF7F';
        spinner1.style.display = "none";
        imgtitulo.width = 50;
        imgtitulo.height = 50;

        imgtituloU.src = "../../../../static/img/check.png";
        imgtituloU.hidden = false;
        cardTU.style.backgroundColor = '#7FFF7F';
        spinner0.style.display = "none";
        imgtituloU.width = 50;
        imgtituloU.height = 50;


        imgidentificacion.src = "../../../../static/img/check.png";
        imgidentificacion.hidden = false;
        cardI.style.backgroundColor = '#7FFF7F';
        spinner2.style.display = "none";
        imgidentificacion.width = 50;
        imgidentificacion.height = 50;


        imgpasaporte.src = "../../../../static/img/check.png";
        imgpasaporte.hidden = false;
        cardF.style.backgroundColor = '#7FFF7F';
        spinner3.style.display = "none";
        imgpasaporte.width = 50;
        imgpasaporte.height = 50;


        imgnotas.src = "../../../../static/img/check.png";
        imgnotas.hidden = false;
        cardN.style.backgroundColor = '#7FFF7F';
        spinner4.style.display = "none";
        imgnotas.width = 50;
        imgnotas.height = 50;


        imgestudio.src = "../../../../static/img/check.png";
        imgestudio.hidden = false;
        spinner5.style.display = "none";
        cardP.style.backgroundColor = '#7FFF7F';
        imgestudio.width = 50;
        imgestudio.height = 50;

    }

    function cambiarestado(documento) {

        if (documento == "titulo") {
            imgtitulo.hidden = true;
            spinner1.style.display = "block";
            cardT.style.backgroundColor = '#FFFFFF';
        }

        if (documento == "tituloU") {
            imgtituloU.hidden = true;
            spinner0.style.display = "block";
            cardTU.style.backgroundColor = '#FFFFFF';
        }

        if (documento == "identificacion") {
            imgidentificacion.hidden = true;
            spinner2.style.display = "block";
            cardI.style.backgroundColor = '#FFFFFF';
        }

        if (documento == "foto") {
            imgpasaporte.hidden = true;
            spinner3.style.display = "block";
            cardF.style.backgroundColor = '#FFFFFF';
        }

        if (documento == "notas") {
            imgnotas.hidden = true;
            spinner4.style.display = "block";
            cardN.style.backgroundColor = '#FFFFFF';
        }

        if (documento == "plan") {
            imgestudio.hidden = true;
            spinner5.style.display = "block";
            cardP.style.backgroundColor = '#FFFFFF';
        }
    }

    function cambiarInput(archivo) {
        var formularioT = document.getElementById("div_titulo");
        var formularioTU = document.getElementById("div_tituloU");
        var formularioI = document.getElementById("div_identificacion");
        var formularioF = document.getElementById("div_pasaporte");
        var formularioN = document.getElementById("div_notas");
        var formularioP = document.getElementById("div_estudio");
        formularioT.style.display = "none";
        formularioTU.style.display = "none";
        formularioI.style.display = "none";
        formularioF.style.display = "none";
        formularioN.style.display = "none";
        formularioP.style.display = "none";
        if (archivo === 'titulo') {
            formularioT.style.display = "block";
        }
        if (archivo === 'tituloU') {
            formularioTU.style.display = "block";
        }
        else if (archivo === 'identificacion') {
            formularioI.style.display = "block";
        }

        else if (archivo === 'foto') {
            formularioF.style.display = "block";
        }

        else if (archivo === 'nota') {
            formularioN.style.display = "block";
        }

        else if (archivo === 'plan') {
            formularioP.style.display = "block";
        }
    }
});