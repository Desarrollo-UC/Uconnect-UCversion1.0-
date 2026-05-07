var modal_form = document.getElementById('modal_forms');
var modal_instrucciones = document.getElementById('modal_instrucciones');

if (modal_form) {
    modal_form.addEventListener('hidden.bs.modal', function () {
        var btn_terms = document.getElementById('btn-terms');
        btn_terms.style.display = 'inline-block';
        
        var labelTitulo = document.getElementById("labeltitulo");

        var divTitulo = document.getElementById("divTitulo");
        var divTituloUniversidad = document.getElementById("divTituloUniversidad");
        var divTituloUniversidadPI = document.getElementById("divTituloUniversidadPI");
        var divUniversidadPI = document.getElementById("divUniversidadPI");
        var divIdent = document.getElementById("divIdent");
        var divFoto = document.getElementById("divFoto");
        var divIngreso = document.getElementById("divIngreso");
        var divColegio = document.getElementById("divColegio");
        var divUniversidad = document.getElementById("divUniversidad");
        var divCarreraSede = document.getElementById("divCarreraSede");
        var divCarrera = document.getElementById("divCarrera");
        var divConvalidacionCheck = document.getElementById("divConvalidacionCheck");
        var divCertificaciones = document.getElementById("certificaciones");
        // var divAsesorCheck = document.getElementById("divAsesorCheck");
        // var divSelectAsesor = document.getElementById("select_asesor");

        var titulobachillerto = document.getElementById("titulobachillerto");
        var titulouniversitario = document.getElementById("titulouniversitario");
        var titulouniversitarioPI = document.getElementById("titulouniversitarioPI");
        var universidad_selectPI = document.getElementById("universidad_selectPI");
        var cedulafotografia = document.getElementById("cedulafotografia");
        var fotoperfil = document.getElementById("fotoperfil");
        var ingreso_economico = document.getElementById("ingreso_economico");
        var colegio_select = document.getElementById("colegio_select");
        var universidad_select = document.getElementById("universidad_select");
        var carrera_sede = document.getElementById("carrera_sede");
        var carrera_select = document.getElementById("carrera_select");
        var convalidacion = document.getElementById("convalidacion");
        // var certificacionnotas = document.getElementById("certificacionnotas");
        // var planestudio = document.getElementById("planestudio");
        // var asesor = document.getElementById("asesor");
        // var asesor_select = document.getElementById("asesor_select");

        var terminos_botton = document.getElementById("flexRadioDefault1");

        var formAction = document.getElementById("formProspecto");
        var modalTitulo = document.getElementById("modal_formsTitle");

        var carrera_select_label = document.getElementById("carrera_select_label");

        titulobachillerto.value = "";
        titulouniversitario.value = "";
        titulouniversitarioPI.value = "";
        universidad_selectPI.value = "";
        cedulafotografia.value = "";
        fotoperfil.value = "";
        ingreso_economico.value = "";
        colegio_select.value = "";
        universidad_select.value = "";
        carrera_sede.value = "";
        carrera_select.value = "";
        // certificacionnotas.value = "";
        // planestudio.value = "";
        // asesor_select.value = "";

        titulobachillerto.required = false;
        titulouniversitario.required = false;
        titulouniversitarioPI.required = false;
        universidad_selectPI.value = "";
        cedulafotografia.required = false;
        fotoperfil.required = false;
        ingreso_economico.required = false;
        carrera_sede.required = false;
        carrera_select.required = false;

        // convalidacion.checked = false;
        // asesor.checked = false;
        terminos_botton.checked = false;

        divTitulo.style.display = "block";
        divTituloUniversidad.style.display = "block";
        divTituloUniversidadPI.style.display = "block";
        divUniversidadPI.style.display = "block";
        divIdent.style.display = "block";
        divFoto.style.display = "block";
        divIngreso.style.display = "block";
        divColegio.style.display = "block";
        divUniversidad.style.display = "none";
        divCarreraSede.style.display = "block";
        divCarrera.style.display = "block";
        // divConvalidacionCheck.style.display = "block";
        // divCertificaciones.style.display = "none";
        // divAsesorCheck.style.display = "block";
        // divSelectAsesor.style.display = "none";

        modalTitulo.innerText = "FORMULARIO DE GRADOS";

        carrera_select_label.innerHTML = "Seleccioná una carrera";
        carrera_select.dataset.placeholder = "Seleccioná la carrera";

        labelTitulo.innerText = "Título de Educación Media";
    });
}

if (modal_instrucciones) {
    modal_instrucciones.addEventListener('hidden.bs.modal', function () {
        var modal_Title = document.getElementById('modal_instruccionesTitle');

        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE GRADOS";
    });
}

$("#ingreso_economico").on("change", function () {
  const divTrabajo = document.getElementById('divTrabajo');
  const divTrabajoInput = document.getElementById('divTrabajoInput');
  var economico = document.getElementById("ingreso_economico");
  var economicoSeleccionado = economico.value;
  
  if (economicoSeleccionado === 'Asalariado') {
  
    divTrabajo.style.display = 'block';
  }else {
    divTrabajo.style.display = 'none';
    divTrabajoInput.removeAttribute('required')
    divTrabajoInput.value = '';
  }
})

function modalAccionInstrucciones(accion) {
    var modal_Title = document.getElementById('modal_instruccionesTitle');

    if (accion === 'primeringreso') {
        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE GRADOS";
    }
    else if (accion === 'posgrado') {
        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE POSGRADOS";
    }
    else if (accion === 'cursolibre') {
        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE CURSOS LIBRES";
    }
    else if (accion === 'micromaster') {
        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE MICROMASTERS";
    }
    else if (accion === 'tecnico') {
        modal_Title.innerText = "INSTRUCCIONES PARA COMPLETAR FORMULARIO DE TECNICOS";
    }
}
var tipoSelectCarrera = '';
function modalAccionForm(accion) {

    var tipoForm = document.getElementById("tipoForm");
    var labelTitulo = document.getElementById("labeltitulo");
    var divTitulo = document.getElementById("divTitulo");
    var divTituloUniversidad = document.getElementById("divTituloUniversidad");
    var divTituloUniversidadPI = document.getElementById("divTituloUniversidadPI");
    var divUniversidadPI = document.getElementById("divUniversidadPI");
    var divFoto = document.getElementById("divFoto");
    var divIngreso = document.getElementById("divIngreso");
    var divColegio = document.getElementById("divColegio");
    var divUniversidad = document.getElementById("divUniversidad");
    var divCarreraSede = document.getElementById("divCarreraSede");
    var divCarrera = document.getElementById("divCarrera");
    var divConvalidacionCheck = document.getElementById("divConvalidacionCheck");
    var divCertificaciones = document.getElementById("certificaciones");
    var divFechaGraduacion = document.getElementById("divFechaGraduacion");
    var fechaGraduacion = document.getElementById("fechaGraduacion");

    var divTrabajo = document.getElementById("divTrabajo");
    var divTrabajoInput = document.getElementById("divTrabajoInput");

    var titulobachillerto = document.getElementById("titulobachillerto");
    var titulouniversitario = document.getElementById("titulouniversitario");
    var cedulafotografia = document.getElementById("cedulafotografia");
    var fotoperfil = document.getElementById("fotoperfil");
    var ingreso_economico = document.getElementById("ingreso_economico");
    var colegio_select = document.getElementById("colegio_select");
    var universidad_select = document.getElementById("universidad_select");
    var carrera_sede = document.getElementById("carrera_sede");
    var carrera_select = document.getElementById("carrera_select");
    // var convalidacion = document.getElementById("convalidacion");
    // var certificacionnotas = document.getElementById("certificacionnotas");
    // var planestudio = document.getElementById("planestudio");
    // var asesor = document.getElementById("asesor");
    // var asesor_select = document.getElementById("asesor_select");

    var formAction = document.getElementById("formProspecto");
    var modalTitulo = document.getElementById("modal_formsTitle");
    llenardata(accion);
    if (accion === 'primeringreso') {
        tipoSelectCarrera = 'REGULAR';

        tipoForm.value = "primeringreso";
        divTituloUniversidad.style.display = 'none';
        divTituloUniversidadPI.style.display = 'none';
        divUniversidadPI.style.display = 'none';
        divUniversidad.style.display = 'none';
        titulobachillerto.required = true;
        cedulafotografia.required = true;
        fotoperfil.required = true;
        ingreso_economico.required = true;
        colegio_select.required = true;
        carrera_sede.required = true;
        carrera_select.required = true;
        fechaGraduacion.required = true;
        divTrabajoInput.required = true;

        universidad_select.options[0].style.display = "block";
    }
    else if (accion === 'posgrado') {
        tipoSelectCarrera = 'MAESTRIA';
        tipoForm.value = "posgrado";
        divColegio.style.display = 'none';
        divTituloUniversidadPI.style.display = 'none';
        divUniversidadPI.style.display = 'none';
        divUniversidad.style.display = 'block';
        titulobachillerto.required = true;
        titulouniversitario.required = true;
        cedulafotografia.required = true;
        universidad_select.required = true;
        fotoperfil.required = true;
        ingreso_economico.required = true;
        carrera_sede.required = true;
        carrera_select.required = true;
        fechaGraduacion.required = true;
        divTrabajoInput.required = true;

        universidad_select.options[0].style.display = "none";

        modalTitulo.innerText = "FORMULARIO DE POSGRADOS";

        carrera_select_label.innerHTML = "Seleccioná una especialidad";
        carrera_select.dataset.placeholder = "Seleccioná la especialidad";
    }
    else if (accion === 'cursolibre') {
        tipoSelectCarrera = 'Curso Libre';
        tipoForm.value = "cursolibre";
        labelTitulo.innerText = "Título de Educación Media (OPCIONAL)";
        divTituloUniversidadPI.style.display = 'none';
        divTituloUniversidad.style.display = 'none';
        divUniversidad.style.display = 'none';
        divUniversidadPI.style.display = 'none';
        divColegio.style.display = 'none';
        // divConvalidacionCheck.style.display = 'none';
        divUniversidad.style.display = 'none';
        fechaGraduacion.required = true;
        divTrabajoInput.required = true;

        universidad_select.options[0].style.display = "block";

        titulobachillerto.required = true;
        cedulafotografia.required = true;
        fotoperfil.required = true;
        ingreso_economico.required = true;
        carrera_sede.required = true;
        carrera_select.required = true;

        modalTitulo.innerText = "FORMULARIO DE CURSO LIBRES";

        carrera_select_label.innerHTML = "Seleccioná un curso libre";
        carrera_select.dataset.placeholder = "Seleccioná el curso libre";
    }
    else if (accion === 'micromaster') {
        tipoSelectCarrera = 'MICROMÁSTER';
        tipoForm.value = "micromaster";
        divTituloUniversidadPI.style.display = 'none';
        divUniversidadPI.style.display = 'none';
        divUniversidad.style.display = 'block';
        divColegio.style.display = 'none';
        // divConvalidacionCheck.style.display = 'none';
        modalTitulo.innerText = "FORMULARIO DE MICROMASTER";
        fechaGraduacion.required = true;
        divTrabajoInput.required = true;

        titulobachillerto.required = true;
        titulouniversitario.required = true;
        cedulafotografia.required = true;
        universidad_select.required = true;
        fotoperfil.required = true;
        ingreso_economico.required = true;
        carrera_sede.required = true;
        carrera_select.required = true;

        carrera_select_label.innerHTML = "Seleccioná un micromaster";
        carrera_select.dataset.placeholder = "Seleccioná un micromaster";
    }
    else if (accion === 'tecnico') {
        tipoSelectCarrera = 'TECNICO';
        tipoForm.value = "tecnico";
        divTituloUniversidadPI.style.display = 'none';
        divTituloUniversidad.style.display = 'none';
        divUniversidadPI.style.display = 'none';
        divUniversidad.style.display = 'none';
        divColegio.style.display = 'none';
        // divConvalidacionCheck.style.display = 'none';
        divUniversidad.style.display = 'none';
        fechaGraduacion.required = true;
        divTrabajoInput.required = true;

        titulobachillerto.required = true;
        cedulafotografia.required = true;
        fotoperfil.required = true;
        ingreso_economico.required = true;
        carrera_sede.required = true;
        carrera_select.required = true;

        modalTitulo.innerText = "FORMULARIO DE TÉCNICO";

        carrera_select_label.innerHTML = "Seleccioná un técnico";
        carrera_select.dataset.placeholder = "Seleccioná el técnico";
    }

}

function llenardata(tipo) {
    datacolegios();
    datauniversidades(tipo);
    datasedes();
    // equipo_asesores();
    datauniversidadesPI();
}

function habilitarTitulo() {
    var select = $("#carrera_select");
    var valorSeleccionado = select.val();
    const divFechaGraduacion = document.getElementById('divFechaGraduacion');

    var divTituloUniversidadPI = document.getElementById("divTituloUniversidadPI");
    var divUniversidadPI = document.getElementById("divUniversidadPI");
    var modal_Title = document.getElementById('modal_instruccionesTitle');
    if ((modal_Title.innerText).includes('PRIMER INGRESO')) {
        if (valorSeleccionado.includes("LICENCIATURA")) {
            divTituloUniversidadPI.style.display = 'block';
            divUniversidadPI.style.display = 'block';
        }
        else {
            divTituloUniversidadPI.style.display = 'none';
            divUniversidadPI.style.display = 'none';
        }

        if (valorSeleccionado === 'SIN CARRERA') {
            divFechaGraduacion.style.display = 'none';
        } else {
            divFechaGraduacion.style.display = 'block';
        }
    }
}


function equipo_asesores() {
    var select = $("#asesor_select");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná el asesor que te ha atendido", "", true, true);
    select.append(opcionPorDefecto);
    fetch("/asesoreselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
        });
}

function datasedes() {
    var select = $("#carrera_sede");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná una sede", "", true, true);
    select.append(opcionPorDefecto);
    fetch("/sedesselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
        });
}

function datacarreras() {
    var select = $("#carrera_select");
    var selectSede = $("#carrera_sede");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná una carrera", "", true, true);
    select.append(opcionPorDefecto);
    var sedeSeleccionada = selectSede.val();

    fetch("/carrerasselect/?sede=" + sedeSeleccionada + "&tipo=" + tipoSelectCarrera)
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
            select.select2({
                dropdownParent: $("#modal_forms"),
                width: "100%", // Ancho del dropdown
            });
        });

    $('#carrera_select').one('select2:open',
        function (e) {
            $('input.select2-search__field').prop('placeholder', 'Buscador');
        }
    );
}

function datacolegios() {
    var select = $("#colegio_select");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná un colegio", "", true, true);
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
                dropdownParent: $("#modal_forms"),
                width: "100%", // Ancho del dropdown
            });
        });

    $('#colegio_select').one('select2:open',
        function (e) {
            $('input.select2-search__field').prop('placeholder', 'Buscador');
        }
    );
}

function datauniversidades(tipo) {
    var select = $("#universidad_select");
    var select2 = document.getElementById('universidad_select');
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná una universidad", "", true, true);
    select.append(opcionPorDefecto);
    fetch("/universidadesselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            if (tipo != "posgrado" && tipo != "micromaster") {
                select.append('<option value="N/A">No Aplica</option>');
            }

            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
            select.select2({
                dropdownParent: $("#modal_forms"),
                width: "100%", // Ancho del dropdown
                selectOnClose: true
            });

        });

    $('#universidad_select').one('select2:open',
        function (e) {
            $('input.select2-search__field').prop('placeholder', 'Buscador');
        }
    );
}

function datauniversidadesPI() {
    var select = $("#universidad_selectPI");
    var select2 = document.getElementById('universidad_selectPI');
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccioná una universidad", "", true, true);
    select.append(opcionPorDefecto);
    fetch("/universidadesselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
            select.select2({
                dropdownParent: $("#modal_forms"),
                width: "100%", // Ancho del dropdown
                selectOnClose: true
            });

        });

    $('#universidad_select').one('select2:open',
        function (e) {
            $('input.select2-search__field').prop('placeholder', 'Buscador');
        }
    );
}

function show(id) {
    var show = document.getElementById(id);
    if (show.style.display !== 'none') {
        show.style.display = 'none';
    } else {
        show.style.display = '';
    }
}

function AceptoTerminos(){
    var flexRadioDefault1 = document.getElementById('flexRadioDefault1');
    flexRadioDefault1.checked = true;
    var btn_terms = document.getElementById('btn-terms');
    $('#offcanvasExample').offcanvas('hide');
    btn_terms.style.display = 'none';
}