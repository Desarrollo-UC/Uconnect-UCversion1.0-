var totalCurso;
var cursoAprovados;
var totalCreditos;
var creditosAprovados;
var cursoPre = [];
var horariosCurso = [];
var cantidadCursos;
var auxCantCursos;
$(document).ready(function () {
    $("#modal_prematricula").on("hide.bs.modal", function () {
        const prematriculaOption = document.querySelector('#opcionPrematricula');
        if (cursoPre.length === 0) {
        prematriculaOption.style.display = 'none';
        } else {
            prematriculaOption.style.display = '';
        }
        

    });
    $("#modal_Horario").on("hide.bs.modal", function () {
        const select = document.getElementById("horario");
        const value = select.value;
        if (value === "Seleccionar un Horario") {
            const idHC = document.getElementById('cursoId').innerText + '-checkbox';
            document.getElementById(idHC).checked = false;
        }
    });
    $('[data-bs-toggle="tooltip"]').tooltip();  
    var botonPrematricula = document.getElementById('opcionPrematricula');
    botonPrematricula.onclick = function () {
        mostrarPrematricula();
    }
    const carreraSelect = document.getElementById('carrera');
    carreraSelect.onchange = function () {
        cursoPre = [];
        horariosCurso = [];
        totalCurso = 0;
        cursoAprovados = 0;
        totalCreditos = 0;
        creditosAprovados = 0;

        var plan = document.getElementById('carrera').value;
        // Enviar una petición AJAX al servidor
        const url = `/Estudiante/plan/carrera/?plan=` + encodeURIComponent(plan);
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                var avance = false;
                data.forEach((cuatrimestreObj) => {
                    avance = cuatrimestreObj.data.avance;;
                });
                actualizarEstado(data);
                if (avance){
                    var lineBar = new ProgressBar.Line("#line-container", {
                        trailWidth: 0.5,
                        from: { color: "#00416B" },
                        to: { color: "#B7BD6D" },
                        text: {
                            value: '0',
                            className: 'progress-text',
                            style: {
                                color: 'black',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                padding: 0,
                                margin: 0,
                                transform: 'translate(-50%, -50%)'
                            }
                        },
                        step: (state, shape) => {
                            shape.path.setAttribute("stroke", state.color);
                            shape.setText(Math.round(shape.value() * 100) + ' %');
                        }
                    });
                    var porcentajeAprobados = (creditosAprovados / totalCreditos) * 100;
                    var procentaje = porcentajeAprobados / 100;
                    lineBar.animate(procentaje, {
                        duration: 2000
                    });
                }
                actualizarTabla(data);
                remostrarPreMatricula();
            }
        };
        xhr.send();
    }
    var botonEnviarPrematricula = document.getElementById('enviarPrematricula');
    botonEnviarPrematricula.onclick = function () {
        enviarPrematricula();
    }

    var botonEnviarCambio = document.getElementById('enviarCambio');
    botonEnviarCambio.onclick = function () {
        enviarCambio();
    }

    var radioFinaciado = document.getElementById('financiado');
    radioFinaciado.onclick = function () {
        enviarCambio();
        if (radioFinaciado.checked) {
            
            document.getElementById('financiadoCard').removeAttribute('hidden');
            document.getElementById('enviarCambio').removeAttribute('disabled');
        }else{
            document.getElementById('cambio').setAttribute('hidden', true);
            document.getElementById('enviarCambio').setAttribute('disabled', true);
        }
    }

    var radioContadoo = document.getElementById('contado');
    radioContadoo.onclick = function () {
        if (radioContadoo.checked) {
            document.getElementById('financiadoCard').setAttribute('hidden', true);
            document.getElementById('enviarCambio').removeAttribute('disabled');
        }
    }
});

function actualizarEstado(data) {

    data.forEach((cuatrimestreObj) => {
        totalCurso = cuatrimestreObj.data.totalCursos;;
        totalCreditos = cuatrimestreObj.data.totalCreditos;
        cursoAprovados = cuatrimestreObj.data.cursosAprobados;
        creditosAprovados = cuatrimestreObj.data.creditosAprobados;
    });
    var select = document.getElementById('carrera');
    var estadoDiv = document.querySelector('.estado');
    estadoDiv.innerHTML = '';

    var divRowPlan = document.createElement('div');
    divRowPlan.className = 'row';
    var divInfo = document.createElement('div');
    divInfo.className = 'col-md-12';

    var fieldset = document.createElement('fieldset');
    fieldset.className = 'border p-2 mb-2';
    var legend = document.createElement('legend');
    legend.className = 'float-none w-auto planEstudioText'
    legend.id = 'planEstudio';
    legend.innerText = select.value;
    fieldset.appendChild(legend);

    var divRowInfo = document.createElement('div');
    divRowInfo.className = 'row';

    var divRowInfoCu = document.createElement('div');
    divRowInfoCu.className = 'row';

    var divRowInfoCr = document.createElement('div');
    divRowInfoCr.className = 'row';

    var divRowProceso = document.createElement('div');
    divRowProceso.className = 'row';

    var divGrado = document.createElement('div');
    divGrado.className = 'col-6 col-md-4';
    var spanGrado = document.createElement('p');
    spanGrado.textContent = 'Grado: ';
    spanGrado.style.display = 'inline';
    var pGrado = document.createElement('p');
    pGrado.className = 'planEstudioText';
    pGrado.textContent = data[0].data.grado;
    pGrado.style.display = 'inline';

    var divEnfasis = document.createElement('div');
    divEnfasis.className = 'col-6 col-md-4';
    var spanEnfasis = document.createElement('p');
    spanEnfasis.textContent = 'Enfasis: ';
    spanEnfasis.style.display = 'inline';
    var pEnfasis = document.createElement('p');
    if (data[0].data.enfasis === false){
        pEnfasis.textContent = '';
    }else{
        pEnfasis.textContent = data[0].data.enfasis;
    }
    
    pEnfasis.className = 'planEstudioText';
    pEnfasis.style.display = 'inline';

    divGrado.appendChild(spanGrado);
    divGrado.appendChild(pGrado);
    divEnfasis.appendChild(spanEnfasis);
    divEnfasis.appendChild(pEnfasis);
    divRowInfo.appendChild(divGrado);
    divRowInfo.appendChild(divEnfasis);

    var divCursoT = document.createElement('div');
    divCursoT.className = 'col-6 col-md-4';
    var spanCursoT = document.createElement('p');
    spanCursoT.textContent = 'Total de Curso: ';
    spanCursoT.style.display = 'inline';
    var pCursoT = document.createElement('p');
    pCursoT.textContent = totalCurso;
    pCursoT.className = 'planEstudioText';
    pCursoT.style.display = 'inline';

    var divCursoA = document.createElement('div');
    divCursoA.className = 'col-6 col-md-4';
    var spanCursoA = document.createElement('p');
    spanCursoA.textContent = 'Cursos Aprobados: ';
    spanCursoA.style.display = 'inline';
    var pCursoA = document.createElement('p');
    pCursoA.textContent = cursoAprovados;
    pCursoA.className = 'planEstudioText';
    pCursoA.style.display = 'inline';

    divCursoT.appendChild(spanCursoT);
    divCursoT.appendChild(pCursoT);
    divCursoA.appendChild(spanCursoA);
    divCursoA.appendChild(pCursoA);
    divRowInfoCu.appendChild(divCursoT);
    divRowInfoCu.appendChild(divCursoA);

    var divCreditoT = document.createElement('div');
    divCreditoT.className = 'col-6 col-md-4';
    var spanCreditoT = document.createElement('p');
    spanCreditoT.textContent = 'Total de Créditos: ';
    spanCreditoT.style.display = 'inline';
    var pCreditoT = document.createElement('p');
    pCreditoT.textContent = totalCreditos;
    pCreditoT.className = 'planEstudioText';
    pCreditoT.style.display = 'inline';

    var divCreditoA = document.createElement('div');
    divCreditoA.className = 'col-6 col-md-4';
    var spanCreditoA = document.createElement('p');
    spanCreditoA.textContent = 'Total de Créditos: ';
    spanCreditoA.style.display = 'inline';
    var pCreditoA = document.createElement('p');
    pCreditoA.textContent = creditosAprovados;
    pCreditoA.className = 'planEstudioText';
    pCreditoA.style.display = 'inline';

    divCreditoT.appendChild(spanCreditoT);
    divCreditoT.appendChild(pCreditoT);
    divCreditoA.appendChild(spanCreditoA);
    divCreditoA.appendChild(pCreditoA);
    divRowInfoCr.appendChild(divCreditoT);
    divRowInfoCr.appendChild(divCreditoA);

    var divproceso = document.createElement('div');
    divproceso.className = 'col-md-12';
    var pProceso = document.createElement('h6');
    pProceso.textContent = 'Total Completado';
    var divEstado = document.createElement('div');
    divEstado.id = 'line-container';

    divproceso.appendChild(pProceso);
    divproceso.appendChild(divEstado);
    divRowProceso.appendChild(divproceso);

    fieldset.appendChild(divRowInfo);
    fieldset.appendChild(divRowInfoCu);
    fieldset.appendChild(divRowInfoCr);
    fieldset.appendChild(divRowProceso);

    divInfo.appendChild(fieldset);

    divRowPlan.appendChild(divInfo);

    estadoDiv.appendChild(divRowPlan);
}

function actualizarTabla(data) {
    var contenedor = document.querySelector('#mainTable');
    contenedor.innerHTML = '';
    var selectHorario = document.getElementById('horario');
    data.forEach(cuatrimestreObj => {
        cantidadCursos = cuatrimestreObj.data.recargo;
        auxCantCursos = cuatrimestreObj.data.recargo;
        var mallaCurricular = cuatrimestreObj.data.mallaCurricular;
        const cursosAprobados = data[0].data.cursosAprobadosCodigos.map(c => c.curso.trim());
        var cursosPreMatriculadosCodigos = data[0].data.cursosPreMatriculadosCodigos;
        
        const cursosCursandoCodigos = data[0].data.cursosCursandoCodigos;
        mallaCurricular.forEach((curso, index) => {

            var divTablas = document.createElement('div');
            divTablas.className = 'card shadow p-2';

            var divCardheader = document.createElement('div');
            divCardheader.className = 'card-header border-0 py-0';
            divCardheader.id = 'planHeader';
            var divCardBody = document.createElement('div');
            divCardBody.className = 'card-body table-responsive p-0 tablaPlan  mt-2';
            var tituloHeader = document.createElement('h3');
            tituloHeader.className = 'mb-2';
            var titulo = document.createElement('a');
            titulo.className = 'btn-sm btn-plan';
            titulo.style.border = 'none';
            titulo.style.textDecoration = 'none'
            titulo.style.color = 'black';
            titulo.style.cursor = 'pointer';
            titulo.style.borderRadius = '10px';

            titulo.onclick = function () {
                mostrarTabla(curso.cuatrimestre);
            };
            titulo.textContent = curso.cuatrimestre;
            tituloHeader.appendChild(titulo);
            var table = document.createElement('table');
            table.className = 'table align-items-center table-flush cursoTabla';
            table.id = `${curso.cuatrimestre}`;
            if (index > 1) {
                table.style.display = 'none'; // Ocultar los demás botones
                table.classList.add('tabla-oculta');
            }
            var thead = document.createElement('thead');
            var tr = document.createElement('tr');

            var thAp = document.createElement('th');
            thAp.scope = "col";
            thAp.style.width = '10px';

            var th0 = document.createElement('th');
            th0.scope = "col";
            th0.appendChild(document.createTextNode('Curso'));

            var th1 = document.createElement('th');
            th1.scope = "col";
            th1.appendChild(document.createTextNode('Nombre'));

            var th2 = document.createElement('th');
            th2.scope = "col";
            th2.className = 'd-none d-sm-table-cell';
            th2.appendChild(document.createTextNode('Requisito'));

            var th3 = document.createElement('th');
            th3.scope = "col";
            th3.className = 'd-none d-sm-table-cell';
            th3.style.width = '20px';
            th3.appendChild(document.createTextNode('Creditos'));

            var th4 = document.createElement('th');
            th4.scope = "col";
            th4.style.width = '55px';
            var iconTh4 = document.createElement('i');
            iconTh4.className = 'bi bi-clock-fill';
            th4.appendChild(document.createTextNode('Seleccione'));

            // var th5 = document.createElement('th');
            // th5.scope = "col";
            // var iconTh5 = document.createElement('i');
            // iconTh5.className = 'bi bi-gear';
            // th5.appendChild(iconTh5);

            tr.appendChild(thAp);
            tr.appendChild(th0);
            tr.appendChild(th1);
            tr.appendChild(th2);
            tr.appendChild(th3);
            tr.appendChild(th4);
            //tr.appendChild(th5);
            thead.appendChild(tr);
            var tbody = document.createElement('tbody');
            tbody.id = 'PlanBody';
            divCardheader.appendChild(tituloHeader);
            table.appendChild(thead);
            table.appendChild(tbody);
            divTablas.appendChild(divCardheader);
            divCardBody.appendChild(table);
            divTablas.appendChild(divCardBody);
            curso.cursos.forEach(items => {
                if (items.curso !== '') {
                    var td_pre = document.createElement('td');
                    td_pre.id = 'Curso-' + items.curso;
                    var trb = document.createElement('tr');
                    trb.classList = 'principal';
                    var icons = document.createElement('i');
                    var td_apro = document.createElement('td');
                    td_apro.style.width = '12%';
                    var checkOpcion = document.createElement('input');
                    checkOpcion.type = 'checkbox';
                    checkOpcion.className = 'checkbox-group';
                    checkOpcion.id = `${items.curso}-checkbox`;
                    checkOpcion.setAttribute('data-bs-toggle', 'tooltip');
                    checkOpcion.setAttribute('data-bs-placement', 'top');
                    checkOpcion.setAttribute('title', 'Acción para Prematicular.');
                    checkOpcion.classList.add('tooltip-large');
                    // var btnLevantamiento = document.createElement('a');
                    // btnLevantamiento.className = 'link-info link-offset-2 link-offset-3-hover link-underline link-underline-opacity-0 link-underline-opacity-75-hover';
                    // btnLevantamiento.onclick = function () {
                    //     actualizarModal(items.curso);
                    // }
                    var dots = document.createElement('i');
                    dots.className = 'bi bi-three-dots-vertical';
                    //  btnLevantamiento.appendChild(dots);
                    // var td_gest = document.createElement('td');
                    icons.style.fontSize = '16px';

                    if (cursosAprobados.includes(items.curso) || items.notaFinal !== '') {
                        trb.id = 'aprovado';
                        icons.className = 'bi bi-check-lg';
                        icons.style.color = '#3bb80a';
                        var divNota = document.createElement('divNota');
                        divNota.style.display  = 'display: flex;';
                        divNota.style.alignItems  = 'align-items: center;';
                        divNota.style.gap  = 'gap: 4px;';
                        var spanNota = document.createElement('span');
                        spanNota.textContent = items.notaFinal;
                        spanNota.style.marginLeft = '6px';
                        spanNota.style.fontSize = '0.85rem';
                        spanNota.style.color = '#2e7d32';
                        divNota.appendChild(icons);
                        divNota.appendChild(spanNota);
                        td_apro.appendChild(divNota);
                        td_apro.appendChild(icons);
                    } else if (items.requisitos === '' || items.requisitos.split(',').map(r => r.trim()).every(requisito => cursosAprobados.includes(requisito))) {
                        if (!(cursosPreMatriculadosCodigos.includes(items.curso) || cursosCursandoCodigos.includes(items.curso))) {
                            trb.id = 'matriculable';
                            icons.className = 'bi bi-plus-lg color-box';
                            icons.style.color = '#006a9f';
                            td_apro.appendChild(icons);
                            td_pre.appendChild(checkOpcion);
                        }
                    }
                     else {
                        trb.id = 'noMatriculable';
                        icons.className = 'bi bi-x-lg color-box';
                        icons.style.color = '#83877b';
                        // td_gest.appendChild(btnLevantamiento);
                        td_apro.appendChild(icons);
                    }

                    if (cursosPreMatriculadosCodigos.includes(items.curso)) {
                        trb.id = 'cursopre';
                        icons.className = 'bi bi-bookmark-check-fill';
                        icons.style.color = '#98b3c5';
                        td_apro.appendChild(icons);
                    } else if (cursosCursandoCodigos.includes(items.curso)) {
                        trb.id = 'cursando';
                        icons.className = 'bi bi-book-fill';
                        icons.style.color = '#F3556C';
                        td_apro.appendChild(icons);
                    }
                    
                    var td_siglas = document.createElement('td');
                    var td_curso = document.createElement('td');
                    var td_requisito = document.createElement('td');
                    td_requisito.className = 'd-none d-sm-table-cell';
                    var td_creditos = document.createElement('td');
                    td_creditos.className = 'd-none d-sm-table-cell';
                    td_siglas.appendChild(document.createTextNode(' ' + items.curso));
                    td_curso.appendChild(document.createTextNode(items.nombre));
                    td_requisito.appendChild(document.createTextNode(items.requisitos));
                    td_creditos.appendChild(document.createTextNode(items.creditos));
                    checkOpcion.onchange = function () {
                        if (checkOpcion.checked) {
                            var dataHorario = {
                                'plan': document.getElementById('planEstudio').innerText,
                                'cursos':[items.curso]
                            };
                            if(cantidadCursos > 0){
                                document.getElementById('cursoId').innerText = items.curso;
                                document.getElementById('cursoNombre').innerText = items.nombre;
                                document.getElementById('cursoCredito').innerText = items.creditos;
                                $('#modal_Horario').modal('show');
                                $('#modalHora').on('click', function () {
                                    $('#modal_Horario').modal('hide');
                                });
                                mostrarHorario(dataHorario);
                            }else{
                                var toast = document.querySelector('#liveToast');
                                var content = document.getElementById('toastContent');
                                content.innerText = `Solo puede prematricular ${auxCantCursos} cursos`;
                                var toasts = new bootstrap.Toast(toast, { delay: 3000 });
                                toasts.show();
                                checkOpcion.checked = false;
                            }
                        }else{
                            var valorSeleccionadoH = ""
                            visualizar(items.curso , document.getElementById('cursoNombre').innerText, document.getElementById('cursoCredito').innerText, valorSeleccionadoH);
                        }

                    }
                    selectHorario.onchange = function () {
                        var valorSeleccionado = this.value;
                        visualizar(document.getElementById('cursoId').innerText , document.getElementById('cursoNombre').innerText, document.getElementById('cursoCredito').innerText, valorSeleccionado);
                        $("#modal_Horario").modal('hide');
                    }
                    
                    trb.appendChild(td_apro);
                    trb.appendChild(td_siglas);
                    trb.appendChild(td_curso);
                    trb.appendChild(td_requisito);
                    trb.appendChild(td_creditos);
                    trb.appendChild(td_pre);
                    // trb.appendChild(td_gest);
                    tbody.appendChild(trb);
                }
                

            });
            contenedor.appendChild(divTablas);
        });
    });
    cambioCurso(); 

}

function mostrarTabla(index) {
    const div = document.getElementById(index);
    if (div.style.display !== 'none') {
        div.style.display = 'none';
    } else {
        div.style.display = '';
    }
}

function visualizar(curso, nombre, creditos, horario) {
  const prematriculaOption = document.querySelector('#opcionPrematricula');
  prematriculaOption.style.display = '';

  if (horario !== "" && cantidadCursos > 0) {
    // Agregar curso
    const cursoObj = { curso, nombre, creditos, horario };
    cursoPre.push(cursoObj);
    horariosCurso.push(horario);
    cantidadCursos--;
  }
  else if (horario === "") {
    // Eliminar curso por su propiedad 'curso'
    const idx = cursoPre.findIndex(c => c.curso === curso);
    if (idx !== -1) {
      cursoPre.splice(idx, 1);
      // Además si quieres quitar el horario:
      const idxH = horariosCurso.indexOf(horario);
      if (idxH !== -1) horariosCurso.splice(idxH, 1);
      cantidadCursos++;
    }
    validarCheckboxes();
  }
  else {
    // Si no queda cupo, resetea selección
    selectCurso.value = selectCurso.options[0].value;
  }
}


function mostrarPrematricula() {
    var tbodyModal = document.getElementById('premTablaBody');
    const prematriculaOption = document.querySelector('#opcionPrematricula');
    prematriculaOption.style.display = 'none';
    var count = 0;
    tbodyModal.innerHTML = '';
    var preCursos = {
        'plan': document.getElementById('planEstudio').innerText,
        'cursos':[]
    };
    
    cursoPre.forEach(curso => {
        preCursos.cursos.push(curso.curso);
        var trTablaModal = document.createElement('tr');
        trTablaModal.id = `${curso.curso}-fila`;
        trTablaModal.className = 'border-bottom';
        var tdCheckModal = document.createElement('td');
        var divCheckModal = document.createElement('div');
        var checkTablaModal = document.createElement('input');
        checkTablaModal.type = 'checkbox';
        checkTablaModal.checked = 'true';
        checkTablaModal.id = `${curso.curso}-preCheckModal`;
        checkTablaModal.onchange = function () {
            quitarPrematricula(`${curso.curso}-fila`, `${curso.curso}-checkbox`, curso.creditos);
        }
        divCheckModal.className = 'd-flex align-items-center justify-content-center';
        divCheckModal.appendChild(checkTablaModal);

        var tdSiglaModal = document.createElement('td');
        var divSiglaModal = document.createElement('div');
        var spanSiglaModal = document.createElement('span');
        divSiglaModal.className = 'd-flex align-items-center justify-content-center';
        spanSiglaModal.className = 'fw-normal colorText';
        spanSiglaModal.id = 'siglasCursos';
        spanSiglaModal.innerText = curso.curso;
        divSiglaModal.appendChild(spanSiglaModal);

        var tdNombreModal = document.createElement('td');
        var divNombreModal = document.createElement('div');
        var divNombrePModal = document.createElement('div');
        var pNombreModal = document.createElement('p');
        divNombreModal.className = 'd-flex align-items-center';
        divNombrePModal.className = 'd-flex flex-column justify-content';
        pNombreModal.className = 'fw-normal colorText';
        pNombreModal.innerText = curso.nombre;
        divNombrePModal.appendChild(pNombreModal);
        divNombreModal.appendChild(divNombrePModal);

        var tdCreditoModal = document.createElement('td');
        var divCreditoModal = document.createElement('div');
        var pCreditoModal = document.createElement('p');
        var spanCreditoModal = document.createElement('span');
        divCreditoModal.className = 'd-flex align-items-center justify-content-center';
        pCreditoModal.className = 'pe-3 colorText';
        spanCreditoModal.className = 'red colorText';
        spanCreditoModal.innerText = curso.creditos;
        pCreditoModal.appendChild(spanCreditoModal);
        divCreditoModal.appendChild(spanCreditoModal);

        var tdSelectModal = document.createElement('td');
        var divSelectModal = document.createElement('div');
        var selectTablaModal = document.createElement('select');
        var optionTablaSelectModal = document.createElement('option');
        optionTablaSelectModal.setAttribute('disabled', true);
        optionTablaSelectModal.setAttribute('selected', true);
        optionTablaSelectModal.setAttribute('value', '');
        optionTablaSelectModal.setAttribute('hidden', true);
        optionTablaSelectModal.innerText = 'Horarios';
        selectTablaModal.id = `${curso.curso}-horarios`;
        selectTablaModal.appendChild(optionTablaSelectModal);
        selectTablaModal.className = 'form-select form-select-sm colorText';
        divSelectModal.className = 'd-flex align-items-center justify-content-center';
        divSelectModal.appendChild(selectTablaModal);

        tdCheckModal.appendChild(divCheckModal);
        tdSiglaModal.appendChild(divSiglaModal);
        tdNombreModal.appendChild(divNombreModal);
        tdCreditoModal.appendChild(divCreditoModal);
        tdSelectModal.appendChild(divSelectModal);

        trTablaModal.appendChild(tdCheckModal);
        trTablaModal.appendChild(tdSiglaModal);
        trTablaModal.appendChild(tdNombreModal);
        trTablaModal.appendChild(tdCreditoModal);
        trTablaModal.appendChild(tdSelectModal);
        count += parseInt(curso.creditos);
        tbodyModal.appendChild(trTablaModal);
    });
    var trTotal = document.createElement('tr');
    trTotal.className = 'border-bottom';
    var tdTotalModal = document.createElement('td');
    tdTotalModal.colSpan = '4'
    var divTotalModal = document.createElement('div');
    var spanTotalModal = document.createElement('span');
    divTotalModal.className = 'd-flex align-items-center justify-content-end';
    spanTotalModal.className = 'pe-3 fw-normal colorText';
    spanTotalModal.innerText = `Total de Creditos: ${count}`;
    spanTotalModal.id = 'totalCreditos';
    divTotalModal.appendChild(spanTotalModal);
    tdTotalModal.appendChild(divTotalModal);
    trTotal.appendChild(tdTotalModal);

    tbodyModal.appendChild(trTotal);
    const preCursosJSON = JSON.stringify(preCursos);
    const url = `/Estudiante/plan/cursoPlanHorario/` + "?cursos=" + encodeURIComponent(preCursosJSON);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            getHorarios(data);
        }
    };
    xhr.send();
}

function quitarPrematricula(fila, checkId, credito) {
    var totalCreditos = document.getElementById('totalCreditos');
    var auxTotal = totalCreditos.innerText.split(': ');
    var totalCr = auxTotal[1] - credito;
    totalCreditos.innerText = `Total de Creditos: ${totalCr}`;
    var cursos = document.getElementById('cantCursos');
    var filaTablaModal = document.getElementById(fila);
    filaTablaModal.parentNode.removeChild(filaTablaModal);
    var checkBoxTabla = document.getElementById(checkId);
    console.log(checkBoxTabla);
    checkBoxTabla.checked = false;
    cantidadCursos += 1;

    for (var i = 0; i < cursoPre.length; i++) {
        if (`${cursoPre[i].curso}-fila` === fila) {
            cursoPre.splice(i, 1);
            break;
        }
    }

    if (cursoPre.length === 0) {
        const prematriculaOption = document.querySelector('#opcionPrematricula');
        prematriculaOption.style.display = 'none';
    }
}

function enviarPrematricula() {
    var tabla = document.getElementById("premTablaBody");
    var cursos = [];
    for (var i = 0; i < tabla.rows.length - 1; i++) {
        var fila = tabla.rows[i];
        var siglasCurso = fila.querySelector("#siglasCursos").textContent;
        var horarioSelect = fila.querySelector("select").value;
        var curso = {
            "curso_id": siglasCurso,
            "horario_id": horarioSelect
        };
        cursos.push(curso);
    }
    var jsonData = {
        "identificacion": "",
        "planEstudio_id": document.getElementById('planEstudio').innerText,
        cursos,
        'type': document.getElementById('typeE').innerText
    };
    var jsonString = JSON.stringify(jsonData);
    const url = `/plan/envioPrematricula/`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if ('error' in response){
                mostrarError(response.error, 'error');
            }else{
                window.location.href = response.url;
            }
          }
        }
    }
    xhr.send(jsonString);
}

function getCSRFToken() {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.substring(0, "csrftoken".length + 1) === "csrftoken=") {
          cookieValue = decodeURIComponent(
            cookie.substring("csrftoken".length + 1)
          );
          break;
        }
      }
    }
    return cookieValue;
  }

function actualizarModal(curso) {

    var cursoModal = document.getElementById('cursoModal');
    cursoModal.value = curso;
    $('#modal_levantamiento').modal('show');
}

function mostrarHorario(dataH){
    const preCursosJSON = JSON.stringify(dataH);
    const url = `/Estudiante/plan/cursoPlanHorario/` + "?cursos=" + encodeURIComponent(preCursosJSON);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            obtnerHorario(data);
        }
    };
    xhr.send();
}

function getHorarios(data) {
    var siglas = document.querySelectorAll('#siglasCursos');
    data.forEach((horarios) => {
        var horariosCurso = horarios.data.horarios;
        horariosCurso.forEach(curso => {
            siglas.forEach(function (elemento) {
                if (elemento.textContent === curso.curso) {
                    var selectId = document.getElementById(`${elemento.textContent}-horarios`);
                    var horarioSeleccionado = cursoPre.find(cursoPreItem => cursoPreItem.curso === curso.curso)?.horario;
                    curso.horarios.forEach(horario => {
                        var opcionSelect = document.createElement('option');
                        opcionSelect.setAttribute('value', horario);
                        opcionSelect.innerText = horario;
                        if (horario === horarioSeleccionado) {
                            opcionSelect.setAttribute('selected', true);
                        }
                        selectId.appendChild(opcionSelect);
                    });
                }
            });
        });
    });
}


function obtnerHorario(data){
    data.forEach((horarios) => {
        var horariosCurso = horarios.data.horarios; 
        horariosCurso.forEach(curso => {
            var selectId = document.getElementById('horario');
            var hiddenOption = selectId.querySelector('[hidden]');
            selectId.innerHTML = '';
            selectId.appendChild(hiddenOption);
            curso.horarios.forEach(horario => {
                var opcionSelect = document.createElement('option');
                opcionSelect.setAttribute('value', horario);
                opcionSelect.innerText = horario;
                selectId.appendChild(opcionSelect);
            });
        });
    });
}

function validarCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox-group');
    const prematriculaOption = document.querySelector('#opcionPrematricula');

    const alMenosUnoMarcado = Array.from(checkboxes).some(checkbox => checkbox.checked);

    // Si NO hay ningún checkbox marcado Y cursoPre está vacío, ocultar
    if (!alMenosUnoMarcado && cursoPre.length === 0) {
        prematriculaOption.style.display = 'none';
    }
}


function mostrarError(response, type){
    var toastElement = document.getElementById("liveToastE");
    if (!toastElement) {
        console.error("Toast element not found");
        return;
    }

    var toastTittle = toastElement.querySelector("#titleToast");
    var toastCloseButton = toastElement.querySelector(".btn-close");

    if (type === "error") {
        if (toastTittle) toastTittle.innerHTML = response;
        toastElement.classList.add("bg-danger");
    }

    if (toastCloseButton) {
        toastCloseButton.addEventListener("click", function () {
            var bootstrapToast = bootstrap.Toast.getInstance(toastElement);
            bootstrapToast.hide();
        });
    }

    var bootstrapToast = new bootstrap.Toast(toastElement, { delay: 6000 });
    bootstrapToast.show();
}

function remostrarPreMatricula(){
    var plan = document.getElementById('carrera').value
    const url = `/verPrematricula/` + "?plan=" + encodeURIComponent(plan);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
           data.forEach((curso) => {
            const cursoObj = {
                curso: curso.codigo,
                nombre: curso.descripcion,
                creditos: 4,
                horario: curso.horario_id
            };
            cursoPre.push(cursoObj);
            cantidadCursos -= 1;
           })
           const prematriculaOption = document.querySelector('#opcionPrematricula');
           if(data.length > 0){
            prematriculaOption.style.display = '';
           }
            
        }
    }
    xhr.send();
}

function mostraCambio(curso, descripcion, horario){
    $('#modal_cambio').modal('show');
    var preCursos = {
        'plan': document.getElementById('planEstudio').innerText,
        'cursos':[curso]
    };
    document.getElementById('cursoIdC').innerText = curso;
    document.getElementById('cursoNombreC').innerText = descripcion;
    document.getElementById('cursoHorarioC').innerText = horario;
    const preCursosJSON = JSON.stringify(preCursos);
    const url = `/Estudiante/plan/cursoPlanHorario/` + "?cursos=" + encodeURIComponent(preCursosJSON);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            var select = document.getElementById("horarioC");
            select.innerHTML = '<option hidden selected>Seleccionar un Horario</option>';
            data.forEach((horarios) => {
                var horariosCurso = horarios.data.horarios;
                horariosCurso.forEach(curso => {
                    curso.horarios.forEach(horario => {
                        var option = document.createElement("option");
                        option.value = horario; // Assuming the JSON has a "value" field
                        option.text = horario; // Assuming the JSON has a "text" field
                        select.appendChild(option);
                    })
                })
            });
        }
    };
    xhr.send();
    $('#modalCambio').on('click', function () {
        $('#modal_cambio').modal('hide');
    });
}

function cambioCurso(){
    
    var plan = document.getElementById('carrera').value
    const url = `/verCambio/` + "?plan=" + encodeURIComponent(plan);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            data.forEach((item)=>{
                var idCurso = 'Curso-' + item.codigo
                var curso = document.getElementById(idCurso);
                var buttonCambio = document.createElement('a');
                buttonCambio.className = 'btn btnCambioCurso';
                buttonCambio.id = 'btnCambioCurso';
                buttonCambio.innerText = 'Cambiar';
                buttonCambio.onclick = (function(codigo, descripcion, horario_id) {
                    return function() {
                        mostraCambio(codigo, descripcion, horario_id);
                    };
                })(item.codigo, item.descripcion, item.horario_id);
                curso.appendChild(buttonCambio);
            })
        }
    };
    xhr.send();
}

function enviarCambio(){
    var jsonData = {
        "planEstudio_id": document.getElementById('planEstudio').innerText,
        "identificacion": "",
        "horarioActual_id": document.getElementById('cursoHorarioC').innerText,
        "horarioCambio_id": document.getElementById('horarioC').value,
        "aplicar": !document.getElementById('financiado').checked
    };
    var jsonString = JSON.stringify(jsonData);
    const url = `/cambioCurso/`;
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                document.getElementById('saldofavorMonto').innerText = response['saldo_Favor_Maximo'];
                document.getElementById('pagareMonto').innerText = response['financiamiento_Maximo'];
            }
        }
    }
    xhr.send(jsonString);
}