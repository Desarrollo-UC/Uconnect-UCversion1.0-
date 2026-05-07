function llenardata() {
    datacolegios();
    datacarreras();
}

function datacarreras() {
    var select = $("#mi_select");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccione una carrera", "", true, true);
    select.append(opcionPorDefecto);

    fetch("/carrerasselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
            select.select2({
                dropdownParent: $("#modal_primer_ingreso"),
                width: "100%", // Ancho del dropdown
            });
        });
}

function datacolegios() {
    var select = $("#colegio_select");
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
                dropdownParent: $("#modal_primer_ingreso"),
                width: "100%", // Ancho del dropdown
            });
        });
}

function dataposgrados() {
    var select = $("#posgradoselect");
    select.empty(); // Eliminamos todas las opciones anteriores
    var opcionPorDefecto = new Option("Seleccione una posgrado", "", true, true);
    select.append(opcionPorDefecto);

    fetch("/posgradosselect/")
        .then((response) => response.json())
        .then((data) => {
            // Iteramos sobre los valores obtenidos
            data.forEach(function (valor) {
                // Creamos una nueva opción y la agregamos al select
                var opcion = new Option(valor, valor);
                select.append(opcion);
            });
            // Inicializamos Select2 con el dropdownParent apuntando al modal
            select.select2({
                dropdownParent: $("#modal_posgrado"),
                width: "100%", // Ancho del dropdown
            });
        });
}

function show(id){
    var show = document.getElementById(id);
    if (show.style.display !== 'none') {
        show.style.display = 'none';
    } else {
        show.style.display = '';
    }
}