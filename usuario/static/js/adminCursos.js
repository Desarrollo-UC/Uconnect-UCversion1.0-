function getPeriodo() {
    var selectedPeriodo = document.getElementById('periodos').value;
    const url = '/misCursosDetalle/?periodo=' + encodeURIComponent(selectedPeriodo);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            detalle(data);
        }
    };
    xhr.send();
}

function detalle(data) {
    var contenedor = document.getElementById("cardsContainer");
    contenedor.innerHTML = '';
    data.forEach(function (curso) {
        var divRow = document.createElement('div');
        divRow.className = 'row p-2';
        var divmb = document.createElement('div');
        divmb.className = 'mb-3';
        var divmbRow = document.createElement('div');
        divmbRow.className = 'row';
        var divmbCol = document.createElement('div');

        divmbCol.className = 'col-md-6';
        var aPlan = document.createElement('a');
        aPlan.className = 'card-title btn-md buttonCarrera card-title';
        aPlan.id = 'infoCardTitle';
        aPlan.innerText = curso.planEstudio_id;
        divmbCol.appendChild(aPlan);
        divmbRow.appendChild(divmbCol);


        var divTabla = document.createElement('div');
        divTabla.className = 'table-responsive-sm px-md-4 px-2 pt-3 miscursoTable';
        var tabla = document.createElement("table");
        tabla.className = "table misCursoTabla";
        var tbody = document.createElement("tbody");
        var fila1 = document.createElement("tr");
        var celdaCursoNombre = document.createElement("td");
        celdaCursoNombre.setAttribute("colspan", "6");
        celdaCursoNombre.id = 'datosHeader'
        celdaCursoNombre.textContent = curso.curso_id;
        fila1.appendChild(celdaCursoNombre);

        var fila2 = document.createElement("tr");
        var celdaSede = document.createElement("td");
        celdaSede.id = 'datos';
        celdaSede.style.width = '50px';
        var celdaSedeN = document.createElement("td");
        celdaSedeN.style.width = '50px';
        var celdaGrupo = document.createElement("td");
        celdaGrupo.id = 'datos';
        celdaGrupo.style.width = '50px';
        var celdaGrupoN = document.createElement("td");
        celdaGrupoN.style.width = '50px';
        celdaSede.textContent = "Sede: ";
        celdaSedeN.textContent = curso.sede_id;
        celdaSedeN.setAttribute("colspan", "3");
        celdaGrupo.textContent = "Grupo: ";
        celdaGrupoN.textContent = curso.grupo;
        fila2.appendChild(celdaSede);
        fila2.appendChild(celdaSedeN);
        fila2.appendChild(celdaGrupo);
        fila2.appendChild(celdaGrupoN);

        var fila3 = document.createElement("tr");
        var celdaHorario = document.createElement("td");
        celdaHorario.id = 'datos';
        celdaHorario.style.width = '50px';
        celdaHorario.textContent = "Horario: ";
        var celdaHorarioN = document.createElement("td");
        celdaHorarioN.setAttribute("colspan", "5");
        celdaHorarioN.textContent = curso.horario_id;
        fila3.appendChild(celdaHorario);
        fila3.appendChild(celdaHorarioN);

        var fila4 = document.createElement("tr");
        var celdaProfesor = document.createElement("td");
        celdaProfesor.id = 'datos';
        celdaProfesor.textContent = "Profesor: ";
        var celdaProfesorN = document.createElement("td");
        celdaProfesorN.setAttribute("colspan", "3");
        var celdaProfesorEv = document.createElement("td");
        celdaProfesorEv.id = 'datos';
        celdaProfesorEv.textContent = "Evaluación docente: ";
        var celdaProfesorEvN = document.createElement("td");
        // Icono con link para evaluación docente
        var linkEvaluacion = document.createElement("a");
        linkEvaluacion.href = "http://localhost:8080/";
        linkEvaluacion.title = "Ver evaluación docente";
        linkEvaluacion.target = "_blank";
        // linkEvaluacion.setAttribute('data-bs-toggle', 'modal');
        // linkEvaluacion.setAttribute('data-bs-target', '#modal_evaluacion_docente');
        linkEvaluacion.style.marginLeft = "8px";
        linkEvaluacion.innerHTML = '<i class="fa fa-user-check"></i>';
        // linkEvaluacion.addEventListener("click", function(e) {
        //     e.preventDefault();
        //     // Aquí puedes llamar a una función para mostrar la evaluación docente
        //     mostrarEvaluacionDocente(curso);
        // });
        celdaProfesorEvN.appendChild(linkEvaluacion);

        if (curso.docentes.length > 1) {
            var enlaceModal = document.createElement("a");
            enlaceModal.setAttribute('data-bs-toggle', 'modal');
            enlaceModal.setAttribute('data-bs-target', '#modal_funciones');
            enlaceModal.style.cursor = 'pointer';
            enlaceModal.textContent = "Ver Profesores";
            enlaceModal.addEventListener("click", function () {
                mostrarInfoModal(curso);
            });

            celdaProfesorN.appendChild(enlaceModal);
        } else if (curso.docentes.length === 1) {
            celdaProfesorN.textContent = curso.docentes[0].docente_id;
        } else {
            celdaProfesorN.textContent = 'Sin docente asignado';
        }

        fila4.appendChild(celdaProfesor);
        fila4.appendChild(celdaProfesorN);
        // fila4.appendChild(celdaProfesorEv);
        // fila4.appendChild(celdaProfesorEvN);

        var fila5 = document.createElement("tr");
        var celdaIP = document.createElement("td");
        celdaIP.id = 'datos';
        celdaIP.style.width = '50px';
        celdaIP.textContent = "1 Evaluación: ";
        var celdaIPN = document.createElement("td");
        celdaIPN.style.width = '50px';
        celdaIPN.textContent = curso.nota_Primera_Evaluacion;
        var celdaIIP = document.createElement("td");
        celdaIIP.id = 'datos';
        celdaIIP.style.width = '50px';
        celdaIIP.textContent = "2 Evaluación: ";
        var celdaIIPN = document.createElement("td");
        celdaIIPN.style.width = '50px';
        celdaIIPN.textContent = curso.nota_Segunda_Evaluacion;
        var celdaFP = document.createElement("td");
        celdaFP.id = 'datos';
        celdaFP.style.width = '50px';
        celdaFP.textContent = "Evaluación Final: ";
        var celdaFPN = document.createElement("td");
        celdaFPN.style.width = '50px';
        celdaFPN.textContent = curso.nota_Tercera_Evaluacion;
        fila5.appendChild(celdaIP);
        fila5.appendChild(celdaIPN);
        fila5.appendChild(celdaIIP);
        fila5.appendChild(celdaIIPN);
        fila5.appendChild(celdaFP);
        fila5.appendChild(celdaFPN);

        var fila6 = document.createElement("tr");
        var celdaPre = document.createElement("td");
        celdaPre.id = 'datos';
        celdaPre.style.width = '50px';
        celdaPre.textContent = "Nota Preliminar: ";
        var celdaPreN = document.createElement("td");
        celdaPreN.style.width = '50px';
        celdaPreN.textContent = curso.notaPrelinar;
        var celdaExtr = document.createElement("td");
        celdaExtr.id = 'datos';
        celdaExtr.style.width = '50px';
        celdaExtr.textContent = "Examen Extraordinario: ";
        var celdaExtrN = document.createElement("td");
        celdaExtrN.style.width = '50px';
        celdaExtrN.setAttribute("colspan", "3");
       
        celdaExtrN.textContent = curso.nota_Ext;
        
        fila6.appendChild(celdaPre);
        fila6.appendChild(celdaPreN);
        fila6.appendChild(celdaExtr);
        fila6.appendChild(celdaExtrN);

        var fila7 = document.createElement("tr");
        var celdaNotaF = document.createElement("td");
        celdaNotaF.id = 'datos';
        celdaNotaF.textContent = "Nota Final: ";
        var celdaNotaFN = document.createElement("td");
        celdaNotaFN.setAttribute("colspan", "8");
        
        celdaNotaFN.textContent = curso.notaFinal;
        fila7.appendChild(celdaNotaF);
        fila7.appendChild(celdaNotaFN);

        tbody.appendChild(fila1);
        tbody.appendChild(fila2);
        tbody.appendChild(fila3);
        tbody.appendChild(fila4);
        tbody.appendChild(fila5);
        tbody.appendChild(fila6);
        tbody.appendChild(fila7);
        tabla.appendChild(tbody);
        divTabla.appendChild(tabla);

        divmb.appendChild(divmbRow);
        divmb.appendChild(divTabla);
        divRow.appendChild(divmb);
        contenedor.appendChild(divRow);
    });
}

function mostrarInfoModal(data){
    var contaiderModal = document.getElementById('modal_funcionesBody');
    contaiderModal.innerHTML = '';
    var divRow = document.createElement('div');
    divRow.className = 'row';

    var divColM = document.createElement('div');
    divColM.className = 'col-md-12';

    var divAcc = document.createElement('div');
    divAcc.className = 'accordion';
    divAcc.id = 'accordionExample';
    data.docentes.forEach(function (docente, index) {

        var divAccItem = document.createElement('div');
        divAccItem.className = 'accordion-item';
        var h2item = document.createElement('h2');
        h2item.className = 'accordion-header';
        var buttonitem = document.createElement('button');
        buttonitem.className = 'accordion-button' + (index > 0 ? ' collapsed' : '');
        buttonitem.type = 'button';
        buttonitem.setAttribute('data-bs-toggle', 'collapse');
        buttonitem.setAttribute('data-bs-target', '#collapse_' + index);
        buttonitem.setAttribute('aria-expanded', true);
        buttonitem.setAttribute('aria-controls', '#collapse_' + index);
        buttonitem.innerText = docente.docente_id;
        var divInfoAcc = document.createElement('div');
        divInfoAcc.className = 'accordion-collapse collapse' + (index === 0 ? ' show' : '');
        divInfoAcc.setAttribute('id', 'collapse_' + index);
        divInfoAcc.setAttribute('data-bs-parent', '#accordionExample');
        var divInfoAccB = document.createElement('div');
        divInfoAccB.className = 'accordion-body';
        var divRowBody = document.createElement('div');
        divRowBody.className = 'row';
        var divcolBodyH = document.createElement('div');
        divcolBodyH.className = 'col-md-12';
        var divcolBodyA = document.createElement('div');
        divcolBodyA.className = 'col-md-12';
        var strongHorario = document.createElement('strong');
        strongHorario.className = 'd-inline p-2';
        strongHorario.innerText = 'Horario: ';
        var pHorario = document.createElement('p');
        pHorario.className = 'd-inline p-2';
        pHorario.innerText = docente.horarioLine_id;
        var strongAula = document.createElement('strong');
        strongAula.className = 'd-inline p-2';
        strongAula.innerText = 'Aula: ';
        var pAula = document.createElement('p');
        pAula.className = 'd-inline p-2';
        pAula.innerText = docente.aula_id;
        divcolBodyH.appendChild(strongHorario);
        divcolBodyH.appendChild(pHorario);
        divcolBodyA.appendChild(strongAula);
        divcolBodyA.appendChild(pAula);
        divRowBody.appendChild(divcolBodyH);
        divRowBody.appendChild(divcolBodyA);
        divInfoAccB.appendChild(divRowBody);
        divInfoAcc.appendChild(divInfoAccB);

        h2item.appendChild(buttonitem);
        divAccItem.appendChild(h2item);
        divAccItem.appendChild(divInfoAcc);
        divAcc.appendChild(divAccItem);
    });
    divColM.appendChild(divAcc);
    divRow.appendChild(divColM);
    contaiderModal.appendChild(divRow);
}