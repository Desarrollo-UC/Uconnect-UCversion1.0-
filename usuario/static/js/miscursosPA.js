function getPeriodo() {
    var selectedPeriodo = document.getElementById('periodos').value;
    const url = '/getCurso/?periodo=' + encodeURIComponent(selectedPeriodo);
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
    var btnA = document.getElementById('asistenciaBtn');
    btnA.hidden = false;
    var selectedPeriodo = document.getElementById('periodos').value;
    var cardsContainerR = document.getElementById('Regular');
    var cardsContainerS = document.getElementById('Suficiencia');
    var cardsContainerM = document.getElementById('ModalidaG');
    cardsContainerR.innerHTML = '';
    cardsContainerS.innerHTML = '';
    cardsContainerM.innerHTML = '';

    var cursos = {};

    for (var i = 0; i < data.data.periodos.length; i++) {
        var periodo = data.data.periodos[i];
        if (periodo.periodo === selectedPeriodo) {
            for (var j = 0; j < periodo.horarios.length; j++) {
                var horario = periodo.horarios[j];
                if (horario.padre !== true) continue;
                if (!cursos.hasOwnProperty(horario.curso)) {
                    cursos[horario.curso] = {
                        curso: horario.curso,
                        horarios: []
                    };
                }
                cursos[horario.curso].horarios.push(horario);
            }
        }
    }
    var cardCounter = 1;
    for (var cursoKey in cursos) {
        if (cursos.hasOwnProperty(cursoKey)) {
            var curso = cursos[cursoKey];
            // Crear el card
            var card = document.createElement('div');
            card.className = 'card mb-4 mt-1';
            card.id = 'card' + cardCounter;
            

            // Crear el título del card
            var cardTitle = document.createElement('h4');
            cardTitle.className = 'card-title p-2 fw-bold';
            
            

            // Crear el header del card
            var cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';

            // Crear la lista de pestañas en el header
            var tabList = document.createElement('ul');
            tabList.className = 'nav nav-tabs card-header-tabs';
            tabList.role = 'tablist';
            tabList.id = 'v-pills-tab';

            // Crear las pestañas de los subhorarios
            for (var k = 0; k < curso.horarios.length; k++) {
                
                var subhorario = curso.horarios[k];
                var posicionTesis = subhorario.acta.indexOf("tesis");
                if (subhorario.tipoActa == 'Tesis'){
                    cardTitle.textContent = subhorario.acta.substring(posicionTesis + "tesis".length + 1) + ' (Tesis)';
                }else if (subhorario.tipoActa == 'Pruebas de grado'){
                    cardTitle.textContent = subhorario.acta + ' (Pruebas de grado)';
                }else if (subhorario.tipoActa == 'Promediado'){
                    cardTitle.textContent = subhorario.acta + ' (Promediado)';
                }else {
                    cardTitle.textContent = subhorario.curso;
                }
                var tabItem = document.createElement('li');
                tabItem.className = 'nav-item';

                var tabLink = document.createElement('a');
                tabLink.className = subhorario === curso.horarios[0] ? 'tabsH nav-link active' : 'tabsH nav-link';
                tabLink.href = '#card' + cardCounter + '-' + 'curso' + (k + 1);
                tabLink.setAttribute('data-bs-toggle', 'pill');
                tabLink.textContent = 'Grupo: ' + subhorario.grupo + ' ' +subhorario.horario;

                tabItem.appendChild(tabLink);
                tabList.appendChild(tabItem);
            }

            cardHeader.appendChild(tabList);

            // Crear el cuerpo del card
            var cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            // Crear el contenedor de las pestañas en el cuerpo
            var tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.id = 'v-pills-tabContent';

            // Crear las pestañas de los subhorarios en el cuerpo
            for (var k = 0; k < curso.horarios.length; k++) {
                var subhorarioAux = curso.horarios[k];
                var tabPane = document.createElement('div');
                tabPane.className = subhorarioAux === curso.horarios[0] ? 'tab-pane fade show active mb-3' : 'tab-pane fade show mb-3';
                tabPane.id = 'card' + cardCounter + '-' + 'curso' + (k + 1);
                tabPane.role = 'tabpanel';
                tabPane.setAttribute('aria-labelledby', 'v-pills-home-tab');

                // Crear la tabla dentro de la pestaña
                var table = document.createElement('table');
                table.className = 'table misCursoTabla';

                // Crear las filas de la tabla
                var tbody = document.createElement('tbody');

                var tr1 = document.createElement('tr');
                var td11 = document.createElement('td');
                td11.id = 'datos';
                td11.style.width = '50px';
                td11.textContent = 'Periodo:';
                var td12 = document.createElement('td');
                td12.colSpan = '6';
                td12.style.width = '50px';
                td12.textContent = subhorarioAux.periodo;
                tr1.appendChild(td11);
                tr1.appendChild(td12);

                var tr2 = document.createElement('tr');
                var td21 = document.createElement('td');
                td21.id = 'datos';
                td21.style.width = '50px';
                td21.textContent = 'Sede:';
                var td22 = document.createElement('td');
                td22.style.width = '50px';
                td22.textContent = subhorarioAux.sede;
                var td23 = document.createElement('td');
                td23.id = 'datos';
                td23.style.width = '50px';
                td23.textContent = '# Grupo:';
                var td24 = document.createElement('td');
                td24.style.width = '50px';
                td24.textContent = subhorarioAux.grupo;
                var td25 = document.createElement('td');
                td25.id = 'datos';
                td25.style.width = '50px';
                td25.textContent = 'Aula:';
                var td26 = document.createElement('td');
                td26.style.width = '50px';
                td26.textContent = subhorarioAux.aula;
                tr2.appendChild(td21);
                tr2.appendChild(td22);
                tr2.appendChild(td23);
                tr2.appendChild(td24);
                tr2.appendChild(td25);
                tr2.appendChild(td26);

                var tr3 = document.createElement('tr');
                var td27 = document.createElement('td');
                td27.id = 'datos';
                td27.style.width = '50px';
                td27.textContent = 'Horario:';
                var td28 = document.createElement('td');
                td28.style.width = '50px';
                td28.textContent = subhorarioAux.horario;
                var td29 = document.createElement('td');
                td29.id = 'datos';
                td29.style.width = '50px';
                td29.textContent = 'Estado:';
                var td30 = document.createElement('td');
                td30.style.width = '50px';
                td30.textContent = subhorarioAux.estado;
                td30.colSpan = '3';
                tr3.appendChild(td27);
                tr3.appendChild(td28);
                tr3.appendChild(td29);
                tr3.appendChild(td30);

                var tr4 = document.createElement('tr');
                var td31 = document.createElement('td');
                td31.id = 'datos';
                td31.style.width = '50px';
                td31.textContent = 'Cupo:';
                var td32 = document.createElement('td');
                td32.style.width = '50px';
                td32.textContent = subhorarioAux.cupo;
                var td33 = document.createElement('td');
                td33.id = 'datos';
                td33.style.width = '50px';
                td33.textContent = 'Matricula:';
                var td34 = document.createElement('td');
                td34.style.width = '50px';
                td34.textContent = subhorarioAux.matricula;
                td34.colSpan = '3';
                tr4.appendChild(td31);
                tr4.appendChild(td32);
                tr4.appendChild(td33);
                tr4.appendChild(td34);

                var tr5 = document.createElement('tr');
                var td35 = document.createElement('td');
                td35.id = 'datos';
                td35.style.width = '50px';
                td35.textContent = 'Entrega Notas:';
                var td36 = document.createElement('td');
                td36.style.width = '50px';
                td36.textContent = subhorarioAux.entregaNotas;
                var td37 = document.createElement('td');
                td37.id = 'datos';
                td37.style.width = '50px';
                td37.textContent = 'Descargar Asistencia:';

                var td38 = document.createElement('td');
                td38.style.width = '50px';
                td38.colSpan = 3;

                // Link de descarga
                var periodo = document.getElementById('periodos').value;
                var acta = subhorarioAux.acta;
                var codigo_curso = subhorarioAux.curso;
                var link = document.createElement('a');
                link.href = `/asistencia/pdf/${periodo}/${acta}/${codigo_curso}/`; // URL real a tu vista
                link.target = '_blank';
                link.classList.add('btn', 'btn-sm', 'btn-danger');

                // Ícono PDF
                var icon = document.createElement('i');
                icon.className = 'bi bi-file-earmark-pdf';

                link.appendChild(icon);
                link.appendChild(document.createTextNode(' Descargar'));

                td38.appendChild(link);
                tr5.appendChild(td35);
                tr5.appendChild(td36);
                tr5.appendChild(td37);
                tr5.appendChild(td38);
                // ... Código HTML para las filas ...

                tbody.appendChild(tr1);
                tbody.appendChild(tr2);
                tbody.appendChild(tr3);
                tbody.appendChild(tr4);
                tbody.appendChild(tr5);

                // ... Agregar las demás filas a tbody ...

                table.appendChild(tbody);

                // Agregar la tabla al contenedor
                var tableContainer = document.createElement('div');
                tableContainer.className = 'table-responsive mb-3';
                tableContainer.appendChild(table);
                tabPane.appendChild(tableContainer);

                // ... Código HTML para los botones ...
                var divbutton0 = document.createElement('div');
                divbutton0.className = 'btn-group mr-3 ml-3 col-md-2 mb-3';
                divbutton0.role = 'group';
                var btnEstudiantes = document.createElement('button');
                btnEstudiantes.className = 'btn btn-secondary btnPrimaryUC';
                btnEstudiantes.style.marginLeft = '10px';
                btnEstudiantes.style.marginRight = '10px';
                btnEstudiantes.type = 'button';
                btnEstudiantes.textContent = 'Ver estudiantes';
                btnEstudiantes.addEventListener('click', (function (subhorario) {
                    return function () {
                        listaEstudiante('lista', selectedPeriodo, subhorario.acta);
                    };
                })(subhorarioAux));
                if(subhorario.tipoActa == 'Regular' || subhorario.tipoActa == 'Suficiencia'){
                    divbutton0.appendChild(btnEstudiantes);
                    tabPane.appendChild(divbutton0);
                }
                
                // if (subhorarioAux.asistencia) {
                //     var divbutton1 = document.createElement('div');
                //     divbutton1.className = 'btn-group mr-2 col-md-2 mb-3';
                //     divbutton1.role = 'group';
                //     var btnAsistencia = document.createElement('button');
                //     btnAsistencia.className = 'btn btn-secondary';
                //     btnAsistencia.type = 'button';
                //     btnAsistencia.textContent = 'Asistencia';
                //     // Agregar lógica de clic al botón de asistencia
                //     btnAsistencia.addEventListener('click', function () {
                //         // Lógica para el botón de asistencia
                //         asistencia('2023-05-15', '2023-08-22');
                //     });
                //     divbutton1.appendChild(btnAsistencia);
                //     tabPane.appendChild(divbutton1);
                // }

                if (subhorarioAux.nota) {
                    var divbutton2 = document.createElement('div');
                    divbutton2.className = 'btn-group mr-3 ml-3 col-md-3 mb-3';
                    divbutton2.role = 'group';
                    var btnNota = document.createElement('button');
                    btnNota.className = 'btn btn-secondary btnPrimaryUC';
                    btnNota.style.marginLeft = '10px';
                    btnNota.style.marginRight = '10px';
                    btnNota.type = 'button';
                    btnNota.textContent = 'Notas de evaluaciones';
                    // Agregar lógica de clic al botón de nota
                    btnNota.id = 'notaPar' + cursoKey + k;
                    btnNota.addEventListener('click', (function (subhorario, botonId) {
                        return function () {
                            notasParciales('Estudiantes' + botonId, botonId, 'notaPar', selectedPeriodo, subhorario.acta);
                        };
                    })(subhorarioAux, btnNota.id));
                    divbutton2.appendChild(btnNota);
                    tabPane.appendChild(divbutton2);
                }

                if (subhorarioAux.nota) {
                    var divbutton2 = document.createElement('div');
                    divbutton2.className = 'btn-group mr-3 ml-3 col-md-3 mb-3';
                    divbutton2.role = 'group';
                    var btnNota = document.createElement('button');
                    btnNota.className = 'btn btn-secondary btnPrimaryUC';
                    btnNota.style.marginLeft = '10px';
                    btnNota.style.marginRight = '10px';
                    btnNota.type = 'button';
                    btnNota.textContent = 'Notas  Final Preliminar';
                    // Agregar lógica de clic al botón de nota
                    btnNota.id = 'notaFin' + cursoKey + k;
                    btnNota.addEventListener('click', (function (subhorario, botonId) {
                        return function () {
                            notasFinalesPre('Estudiantes' + botonId, botonId, 'notaFin', selectedPeriodo, subhorario.acta,subhorario.notaApro);
                        };
                    })(subhorarioAux, btnNota.id));
                    divbutton2.appendChild(btnNota);
                    tabPane.appendChild(divbutton2);
                }

                if (subhorarioAux.actas) {
                    var divbutton3 = document.createElement('div');
                    divbutton3.className = 'btn-group mr-3 ml-3 col-md-2 mb-3';
                    divbutton3.role = 'group';
                    var btnActas = document.createElement('button');
                    btnActas.className = 'btn btn-secondary btnPrimaryUC';
                    btnActas.style.marginLeft = '10px';
                    btnActas.style.marginRight = '10px';
                    btnActas.type = 'button';
                    btnActas.textContent = 'Actas';
                    
                    divbutton3.appendChild(btnActas);
                    tabPane.appendChild(divbutton3);
                }
                if (subhorarioAux.notaExtra) {
                    var divbutton4 = document.createElement('div');
                    divbutton4.className = 'btn-group mr-3 ml-3 col-md-3 mb-3';
                    divbutton4.role = 'group';
                    var btnExtr = document.createElement('button');
                    btnExtr.className = 'btn btn-secondary btnPrimaryUC';
                    btnExtr.style.marginLeft = '10px';
                    btnExtr.style.marginRight = '10px';
                    btnExtr.type = 'button';
                    btnExtr.textContent = 'Nota extraordinaria';
                    btnExtr.id = 'notasExtra' + cursoKey + k;
                    // Agregar lógica de clic al botón de actas

                    divbutton4.appendChild(btnExtr);
                    tabPane.appendChild(divbutton4);
                }
                tabContent.appendChild(tabPane);
                cardBody.appendChild(tabContent);
                card.appendChild(cardTitle);
                card.appendChild(cardHeader);
                card.appendChild(cardBody);
                if (subhorarioAux.tipoActa == 'Regular'){
                    cardsContainerR.appendChild(card);
                }else if (subhorarioAux.tipoActa == 'Suficiencia'){
                    cardsContainerS.appendChild(card);
                }
                else{
                    cardsContainerM.appendChild(card);
                }
            }
        }
        cardCounter++;
    }

    
}

function getData(tipo, periodo, acta) {
    // Define the payload data
    const payload = {
        "periodo": periodo,
        "acta": acta,
    };
    
    // Convert the payload to a query string
    const queryString = Object.keys(payload)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(payload[key]))
        .join('&');
    
    return new Promise(function (resolve, reject) {
        var url = '';
        if(tipo === 'asistencia'){
            url ='/getListaEstudiantes/?tipo=' + encodeURIComponent(tipo) + '&semana=' + encodeURIComponent(document.getElementById('selectSemana').value);
        }else{
            url ='/getListaEstudiantes/?tipo=' + encodeURIComponent(tipo) + '&' + queryString;
        }
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function () {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
            } else {
                reject(xhr.statusText);
            }
        }
        xhr.onerror = function () {
            reject(xhr.statusText);
        }
        xhr.send();
    });
}

function listaEstudiante(tipo, periodo, acta) {
    getData(tipo, periodo, acta)
        .then(function (dataL) {
            var data = dataL;
            var contenedor = document.querySelector('#modal_funcionesBody');
            contenedor.innerHTML = '';
            document.getElementById('modal_funcionesTitle').innerText = 'Lista de Estudiantes'
            const mensaje = document.createElement('p');
            mensaje.textContent = '⚠ Los estudiantes con texto en negrita tienen deudas pendientes.';
            mensaje.style.fontWeight = 'bold';
            mensaje.style.color = 'darkred';
            mensaje.style.marginBottom = '10px';
            contenedor.appendChild(mensaje);
            var divTable = document.createElement('div');
            divTable.className = 'table-responsive-lg mb-3 mt-5';

            var table = document.createElement('table');
            table.className = 'table table-striped table-bordered dataTable';
            table.id = 'tablaLista';

            var thead = document.createElement('thead');
            var tr = document.createElement('tr');

            var thC = document.createElement('th');
            thC.scope = "col";
            thC.appendChild(document.createTextNode('Identificación'));

            var thN = document.createElement('th');
            thN.scope = "col";
            thN.appendChild(document.createTextNode('Nombre'));

            var thCo = document.createElement('th');
            thCo.scope = "col";
            thCo.appendChild(document.createTextNode('Correo'));

            var thT1 = document.createElement('th');
            thT1.scope = "col";
            thT1.appendChild(document.createTextNode('Telefono 1'));

            var thT2 = document.createElement('th');
            thT2.scope = "col";
            thT2.appendChild(document.createTextNode('Telefono 2'));
            tr.appendChild(thC);
            tr.appendChild(thN);
            /*tr.appendChild(thCo);
            tr.appendChild(thT1);
            tr.appendChild(thT2);*/
            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = document.createElement('tbody');
            tbody.id = 'listBody';
            table.appendChild(tbody);
            data.forEach(estudiante => {
                var trb = document.createElement('tr');
                var td_C = document.createElement('td');
                td_C.appendChild(document.createTextNode(' ' + estudiante.identificacion));

                var td_N = document.createElement('td');
                td_N.appendChild(document.createTextNode(' ' + estudiante.estudiante));
                if (estudiante.moroso) {
                    td_C.style.fontWeight = 'bold';
                    td_N.style.fontWeight = 'bold';
                }

                /*var td_Co = document.createElement('td');
                td_Co.appendChild(document.createTextNode(' ' + estudiante.correo));

                var td_T1 = document.createElement('td');
                td_T1.appendChild(document.createTextNode(' ' + estudiante.telefono1));

                var td_T2 = document.createElement('td');
                td_T2.appendChild(document.createTextNode(' ' + estudiante.telefono2));*/

                trb.appendChild(td_C);
                trb.appendChild(td_N);
                /*trb.appendChild(td_Co);
                trb.appendChild(td_T1);
                trb.appendChild(td_T2);*/
                tbody.appendChild(trb);
            });

            divTable.appendChild(table);
            contenedor.appendChild(divTable);
            $('#tablaLista').DataTable({
                language: {
                    "sLengthMenu": "Mostrar _MENU_ registros",
                    "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    "sZeroRecords": "No se encontraron resultados",
                    "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sSearch": "Buscar:",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sLast": "Último",
                        "sNext": "Siguiente",
                        "sPrevious": "Anterior"
                    },
                }

            });

            $('#modal_funciones').modal('show');
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function asistencia() {
    var contenedor = document.querySelector('#modal_funcionesBody');
    contenedor.innerHTML = '';
    document.getElementById('modal_funcionesTitle').innerText = 'Asistencia'
    var divRow = document.createElement('div');
    divRow.className = 'row';
    var divSelect = document.createElement('div');
    divSelect.className = 'col-12 col-lg-3 col-md-6 col-sm-12 mx-auto';
    var divFormGroup = document.createElement('div');
    divFormGroup.className = 'form-group';
    var label = document.createElement('label');
    label.className = 'd-inline p-2';
    label.setAttribute('for', 'semana');
    label.innerText = 'Seleccione una semana'
    var select = document.createElement('select');
    select.className = 'form-select d-inline p-2';
    select.id = 'selectSemana';
    var optionD = document.createElement('option');
    optionD.selected = true;
    optionD.disabled = true;
    optionD.hidden = true;
    optionD.innerText = ''
    select.appendChild(optionD);
    for (var i = 1; i <= 15; i++) {
        var option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        select.appendChild(option);
    }
    divFormGroup.appendChild(label);
    select.addEventListener('change', function () {
        var divTable = document.querySelector('#divTable');
        if (divTable) {
            divTable.remove();
        }
        updateTabla('asistencia',"","");
    });
    divFormGroup.appendChild(select);
    divSelect.appendChild(divFormGroup);
    divRow.appendChild(divSelect);
    contenedor.appendChild(divRow);
    $('#modal_funciones').modal('show');
}

function updateTabla(tipo,perido,acta) {
  const modalBody = document.querySelector('#modal_funcionesBody');
  if (!modalBody) return;

  document.querySelector('#asistenciaName')?.remove();

  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const td = (text) => el('td', { textContent: ' ' + text });

  const DT_LANG = {
    sLengthMenu: "Mostrar _MENU_ registros",
    sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
    sZeroRecords: "No se encontraron resultados",
    sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
    sSearch: "Buscar:",
    oPaginate: { sFirst: "Primero", sLast: "Último", sNext: "Siguiente", sPrevious: "Anterior" }
  };

  getData(tipo,perido,acta)
    .then(function (data) {
      const rowCa = el('div', { className: 'row mb-5', id: 'asistenciaName' });

      // — Botones prev/next con delegación de eventos —
      const divbuttonGroup = el('div', { className: 'btn-group', role: 'group' });
      ['prev', 'next'].forEach(dir => {
        const btn = el('button', {
          className: `btn btn-primary carousel-control ${dir}-btn carousel-control-${dir}-icon`,
          type: 'button'
        });
        btn.dataset.direction = dir;
        btn.setAttribute('data-bs-target', 'carouselBasicExample');
        btn.setAttribute('data-bs-slide', dir);
        divbuttonGroup.appendChild(btn);
      });
      divbuttonGroup.addEventListener('click', (e) => {
        const dir = e.target.dataset.direction;
        if (dir) $("#carouselBasicExample").carousel(dir);
      });

      const colCaBtn = el('div', { className: 'col-md-12 d-flex justify-content-end' });
      colCaBtn.appendChild(divbuttonGroup);

      const carousel = el('div', {
        id: 'carouselBasicExample',
        className: 'carousel slide carousel-fade'
      });
      carousel.setAttribute('data-bs-ride', 'carousel');

      const carouselInner = el('div', { className: 'carousel-inner', id: 'items' });

      data.forEach((estudiantes, index) => {
        // — Cabecera de carrera/horario —
        const divRowCarrera = el('div', { className: 'row' });
        [
          { cls: 'col-md-7 mb-3', id: 'idAsis',    text: estudiantes.idAsistencia },
          { cls: 'col-md-7 mb-3', id: null,         text: estudiantes.curso },
          { cls: 'col-md-7 mb-3', id: 'horarioAsi', text: estudiantes.horario }
        ].forEach(({ cls, id, text }) => {
          const col = el('div', { className: cls });
          const span = el('span', { innerText: text });
          if (id) span.id = id;
          col.appendChild(span);
          divRowCarrera.appendChild(col);
        });

        // — Tabla —
        const table = el('table', {
          className: 'table table-striped table-bordered dataTable miTabla',
          id: 'tablaLista' + index
        });
        const thead = el('thead');
        thead.innerHTML = `<tr>
          <th scope="col">#</th>
          <th scope="col">Identificación</th>
          <th scope="col">Nombre</th>
          <th scope="col">Presente</th>
        </tr>`;
        table.appendChild(thead);

        const tbody = el('tbody', { id: 'listBody' });
        const frag = document.createDocumentFragment(); // batch insert

        estudiantes.resultado.data.estudiantes.forEach((estudiante, item) => {
          const trRow = el('tr');
          const check = el('input', { type: 'checkbox', id: `${item + 1}-checkbox` });
          if (estudiante.presente) check.checked = true;
          const tdCheck = el('td');
          tdCheck.appendChild(check);

          trRow.append(td(item + 1), td(estudiante.identificacion), td(estudiante.estudiante), tdCheck);
          frag.appendChild(trRow);
        });
        tbody.appendChild(frag);
        table.appendChild(tbody);

        // — Botón subir asistencia —
        const divRowButtonA = el('div', { className: 'row' });
        const divColButtonA = el('div', { className: 'col-md-6' });
        const buttonSaveA = el('button', {
          id: 'subirAsistencia',
          className: 'btn btn-primary',
          innerText: 'Subir asistencia'
        });
        divColButtonA.appendChild(buttonSaveA);
        divRowButtonA.appendChild(divColButtonA);

        const divTable = el('div', { className: 'table-responsive-lg mb-3', id: 'divTable' });
        divTable.appendChild(table);

        const carouselItem = el('div', { className: 'carousel-item rounded-3' });
        carouselItem.setAttribute('data-bs-interval', 3600000);
        if (index === 0) carouselItem.classList.add('active');

        carouselItem.append(divRowCarrera, divTable, divRowButtonA);
        carouselInner.appendChild(carouselItem);
      });

      carousel.appendChild(carouselInner);
      const colCa = el('div', { className: 'col-md-12' });
      colCa.appendChild(carousel);
      rowCa.append(colCaBtn, colCa);
      modalBody.appendChild(rowCa);

      // — Inicializar solo las tablas nuevas —
      data.forEach((_, index) => {
        $(`#tablaLista${index}`).DataTable({ responsive: true, autoWidth: false, language: DT_LANG, pageLength: 50 });
      });
    })
    .catch(error => console.error('Error:', error));
}
let selectedOption = '';
function notasParciales(id, nombre, tipo, periodo, acta) {
    selectedOption = '';
    getData(tipo, periodo, acta)
        .then(function (dataL) {
            var data = dataL.dataE;
            if (document.getElementById(id)) {
                console.log(id)
                $('#modal_funciones').modal('show');
            } else {
                var contenedor = document.querySelector('#modal_funcionesBody');
                contenedor.innerHTML = '';
                document.getElementById('modal_funcionesTitle').innerText = 'Añadir notas';
                const mensaje = document.createElement('p');
                mensaje.textContent = '⚠ Los estudiantes con texto en negrita tienen deudas pendientes.';
                mensaje.style.fontWeight = 'bold';
                mensaje.style.color = 'darkred';
                mensaje.style.marginBottom = '10px';
                contenedor.appendChild(mensaje);
                var divRow = document.createElement('div');
                divRow.className = 'row';
                divRow.id = id;
                var divSelect = document.createElement('div');
                divSelect.className = 'form-group col-12 col-lg-3 col-md-6 col-sm-12';
                var label = document.createElement('label');
                label.className = '';
                label.setAttribute('for', 'parcial');
                label.innerText = 'Seleccione un examen'
                var select = document.createElement('select');
                select.className = 'form-select';
                select.id = 'selectExamen';
                var optionD = document.createElement('option');
                var optionE1 = document.createElement('option');
                var optionE2 = document.createElement('option');
                var optionEF = document.createElement('option');
                var optionEO = document.createElement('option');
                optionD.selected = true;
                optionD.disabled = true;
                optionD.hidden = true;
                optionD.innerText = 'Seleccione un examen';

                optionE1.value = 'Parcial1'
                optionE1.innerText = 'Evaluación 1';
                optionE2.value = 'Parcial2'
                optionE2.innerText = 'Evaluación 2';
                optionEF.value = 'ExamenF'
                optionEF.innerText = 'Evaluación Final';
                optionEO.value = 'Otras'
                optionEO.innerText = 'Otra evaluación';

                select.addEventListener('change', function (event) {
                    selectedOption = event.target.value;
                    habilitarInput(event.target.value)
                });

                select.appendChild(optionD);
                select.appendChild(optionE1);
                select.appendChild(optionE2);
                select.appendChild(optionEF);
                select.appendChild(optionEO);

                divSelect.appendChild(label);
                divSelect.appendChild(select);
                var divinfo = document.createElement('div');
                divinfo.className = 'form-group col-12 col-lg-12 col-md-12 col-sm-12';
                var span = document.createElement('span');
                span.innerText = 'Detalle de nota ';
                var iSpan = document.createElement('i');
                iSpan.className = 'bi bi-info-circle-fill';
                iSpan.style.cursor = 'pointer';
                iSpan.addEventListener('click', function () {
                    mostrarInfo();
                });
                span.appendChild(iSpan);
                divinfo.appendChild(span);
                var divRowAlert = document.createElement('div');
                divRowAlert.className = 'row ';
                var divAlert = document.createElement('div');
                divAlert.className = 'col-12 col-sm-12 col-md-12 col-lg-7 mx-auto';
                var divInfo = document.createElement('div');
                divInfo.className = 'alert alert-info';
                divInfo.role = 'alert';
                divInfo.style.display = 'none';
                divInfo.id = 'infoNota';
                var pInfo = document.createElement('p');
                pInfo.innerText = 'Valores permitidos son: ';
                var ulInfo = document.createElement('ul');
                ulInfo.className = 'mb-0';
                var liInfoN = document.createElement('li');
                liInfoN.innerText = 'Entre 0 a 100';
                var liInfoNP = document.createElement('li');
                liInfoNP.innerText = 'NP (No se presento)';
                ulInfo.appendChild(liInfoN);
                ulInfo.appendChild(liInfoNP);
                divInfo.appendChild(pInfo);
                divInfo.appendChild(ulInfo);

                var divError = document.createElement('div');
                divError.className = 'alert alert-danger';
                divError.role = 'alert';
                divError.style.display = 'none';
                divError.id = 'errorNota';
                var ulError = document.createElement('ul');
                ulError.className = 'mb-0';
                var liError = document.createElement('li');
                liError.innerText = 'Valores invalidos, solo se permite valores entre 0 a 100 y NSP, NPF';
                ulError.appendChild(liError);
                divError.appendChild(ulError);
                divAlert.appendChild(divInfo);
                divAlert.appendChild(divError);
                divRow.appendChild(divSelect);
                divRow.appendChild(divinfo);
                divRowAlert.appendChild(divAlert);
                // divRow.appendChild(divInput);
                // divRow.appendChild(divInputII);
                // divRow.appendChild(divInputIII);

                var divTable = document.createElement('div');
                divTable.className = 'table-responsive-lg mb-3';
                divTable.id = 'divTable';
                var table = document.createElement('table');
                table.className = 'table  dataTable';
                table.id = 'tablaLista';

                var thead = document.createElement('thead');
                var tr = document.createElement('tr');

                var thNu = document.createElement('th');
                thNu.scope = "col";
                thNu.appendChild(document.createTextNode('#'));

                var thC = document.createElement('th');
                thC.scope = "col";
                thC.appendChild(document.createTextNode('Identificación'));

                var thN = document.createElement('th');
                thN.scope = "col";
                thN.appendChild(document.createTextNode('Nombre'));

                var thP1 = document.createElement('th');
                thP1.scope = "col";
                thP1.appendChild(document.createTextNode('Evaluación 1'));

                var thP2 = document.createElement('th');
                thP2.scope = "col";
                thP2.appendChild(document.createTextNode('Evaluación 2'));

                var thP3 = document.createElement('th');
                thP3.scope = "col";
                thP3.appendChild(document.createTextNode('Evaluación Final'));

                var thP4 = document.createElement('th');
                thP4.scope = "col";
                thP4.appendChild(document.createTextNode('Otras evaluación'));

                var thP5 = document.createElement('th');
                thP5.scope = "col";
                thP5.appendChild(document.createTextNode('Modalidad'));

                var thP6 = document.createElement('th');
                thP6.scope = "col";
                thP6.appendChild(document.createTextNode('Estado'));

                tr.appendChild(thNu);
                tr.appendChild(thC);
                tr.appendChild(thN);
                tr.appendChild(thP1);
                tr.appendChild(thP2);
                tr.appendChild(thP3);
                tr.appendChild(thP4);
                tr.appendChild(thP5);
                tr.appendChild(thP6);

                thead.appendChild(tr);
                table.appendChild(thead);
                var tbody = document.createElement('tbody');
                tbody.id = 'listBody';
                table.appendChild(tbody);
                divTable.appendChild(table);

                data.forEach((estudiante, item) => {
                    var trRow = document.createElement('tr');
                    var td_Nu = document.createElement('td');
                    var pos = item + 1
                    td_Nu.appendChild(document.createTextNode(' ' + pos));

                    var td_I = document.createElement('td');
                    td_I.id = estudiante.identificacion;
                    td_I.appendChild(document.createTextNode(' ' + estudiante.identificacion));

                    var td_No = document.createElement('td');
                    td_No.appendChild(document.createTextNode(' ' + estudiante.estudiante));

                    var td_P1 = document.createElement('td');
                    var inputP1 = document.createElement('input');
                    inputP1.className = 'form-control form-control-sm';
                    inputP1.id = 'par1' + estudiante.identificacion;
                    inputP1.readOnly = true;
                    inputP1.value = estudiante.nota_Primera_Evaluacion;
                    inputP1.addEventListener('change', function () {
                        validarData('par1' + estudiante.identificacion, estudiante.identificacion, 'Parcial1', nombre);
                    })
                    if (inputP1.value.trim() === '') {
                        inputP1.value = obtenerValorNota(estudiante.identificacion, 'Parcial1', nombre);
                    }
                    td_P1.appendChild(inputP1);

                    var td_P2 = document.createElement('td');
                    var inputP2 = document.createElement('input');
                    inputP2.className = 'form-control form-control-sm';
                    inputP2.id = 'par2' + estudiante.identificacion;
                    inputP2.readOnly = true;
                    inputP2.value = estudiante.nota_Segunda_Evaluacion;
                    inputP2.addEventListener('change', function () {
                        validarData('par2' + estudiante.identificacion, estudiante.identificacion, 'Parcial2', nombre);
                    })
                    if (inputP2.value.trim() === '') {
                        inputP2.value = obtenerValorNota(estudiante.identificacion, 'Parcial2', nombre);
                    }
                    td_P2.appendChild(inputP2);

                    var td_P3 = document.createElement('td');
                    var inputP3 = document.createElement('input');
                    inputP3.className = 'form-control form-control-sm';
                    inputP3.id = 'par3' + estudiante.identificacion;
                    inputP3.readOnly = true;
                    inputP3.value = estudiante.nota_Tercera_Evaluacion;
                    inputP3.addEventListener('change', function () {
                        validarData('par3' + estudiante.identificacion, estudiante.identificacion, 'Parcial3', nombre);
                    })
                    if (inputP3.value.trim() === '') {
                        inputP3.value = obtenerValorNota(estudiante.identificacion, 'Parcial3', nombre);
                    }
                    td_P3.appendChild(inputP3);

                    var td_P4 = document.createElement('td');
                    var inputP4 = document.createElement('input');
                    inputP4.className = 'form-control form-control-sm';
                    inputP4.id = 'par4' + estudiante.identificacion;
                    inputP4.readOnly = true;
                    inputP4.value = estudiante.nota_Otros_Copnceptos;
                    inputP4.addEventListener('change', function () {
                        validarData('par4' + estudiante.identificacion, estudiante.identificacion, 'Parcial4', nombre);
                    })
                    if (inputP4.value.trim() === '') {
                        inputP4.value = obtenerValorNota(estudiante.identificacion, 'Parcial4', nombre);
                    }
                    td_P4.appendChild(inputP4);

                    var td_Mod = document.createElement('td');
                    td_Mod.appendChild(document.createTextNode(' ' + estudiante.modialidad));

                    var td_Es = document.createElement('td');
                    td_Es.appendChild(document.createTextNode(' ' + estudiante.estado_Matricula));
                    if (estudiante.moroso) {
                        td_Nu.style.fontWeight = 'bold';
                        td_I.style.fontWeight = 'bold';
                        td_No.style.fontWeight = 'bold';
                        td_P1.style.fontWeight = 'bold';
                        td_P2.style.fontWeight = 'bold';
                        td_P3.style.fontWeight = 'bold';
                        td_P4.style.fontWeight = 'bold';
                        td_Mod.style.fontWeight = 'bold';
                        td_Es.style.fontWeight = 'bold';
                        inputP1.style.fontWeight = 'bold';
                        inputP2.style.fontWeight = 'bold';
                        inputP3.style.fontWeight = 'bold';
                        inputP4.style.fontWeight = 'bold';
                    }

                    trRow.appendChild(td_Nu);
                    trRow.appendChild(td_I);
                    trRow.appendChild(td_No);
                    trRow.appendChild(td_P1);
                    trRow.appendChild(td_P2);
                    trRow.appendChild(td_P3);
                    trRow.appendChild(td_P4);
                    trRow.appendChild(td_Mod);
                    trRow.appendChild(td_Es);
                    tbody.appendChild(trRow);
                });
                var divRowBotones = document.createElement('div');
                divRowBotones.className = 'row d-flex justify-content-end';
                var divColBotones = document.createElement('div');
                divColBotones.className = 'col-md-4';

                var divbutton0 = document.createElement('div');
                divbutton0.className = 'btn-group mr-2 col-md-3';
                divbutton0.role = 'group';
                divbutton0.style.display = 'none';
                divbutton0.id = 'parcialdiv1';
                var btnParcial1 = document.createElement('button');
                btnParcial1.className = 'btn btn-secondary';
                btnParcial1.type = 'button';
                btnParcial1.textContent = 'Subir evaluación 1';
                btnParcial1.disabled = true;
                btnParcial1.addEventListener('click', function(){ subirNota('Parcial1', periodo, acta); });
                divbutton0.appendChild(btnParcial1);

                var divbutton1 = document.createElement('div');
                divbutton1.className = 'btn-group mr-2 col-md-3';
                divbutton1.role = 'group';
                divbutton1.style.display = 'none';
                divbutton1.id = 'parcialdiv2';
                var btnParcial2 = document.createElement('button');
                btnParcial2.className = 'btn btn-secondary';
                btnParcial2.type = 'button';
                btnParcial2.textContent = 'Subir evaluación 2';
                btnParcial2.disabled = true;
                btnParcial2.addEventListener('click', function(){ subirNota('Parcial2', periodo, acta); });
                divbutton1.appendChild(btnParcial2);

                var divbutton2 = document.createElement('div');
                divbutton2.className = 'btn-group mr-2 col-md-3';
                divbutton2.role = 'group';
                divbutton2.style.display = 'none';
                divbutton2.id = 'parcialdiv3';
                var btnParcial3 = document.createElement('button');
                btnParcial3.className = 'btn btn-secondary';
                btnParcial3.type = 'button';
                btnParcial3.textContent = 'Subir evaluación final';
                btnParcial3.disabled = true;
                btnParcial3.addEventListener('click', function(){ subirNota('Parcial3', periodo, acta); });
                divbutton2.appendChild(btnParcial3);

                var divbutton3 = document.createElement('div');
                divbutton3.className = 'btn-group mr-2 col-md-3';
                divbutton3.role = 'group';
                divbutton3.style.display = 'none';
                divbutton3.id = 'parcialdiv4';
                var btnParcial4 = document.createElement('button');
                btnParcial4.className = 'btn btn-secondary';
                btnParcial4.type = 'button';
                btnParcial4.textContent = 'Subir otras evaluación';
                btnParcial4.disabled = true;
                btnParcial4.addEventListener('click', function(){ subirNota('Parcial4', periodo, acta); });
                divbutton3.appendChild(btnParcial4);

                divRowBotones.appendChild(divbutton0);
                divRowBotones.appendChild(divbutton1);
                divRowBotones.appendChild(divbutton2);
                divRowBotones.appendChild(divbutton3);

                contenedor.appendChild(divRow);
                contenedor.appendChild(divRowAlert);
                contenedor.appendChild(divTable);
                contenedor.appendChild(divRowBotones);
                $('#tablaLista').DataTable({
                    language: {
                        "sLengthMenu": "Mostrar _MENU_ registros",
                        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        "sZeroRecords": "No se encontraron resultados",
                        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "sSearch": "Buscar:",
                        "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Último",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                        },
                    },
                    drawCallback: function () {
                        habilitarInput(selectedOption);
                    }

                });
                $('#modal_funciones').modal('show');
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });

}
function notasFinalesPre(id, nombre, tipo, periodo, acta,notaMin){
    getData(tipo, periodo, acta)
        .then(function (dataL) {
            const data = dataL.dataE; // Lista de estudiantes, por ejemplo
            const porcentajes = dataL.porcentajes;
            var contenedor = document.querySelector('#modal_funcionesBody');
            contenedor.innerHTML = '';
            document.getElementById('modal_funcionesTitle').innerText = 'Subir Notas Finales';
            const mensaje = document.createElement('p');
            mensaje.textContent = '⚠ Los estudiantes con texto en negrita tienen deudas pendientes.';
            mensaje.style.fontWeight = 'bold';
            mensaje.style.color = 'darkred';
            mensaje.style.marginBottom = '10px';
            contenedor.appendChild(mensaje);
            var divRow = document.createElement('div');
            divRow.className = 'row';
            var divInput = document.createElement('div');
            divInput.className = 'form-group col-12 col-lg-4 col-md-4 col-sm-12 mb-3';
            divInput.id = 'Parcial1';

            var divInputII = document.createElement('div');
            divInputII.className = 'form-group col-12 col-lg-4 col-md-4 col-sm-12 mb-3';
            divInputII.id = 'Parcial2';

            var divInputIII = document.createElement('div');
            divInputIII.className = 'form-group col-12 col-lg-4 col-md-4 col-sm-12 mb-3';
            divInputIII.id = 'ExamenF';

            var divInputIV = document.createElement('div');
            divInputIV.className = 'form-group col-12 col-lg-4 col-md-4 col-sm-12 mb-3';
            divInputIV.id = 'OtrasEv';

            var divInputV = document.createElement('div');
            divInputV.className = 'form-group col-12 col-lg-12 col-md-12 col-sm-12 mb-3';
            divInputV.id = 'buttonDiv';

            var labelI = document.createElement('label');
            labelI.className = '';
            labelI.id = 'lbparcial1';
            labelI.setAttribute('for', 'parcial1');
            labelI.innerText = 'Porcentaje evaluación 1';
            var input = document.createElement('input');
            input.className = 'form-control';
            input.type = 'text';
            input.id = 'parcial1';
            input.placeholder = 'Porcentaje';
            const eval1 = porcentajes.find(p => p.evaluacion_1 !== undefined);
            const valor1 = eval1 ? eval1.evaluacion_1 : 0;
            input.value = (valor1 * 100);
            input.onchange = function () {
                guardarPorcentaje('porcentaje', periodo, acta)
            };

            var labelII = document.createElement('label');
            labelII.className = '';
            labelI.id = 'lbparcial2';
            labelII.setAttribute('for', 'parcial1');
            labelII.innerText = 'Porcentaje evaluación 2';
            var inputII = document.createElement('input');
            inputII.className = 'form-control';
            inputII.type = 'text';
            inputII.id = 'parcial2';
            inputII.placeholder = 'Porcentaje';
            const eval2 = porcentajes.find(p => p.evaluacion_2 !== undefined);
            const valor2 = eval2 ? eval2.evaluacion_2 : 0;
            inputII.value = (valor2 * 100);
            inputII.onchange = function () {
                guardarPorcentaje('porcentaje', periodo, acta)
            };

            var labelIII = document.createElement('label');
            labelIII.className = '';
            labelI.id = 'lbparcial3';
            labelIII.setAttribute('for', 'parcial1');
            labelIII.innerText = 'Porcentaje de evaluación final';
            var inputIII = document.createElement('input');
            inputIII.className = 'form-control';
            inputIII.type = 'text';
            inputIII.id = 'parcial3';
            inputIII.placeholder = 'Porcentaje';
            const eval3 = porcentajes.find(p => p.evaluacion_3 !== undefined);
            const valor3 = eval3 ? eval3.evaluacion_3 : 0;
            inputIII.value = (valor3 * 100);
            inputIII.onchange = function () {
                guardarPorcentaje('porcentaje', periodo, acta)
            };

            var labelIV = document.createElement('label');
            labelIV.className = '';
            labelIV.id = 'lbparcial4';
            labelIV.setAttribute('for', 'parcial1');
            labelIV.innerText = 'Añade el porcentaje de otras evaluaciones';
            var inputIV = document.createElement('input');
            inputIV.className = 'form-control';
            inputIV.type = 'text';
            inputIV.id = 'parcial4';
            inputIV.placeholder = 'Porcentaje';
            const eval4 = porcentajes.find(p => p.evaluacion_Otro !== undefined);
            const valor4 = eval4 ? eval4.evaluacion_Otro : 0;
            inputIV.value = (valor4 * 100);
            inputIV.onchange = function () {
                guardarPorcentaje('porcentaje', periodo, acta)
            };

            var buttonCalcular = document.createElement('button');
            buttonCalcular.id = 'calcular';
            buttonCalcular.className = 'btn btn-secondary btnPrimaryUC me-2';
            buttonCalcular.innerText = 'Calcular nota final';
            buttonCalcular.addEventListener('click', function () {
                calcularNota(function() { calcularNotaFinalPre(notaMin); });
            });

            var buttonGuardar = document.createElement('button');
            buttonGuardar.id = 'guardar';
            buttonGuardar.className = 'btn btn-secondary btnPrimaryUC me-2';
            buttonGuardar.style.display = 'none';
            buttonGuardar.innerText = 'Guardar notas preliminar';
            buttonGuardar.addEventListener('click', function () {
                guardarNotaPre('FinalesPre', periodo, acta);
            });

            var buttonEnviar = document.createElement('button');
            buttonEnviar.id = 'enviar';
            buttonEnviar.className = 'btn btn-secondary btnPrimaryUC me-2';
            buttonEnviar.style.display = 'none';
            buttonEnviar.innerText = 'Enviar notas preliminar';
            buttonEnviar.addEventListener('click', function () {
                enviarNotaPre('notaFinalEstado', periodo, acta);
            });

            divInput.appendChild(labelI);
            divInput.appendChild(input);
            divInputII.appendChild(labelII);
            divInputII.appendChild(inputII);
            divInputIII.appendChild(labelIII);
            divInputIII.appendChild(inputIII);
            divInputIV.appendChild(labelIV);
            divInputIV.appendChild(inputIV);
            divInputV.appendChild(buttonCalcular);
            divInputV.appendChild(buttonGuardar);
            divInputV.appendChild(buttonEnviar);

            divRow.appendChild(divInput);
            divRow.appendChild(divInputII);
            divRow.appendChild(divInputIII);
            divRow.appendChild(divInputIV);
            divRow.appendChild(divInputV);
            var divTable = document.createElement('div');
            divTable.className = 'table-responsive-xl mb-3';
            divTable.id = 'divTable';
            var table = document.createElement('table');
            table.className = 'table table-responsive-lg dataTable';
            table.id = 'tablaLista';

            var thead = document.createElement('thead');
            var tr = document.createElement('tr');

            var thNu = document.createElement('th');
            thNu.scope = "col";
            thNu.appendChild(document.createTextNode('#'));

            var thC = document.createElement('th');
            thC.scope = "col";
            thC.appendChild(document.createTextNode('Identificación'));

            var thN = document.createElement('th');
            thN.scope = "col";
            thN.appendChild(document.createTextNode('Nombre'));

            var thP1 = document.createElement('th');
            thP1.scope = "col";
            thP1.appendChild(document.createTextNode('Evaluación 1'));

            var thP2 = document.createElement('th');
            thP2.scope = "col";
            thP2.appendChild(document.createTextNode('Evaluación 2'));

            var thP3 = document.createElement('th');
            thP3.scope = "col";
            thP3.appendChild(document.createTextNode('Evaluación Final'));

            var thP4 = document.createElement('th');
            thP4.scope = "col";
            thP4.appendChild(document.createTextNode('Otras evaluación'));

            var thP5 = document.createElement('th');
            thP5.scope = "col";
            thP5.appendChild(document.createTextNode('Nota Final Preliminar'));

            var thP7 = document.createElement('th');
            thP7.scope = "col";
            thP7.appendChild(document.createTextNode('Modalidad'));

            var thP6 = document.createElement('th');
            thP6.scope = "col";
            thP6.appendChild(document.createTextNode('Estado'));

            tr.appendChild(thNu);
            tr.appendChild(thC);
            tr.appendChild(thN);
            tr.appendChild(thP1);
            tr.appendChild(thP2);
            tr.appendChild(thP3);
            tr.appendChild(thP4);
            tr.appendChild(thP5);
            tr.appendChild(thP7);
            tr.appendChild(thP6);

            thead.appendChild(tr);
            table.appendChild(thead);

            var tbody = document.createElement('tbody');
            tbody.id = 'listBody';
            table.appendChild(tbody);
            divTable.appendChild(table);
            data.forEach((estudiante, item) => {
                var trRow = document.createElement('tr');
                var td_Nu = document.createElement('td');
                var pos = item + 1
                td_Nu.appendChild(document.createTextNode(' ' + pos));

                var td_I = document.createElement('td');
                td_I.id = estudiante.identificacion;
                td_I.appendChild(document.createTextNode(' ' + estudiante.identificacion));

                var td_No = document.createElement('td');
                td_No.appendChild(document.createTextNode(' ' + estudiante.estudiante));

                var td_P1 = document.createElement('td');
                td_P1.className = 'text-center';
                td_P1.appendChild(document.createTextNode(' ' + estudiante.nota_Primera_Evaluacion));
                var td_P2 = document.createElement('td');
                td_P2.className = 'text-center';
                td_P2.appendChild(document.createTextNode(' ' + estudiante.nota_Segunda_Evaluacion));
                var td_P3 = document.createElement('td');
                td_P3.className = 'text-center';
                td_P3.appendChild(document.createTextNode(' ' + estudiante.nota_Tercera_Evaluacion));
                var td_P4 = document.createElement('td');
                td_P4.className = 'text-center';
                td_P4.appendChild(document.createTextNode(' ' + estudiante.nota_Otros_Copnceptos));

                var td_P5 = document.createElement('td');
                td_P5.className = 'text-center';
                td_P5.appendChild(document.createTextNode(' ' + (estudiante.notaPrelinar || estudiante.notaFinal || 0)));
                var td_P7 = document.createElement('td');
                td_P7.className = 'text-center';
                td_P7.appendChild(document.createTextNode(' ' + estudiante.modialidad));
                var td_P6 = document.createElement('td');
                td_P6.className = 'text-center';
                var inputP1 = document.createElement('input');
                inputP1.className = 'form-control form-control-sm';
                inputP1.id = 'par1' + estudiante.identificacion;
                inputP1.readOnly = true;
                inputP1.value = estudiante.estado_Matricula;
                inputP1.addEventListener('change', function () {
                    validarDataEst('par1' + estudiante.identificacion, estudiante.identificacion, 'NotaExtra', nombre);
                })
                td_P6.appendChild(inputP1);

                if (estudiante.moroso) {
                    td_Nu.style.fontWeight = 'bold';
                    td_I.style.fontWeight = 'bold';
                    td_No.style.fontWeight = 'bold';
                    td_P1.style.fontWeight = 'bold';
                    td_P2.style.fontWeight = 'bold';
                    td_P3.style.fontWeight = 'bold';
                    td_P4.style.fontWeight = 'bold';
                    td_P5.style.fontWeight = 'bold';
                    td_P7.style.fontWeight = 'bold';
                    td_P6.style.fontWeight = 'bold';
                    inputP1.style.fontWeight = 'bold';
                }

                trRow.appendChild(td_Nu);
                trRow.appendChild(td_I);
                trRow.appendChild(td_No);
                trRow.appendChild(td_P1);
                trRow.appendChild(td_P2);
                trRow.appendChild(td_P3);
                trRow.appendChild(td_P4);
                trRow.appendChild(td_P5);
                trRow.appendChild(td_P7);
                trRow.appendChild(td_P6);
                tbody.appendChild(trRow);
            });

            contenedor.appendChild(divRow);
            contenedor.appendChild(divTable);
            $('#tablaLista').DataTable({
                language: {
                    "sLengthMenu": "Mostrar _MENU_ registros",
                    "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    "sZeroRecords": "No se encontraron resultados",
                    "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sSearch": "Buscar:",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sLast": "Último",
                        "sNext": "Siguiente",
                        "sPrevious": "Anterior"
                    },
                }

            });
           
            $('#modal_funciones').modal('show');
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}
function notasExtra(id, nombre, tipo, periodo, acta) {
    selectedOption = '';
    getData(tipo, periodo, acta)
        .then(function (dataL) {
            var data = dataL.dataE;
            if (document.getElementById(id)) {
                console.log(id)
                $('#modal_funciones').modal('show');
            } else{
                var contenedor = document.querySelector('#modal_funcionesBody');
                contenedor.innerHTML = '';
                const mensaje = document.createElement('p');
                mensaje.textContent = '⚠ Los estudiantes con texto en negrita tienen deudas pendientes.';
                mensaje.style.fontWeight = 'bold';
                mensaje.style.color = 'darkred';
                mensaje.style.marginBottom = '10px';
                contenedor.appendChild(mensaje);
                document.getElementById('modal_funcionesTitle').innerText = 'Añadir nota extraordinaria';
                var divRow = document.createElement('div');
                divRow.className = 'row';
                divRow.id = id;

                var divinfo = document.createElement('div');
                divinfo.className = 'form-group col-12 col-lg-12 col-md-12 col-sm-12';
                var span = document.createElement('span');
                span.innerText = 'Detalle de nota ';
                var iSpan = document.createElement('i');
                iSpan.className = 'bi bi-info-circle-fill';
                iSpan.style.cursor = 'pointer';
                iSpan.addEventListener('click', function () {
                    mostrarInfo();
                });
                span.appendChild(iSpan);
                divinfo.appendChild(span);
                var divRowAlert = document.createElement('div');
                divRowAlert.className = 'row ';
                var divAlert = document.createElement('div');
                divAlert.className = 'col-12 col-sm-12 col-md-12 col-lg-7 mx-auto';
                var divInfo = document.createElement('div');
                divInfo.className = 'alert alert-info';
                divInfo.role = 'alert';
                divInfo.style.display = 'none';
                divInfo.id = 'infoNota';
                var pInfo = document.createElement('p');
                pInfo.innerText = 'Valores permitidos son: ';
                var ulInfo = document.createElement('ul');
                ulInfo.className = 'mb-0';
                var liInfoN = document.createElement('li');
                liInfoN.innerText = 'Entre 0 a 100';
                var liInfoNP = document.createElement('li');
                liInfoNP.innerText = 'NP (No se presento)';
                ulInfo.appendChild(liInfoN);
                ulInfo.appendChild(liInfoNP);
                divInfo.appendChild(pInfo);
                divInfo.appendChild(ulInfo);

                var divError = document.createElement('div');
                divError.className = 'alert alert-danger';
                divError.role = 'alert';
                divError.style.display = 'none';
                divError.id = 'errorNota';
                var ulError = document.createElement('ul');
                ulError.className = 'mb-0';
                var liError = document.createElement('li');
                liError.innerText = 'Valores invalidos, solo se permite valores entre 0 a 100 y NSP, NPF';
                ulError.appendChild(liError);
                divError.appendChild(ulError);
                divAlert.appendChild(divInfo);
                divAlert.appendChild(divError);
                divRow.appendChild(divinfo);
                divRowAlert.appendChild(divAlert);

                var divTable = document.createElement('div');
                divTable.className = 'table-responsive-lg mb-3';
                divTable.id = 'divTable';
                var table = document.createElement('table');
                table.className = 'table  dataTable';
                table.id = 'tablaLista';

                var thead = document.createElement('thead');
                var tr = document.createElement('tr');

                var thNu = document.createElement('th');
                thNu.scope = "col";
                thNu.appendChild(document.createTextNode('#'));

                var thC = document.createElement('th');
                thC.scope = "col";
                thC.appendChild(document.createTextNode('Identificación'));

                var thN = document.createElement('th');
                thN.scope = "col";
                thN.appendChild(document.createTextNode('Nombre'));

                var thP1 = document.createElement('th');
                thP1.scope = "col";
                thP1.appendChild(document.createTextNode('Nota extraordinaria'));

                var thP5 = document.createElement('th');
                thP5.scope = "col";
                thP5.appendChild(document.createTextNode('Modalidad'));

                var thP6 = document.createElement('th');
                thP6.scope = "col";
                thP6.appendChild(document.createTextNode('Estado'));

                tr.appendChild(thNu);
                tr.appendChild(thC);
                tr.appendChild(thN);
                tr.appendChild(thP1);
                tr.appendChild(thP5);
                tr.appendChild(thP6);

                thead.appendChild(tr);
                table.appendChild(thead);
                var tbody = document.createElement('tbody');
                tbody.id = 'listBody';
                table.appendChild(tbody);
                divTable.appendChild(table);
                
                data.forEach((estudiante, item) => {
                    var trRow = document.createElement('tr');
                    var td_Nu = document.createElement('td');
                    var pos = item + 1
                    td_Nu.appendChild(document.createTextNode(' ' + pos));

                    var td_I = document.createElement('td');
                    td_I.id = estudiante.identificacion;
                    td_I.appendChild(document.createTextNode(' ' + estudiante.identificacion));

                    var td_No = document.createElement('td');
                    td_No.appendChild(document.createTextNode(' ' + estudiante.estudiante));
                    
                    var td_P1 = document.createElement('td');
                    var inputP1 = document.createElement('input');
                    inputP1.className = 'form-control form-control-sm';
                    inputP1.id = 'extra' + estudiante.identificacion;
                    inputP1.value = estudiante.nota_Ext;
                    inputP1.addEventListener('change', function () {
                        validarData('extra' + estudiante.identificacion, estudiante.identificacion, 'NotaExtra', nombre);
                    })
                    if (inputP1.value.trim() === '') {
                        inputP1.value = obtenerValorNota(estudiante.identificacion, 'NotaExtra', nombre);
                    }
                    td_P1.appendChild(inputP1);

                    var td_Mod = document.createElement('td');
                    td_Mod.appendChild(document.createTextNode(' ' + estudiante.modialidad));

                    var td_Es = document.createElement('td');
                    td_Es.appendChild(document.createTextNode(' ' + estudiante.estado_Matricula));

                    if (estudiante.moroso) {
                        td_Nu.style.fontWeight = 'bold';
                        td_I.style.fontWeight = 'bold';
                        td_No.style.fontWeight = 'bold';
                        td_P1.style.fontWeight = 'bold';
                        td_Mod.style.fontWeight = 'bold';
                        td_Es.style.fontWeight = 'bold';
                    }

                    trRow.appendChild(td_Nu);
                    trRow.appendChild(td_I);
                    trRow.appendChild(td_No);
                    trRow.appendChild(td_P1);
                    trRow.appendChild(td_Mod);
                    trRow.appendChild(td_Es);
                    tbody.appendChild(trRow);
                });

                var divRowBotones = document.createElement('div');
                divRowBotones.className = 'row d-flex justify-content-end';
                var divColBotones = document.createElement('div');
                divColBotones.className = 'col-md-4';

                var divbutton0 = document.createElement('div');
                divbutton0.className = 'btn-group mr-2 col-md-3';
                divbutton0.role = 'group';
                divbutton0.id = 'divExtra';
                var btnParcial1 = document.createElement('button');
                btnParcial1.className = 'btn btn-secondary';
                btnParcial1.type = 'button';
                btnParcial1.textContent = 'Subir nota extraordinaria';
                btnParcial1.addEventListener('click', function(){
                    guardarNotaExtra('notaExtra', periodo, acta);
                });
                divbutton0.appendChild(btnParcial1);

                divRowBotones.appendChild(divbutton0);

                contenedor.appendChild(divRow);
                contenedor.appendChild(divRowAlert);
                contenedor.appendChild(divTable);
                contenedor.appendChild(divRowBotones);
                $('#modal_funciones').modal('show');
            }
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}

function habilitarInput(index) {
    const columns = $('#tablaLista tr').find('td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7)');
    columns.find('input').prop('readonly', true);

    // $('#Parcial1, #Parcial2, #ExamenF').hide();

    if (index === 'Parcial1') {
        const parcial1Column = $('#tablaLista tr').find('td:nth-child(4)');
        parcial1Column.find('input').prop('readonly', false);
        $('#Parcial1').show();
        $('#parcialdiv1').show();
        examenData = [];
        $('#parcialdiv2, #parcialdiv3, #parcialdiv4').hide();
    } else if (index === 'Parcial2') {
        const parcial2Column = $('#tablaLista tr').find('td:nth-child(5)');
        parcial2Column.find('input').prop('readonly', false);
        $('#Parcial2').show();
        $('#parcialdiv2').show();
        examenData = [];
        $('#parcialdiv1, #parcialdiv3, #parcialdiv4').hide();
    } else if (index === 'ExamenF') {
        const examenFColumn = $('#tablaLista tr').find('td:nth-child(6)');
        examenFColumn.find('input').prop('readonly', false);
        $('#ExamenF').show();
        $('#parcialdiv3').show();
        examenData = [];
        $('#parcialdiv1, #parcialdiv2, #parcialdiv4').hide();
    } else if (index === 'Otras') {
        const otrasColumn = $('#tablaLista tr').find('td:nth-child(7)');
        otrasColumn.find('input').prop('readonly', false);
        $('#ExamenF').show();
        $('#parcialdiv4').show();
        examenData = [];
        $('#parcialdiv1, #parcialdiv2, #parcialdiv3').hide();
    }
    verificarCamposLlenos()
}

let examenData = [];
function validarData(id, idI, tipo, nombre) {
    var inputElement = document.getElementById(id);
    var inputValue = inputElement.value.trim();

    // Expresión regular para validar el texto de 0 a 100
    var textRegex = /^([0-9]{1,2}|100)$/;

    // Expresión regular para validar las opciones "NS", "DF" y "GT"
    var optionRegex = /^(NSP|NSF)$/;

    // Validar el valor del campo de entrada
    if (textRegex.test(inputValue) || optionRegex.test(inputValue)) {
        // El valor es válido
        var identificacion = document.getElementById(idI); // Obtener la identificación desde la tabla
        if (tipo == 'Parcial1') {
            saveData(identificacion.innerText, inputValue, 'Parcial1', nombre);
            
        } else if (tipo == 'Parcial2') {
            saveData(identificacion.innerText, inputValue, 'Parcial2', nombre);
        } else if (tipo == 'Parcial3') {
            saveData(identificacion.innerText, inputValue, 'Parcial3', nombre);
        } else {
            saveData(identificacion.innerText, inputValue, 'Parcial4', nombre);
            
        }

    } else {
        // El valor no es válido, mostrar un mensaje de error
        document.getElementById('errorNota').style.display = 'block';
        setTimeout(function () {
            document.getElementById('errorNota').style.display = 'none';
        }, 5000);
        inputElement.setCustomValidity("Valor no válido: " + inputValue)
        inputElement.value = "";
        console.log("Valor no válido: " + inputValue);
    }
    verificarCamposLlenos();
}

function validarDataEst(id, idI, tipo, nombre) {
    var inputElement = document.getElementById(id);
    var inputValue = inputElement.value.trim();

    // Expresión regular para validar el texto de 0 a 100
    var textRegex = /^([0-9]{1,2}|100)$/;

    // Expresión regular para validar las opciones "NS", "DF" y "GT"
    var optionRegex = /^(NSP|NSF)$/;

    // Validar el valor del campo de entrada
    if (optionRegex.test(inputValue)) {
        // El valor es válido
        var identificacion = document.getElementById(idI); // Obtener la identificación desde la tabla
        if (tipo == 'Parcial1') {
            saveData(identificacion.innerText, inputValue, 'Parcial1', nombre);
            
        } else if (tipo == 'Parcial2') {
            saveData(identificacion.innerText, inputValue, 'Parcial2', nombre);
        } else if (tipo == 'Parcial3') {
            saveData(identificacion.innerText, inputValue, 'Parcial3', nombre);
        } else {
            saveData(identificacion.innerText, inputValue, 'Parcial4', nombre);
            
        }

    } else {
        document.getElementById('textoModalHES').innerText = 'Datos no permitidos';
        document.getElementById('textoModalDEs').innerText = 'Los datos permitidos son: NSP o NSPF';
        $('#myModalEs').modal('show');
    }
    verificarCamposLlenos();
}


function obtenerValorNota(id, tipo, nombre) {
    var notasJson = JSON.parse(localStorage.getItem(nombre));
    if (notasJson === null || notasJson === undefined) {
        return '';
    }
    var notaEncontrada = notasJson.find(function (nota) {
        return nota.identificacion === id && nota.parcial === tipo;
    });
    return notaEncontrada ? notaEncontrada.nota : '';
}

function mostrarInfo() {
    const div = document.getElementById('infoNota');
    if (div.style.display !== 'none') {
        div.style.display = 'none';
    } else {
        div.style.display = '';
        setTimeout(function () {
            div.style.display = 'none';
        }, 6000);
    }
}

function verificarCamposLlenos() {
    const columns = $('#tablaLista tr').find('td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(7)');

    columns.each(function () {
        const column = $(this);
        const inputs = column.find('input');

        const allInputsFilled = inputs.toArray().every(input => input.value.trim() !== '');
        const columnIndex = column.index();
        const buttonId = '#parcialdiv' + (columnIndex - 2);

        $(buttonId).find('button').prop('disabled', !allInputsFilled);
    });
}

function actas(tipo, periodo, acta, sede,profesor,horario,grupo,curso,notaMin) {
    getData(tipo, periodo, acta)
        .then(function (dataL) {
            var data = dataL.dataE;
            var contenedor = document.querySelector('#modal_funcionesBody');
            contenedor.innerHTML = '';
            document.getElementById('modal_funcionesTitle').innerText = 'Subir Actas';
            const mensaje = document.createElement('p');
            mensaje.textContent = '⚠ Los estudiantes con texto en negrita tienen deudas pendientes.';
            mensaje.style.fontWeight = 'bold';
            mensaje.style.color = 'darkred';
            mensaje.style.marginBottom = '10px';
            contenedor.appendChild(mensaje);

            var divRow = document.createElement('div');
            divRow.className = 'row mb-3';

            var divColBot = document.createElement('div');
            divColBot.className = 'col-md-12 d-grid gap-2 d-md-block';

            // Crear los botones
            var btnCalcularNota = document.createElement('button');
            btnCalcularNota.className = 'btn btn-primary me-md-2';
            btnCalcularNota.innerText = 'Calcular Nota';
            btnCalcularNota.id = 'btnCalcularNota';

            var btnImprimirActa = document.createElement('button');
            btnImprimirActa.className = 'btn btn-success me-md-2';
            btnImprimirActa.innerText = 'Imprimir Acta';
            btnImprimirActa.id = 'btnImprimirActa';
            btnImprimirActa.style.display = 'none'; // Oculto inicialmente

            divColBot.appendChild(btnCalcularNota);
            divColBot.appendChild(btnImprimirActa);

            divRow.appendChild(divColBot);
            // Manejadores de eventos para los botones
            btnCalcularNota.addEventListener('click', function () {
                // Lógica para calcular la nota
                console.log('Calculando nota...');
                // Mostrar el siguiente botón
                btnImprimirActa.style.display = 'inline-block';
                btnCalcularNota.setAttribute("disabled",true);
                calcularNotaFinal(notaMin);
                guardarNotaFinal('notaFinal', periodo, acta)
                
            });

            btnImprimirActa.addEventListener('click', function () {
                // Lógica para imprimir el acta
                console.log('Imprimiendo acta...');
                let data = {}
                data.periodo = periodo;
                data.sede = sede;
                data.profesor = profesor;
                data.horario = horario;
                data.grupo = grupo;
                data.curso = curso;
                imprimir(data,acta)
            });

            var divTable = document.createElement('div');
            divTable.className = 'table-responsive-xl mb-3';
            divTable.id = 'divTable';
            var table = document.createElement('table');
            table.className = 'table table-responsive-lg dataTable';
            table.id = 'tablaLista';

            var thead = document.createElement('thead');
            var tr = document.createElement('tr');

            var thNu = document.createElement('th');
            thNu.scope = "col";
            thNu.appendChild(document.createTextNode('#'));

            var thCar = document.createElement('th');
            thCar.scope = "col";
            thCar.appendChild(document.createTextNode('Carnet'));

            var thC = document.createElement('th');
            thC.scope = "col";
            thC.appendChild(document.createTextNode('Identificación'));

            var thN = document.createElement('th');
            thN.scope = "col";
            thN.appendChild(document.createTextNode('Estudiante'));

            var thP1 = document.createElement('th');
            thP1.scope = "col";
            thP1.appendChild(document.createTextNode('Nota'));

            var thP2 = document.createElement('th');
            thP2.scope = "col";
            thP2.appendChild(document.createTextNode('Nota Ext.'));

            var thP5 = document.createElement('th');
            thP5.scope = "col";
            thP5.appendChild(document.createTextNode('Nota final'));

            var thP6 = document.createElement('th');
            thP6.scope = "col";
            thP6.appendChild(document.createTextNode('Resultado'));

            tr.appendChild(thNu);
            tr.appendChild(thCar);
            tr.appendChild(thN);
            tr.appendChild(thC);
            tr.appendChild(thP1);
            tr.appendChild(thP2);
            tr.appendChild(thP5);
            tr.appendChild(thP6);

            thead.appendChild(tr);
            table.appendChild(thead);
            var tbody = document.createElement('tbody');
            tbody.id = 'listBody';
            table.appendChild(tbody);
            divTable.appendChild(table);
            data.forEach((estudiante, item) => {
                var trRow = document.createElement('tr');
                var td_Nu = document.createElement('td');
                var pos = item + 1
                td_Nu.appendChild(document.createTextNode(' ' + pos));

                var td_C = document.createElement('td');
                td_C.id = estudiante.identificacion;
                td_C.appendChild(document.createTextNode(' ' + estudiante.carnet));

                var td_No = document.createElement('td');
                td_No.appendChild(document.createTextNode(' ' + estudiante.estudiante));

                var td_I = document.createElement('td');
                td_I.id = estudiante.identificacion;
                td_I.appendChild(document.createTextNode(' ' + estudiante.identificacion));

                var td_P1 = document.createElement('td');
                td_P1.className = 'text-center';
                td_P1.appendChild(document.createTextNode(' ' + estudiante.notaPrelinar));
                var td_P2 = document.createElement('td');
                td_P2.className = 'text-center';
                td_P2.appendChild(document.createTextNode(' ' + estudiante.nota_Ext));

                var td_P5 = document.createElement('td');
                td_P5.className = 'text-center';
                td_P5.appendChild(document.createTextNode(' ' + estudiante.notaFinal));

                var td_P7 = document.createElement('td');
                td_P7.className = 'text-center';
                td_P7.appendChild(document.createTextNode(' '));

                if (estudiante.moroso) {
                    td_Nu.style.fontWeight = 'bold';
                    td_C.style.fontWeight = 'bold';
                    td_I.style.fontWeight = 'bold';
                    td_No.style.fontWeight = 'bold';
                    td_P1.style.fontWeight = 'bold';
                    td_P2.style.fontWeight = 'bold';
                    td_P5.style.fontWeight = 'bold';
                    td_P7.style.fontWeight = 'bold';
                }

                trRow.appendChild(td_Nu);
                trRow.appendChild(td_C);
                trRow.appendChild(td_No);
                trRow.appendChild(td_I);
                trRow.appendChild(td_P1);
                trRow.appendChild(td_P2);
                /*trRow.appendChild(td_P3);
                trRow.appendChild(td_P4);*/
                trRow.appendChild(td_P5);
                trRow.appendChild(td_P7);
                tbody.appendChild(trRow);

            });

            contenedor.appendChild(divRow);
            contenedor.appendChild(divTable);
            $('#tablaLista').DataTable({
                language: {
                    "sLengthMenu": "Mostrar _MENU_ registros",
                    "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                    "sZeroRecords": "No se encontraron resultados",
                    "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                    "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                    "sSearch": "Buscar:",
                    "oPaginate": {
                        "sFirst": "Primero",
                        "sLast": "Último",
                        "sNext": "Siguiente",
                        "sPrevious": "Anterior"
                    },
                }

            });
            $('#modal_funciones').modal('show');
        })
        .catch(function (error) {
            console.error('Error:', error);
        });
}


function getBase64FromImageUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL('image/jpeg');
            resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
}

function saveData(id, nota, tipo, nombre) {
    const storedData = localStorage.getItem(nombre);
    if (storedData) {
        examenData = JSON.parse(storedData);
    }
    var nota = {
        'parcial': tipo,
        "identificacion": id,
        "nota": nota
    };
    examenData.push(nota);
    localStorage.setItem(nombre, JSON.stringify(examenData));
}

function subirNota(tipo, periodo, acta){
    if (tipo === 'Parcial1'){
        document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la evaluación 1? Este proceso no se puede deshacer.';
    } else if (tipo === 'Parcial2'){
        document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la evaluación 2? Este proceso no se puede deshacer.';
    } else if (tipo === 'Parcial3'){
        document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la evaluación final? Este proceso no se puede deshacer.';
    } else {
        document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar otras evaluaciones? Este proceso no se puede deshacer.';
    }
    $('#myModal').modal('show');
    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        sendNotas('Parcial', periodo, acta);
        $('#myModal').modal('hide');
    });
}

function enviarNotaPre(tipo, periodo, acta){
    var table = $('#tablaLista').DataTable();
    var hayEnCurso = false;
    table.rows().every(function () {
        const rowNode = this.node();
        const inputEstado = rowNode.querySelector('td input');
        if (inputEstado && inputEstado.value.trim() === 'En Curso') {
            hayEnCurso = true;
            return false;
        }
    });
    if (hayEnCurso) {
        document.getElementById('textoModalHES').innerText = 'Hay estudiantes con estado "En Curso". No se puede enviar.';
        document.getElementById('textoModalDEs').innerText = 'Asigne las siglas "NSP" (No se presentó) o "NSF" (No se presentó al final) según corresponda.';
        $('#myModalEs').modal('show');
        return;
    }
    document.getElementById('textoModalD').innerText = '¿Realmente quieres enviar la nota final? Este proceso no se puede deshacer.';
    $('#myModal').modal('show');
    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        sendNotas(tipo, periodo, acta);
        $('#myModal').modal('hide');
    });
}

function guardarNotaPre(tipo, periodo, acta){
    document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la nota final? Este proceso no se puede deshacer.';
    $('#myModal').modal('show');
    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        sendNotas(tipo, periodo, acta);
        $('#myModal').modal('hide');
    });
}

function guardarNotaExtra(tipo, periodo, acta){
    document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la nota extraordinaria? Este proceso no se puede deshacer.';
    $('#myModal').modal('show');
    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        sendNotas(tipo, periodo, acta);
        $('#myModal').modal('hide');
    });
}

function guardarNotaFinal(tipo, periodo, acta){
    document.getElementById('textoModalD').innerText = '¿Realmente quieres guardar la nota final? Este proceso no se puede deshacer.';
    $('#myModal').modal('show');
    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        sendNotas(tipo, periodo, acta);
        $('#myModal').modal('hide');
    });
}

function guardarNotas(tipo, periodo, acta){
    const parciales = {
        "periodo": periodo,
        "acta": acta,
        "identificacion": "",
        "evaluacion": "",
        "estudiantes": []
    };
    if (tipo === 'FinalesPre') {
        parciales.evaluacion = "NotaPre";
    } else if (tipo === 'notaExtra') {
        parciales.evaluacion = "NotaExt";
    } else if (tipo === 'notaFinal' || tipo === 'notaFinalEstado') {
        parciales.evaluacion = "notaFinal";
    } else {
        parciales.evaluacion = document.getElementById("selectExamen")?.value || "";
    }
    const getNota = (valor) =>
        !isNaN(valor) && valor.trim() !== '' ? Number(valor) : valor;
    var table = $('#tablaLista').DataTable();
    table.rows().every(function (rowIdx) {
        const rowNode = this.node();
        const $row = $(this.node());
        const inputs = $row.find('input.form-control-sm');
        var rowData = this.data();
        const notaPrimeraEvaluacion = getNota(inputs.eq(0).val());
        const notaSegundaEvaluacion = getNota(inputs.eq(1).val());
        const notaTerceraEvaluacion = getNota(inputs.eq(2).val());
        const notaOtrosConceptos    = getNota(inputs.eq(3).val());
        const inputEstado = rowNode.querySelector('td:nth-child(10) input');
        const estadoMatricula = inputEstado ? inputEstado.value : rowData[9];
        const estudiantes = {
            "identificacion": rowData[1],
            "estudiante": rowData[2],
            "nota_Primera_Evaluacion": notaPrimeraEvaluacion,
            "nota_Segunda_Evaluacion": notaSegundaEvaluacion,
            "nota_Tercera_Evaluacion": notaTerceraEvaluacion,
            "nota_Otros_Copnceptos": notaOtrosConceptos,
            "notaPrelinar": parseFloat(0.0),
            "nota_Ext": parseFloat(0.0),
            "notaFinal": parseFloat(0.0),
            "modialidad": rowData[7],
            "estado_Matricula": rowData[8],
        };
        if (tipo === 'FinalesPre') {
            estudiantes.nota_Primera_Evaluacion = parseFloat(rowData[3]);
            estudiantes.nota_Segunda_Evaluacion = parseFloat(rowData[4]);
            estudiantes.nota_Tercera_Evaluacion = parseFloat(rowData[5]);
            estudiantes.nota_Otros_Copnceptos = parseFloat(rowData[6]);
            estudiantes.notaPrelinar = rowData[7];
            estudiantes.modialidad = rowData[8];
            estudiantes.estado_Matricula = estadoMatricula;
        }
        if (tipo === 'notaExtra') {
            estudiantes.nota_Ext = parseFloat(notaPrimeraEvaluacion);
            estudiantes.modialidad = rowData[4];
            estudiantes.estado_Matricula = rowData[5];
        }
        if (tipo === 'notaFinal') {
            estudiantes.notaFinal = rowData[6];
            estudiantes.identificacion = rowData[3];
            estudiantes.estado_Matricula = rowData[7];
        }
        if (tipo === 'notaFinalEstado') {
            estudiantes.identificacion = rowData[3];
            estudiantes.notaPrelinar = rowData[4];
            estudiantes.nota_Ext = rowData[5];
            estudiantes.notaFinal = rowData[6];
            estudiantes.estado_Matricula = rowData[7];
        }
        parciales.estudiantes.push(estudiantes);
    });
    return parciales;
}

function guardarPorcentaje(tipo, periodo, acta){
    sendNotas(tipo, periodo, acta);
}

function sendNotas(tipo, periodo, acta){
    let notas = guardarNotas(tipo, periodo, acta);
    let data = JSON.stringify(notas);
    var url = '';
    if (tipo === 'FinalesPre'){
        url = '/enviarERP/?tipo=notaFinalPre';
    } else if (tipo === 'notaExtra'){
        url = '/enviarERP/?tipo=notaExtra';
    } else if (tipo === 'notaFinal'){
        url = '/enviarERP/?tipo=notaFinal';
    } else if (tipo === 'porcentaje'){
        url = '/enviarERP/?tipo=porcentaje';
        let dataP = {
            periodo: periodo,
            acta: acta,
            evaluacion_1: parseFloat(document.getElementById('parcial1').value) / 100,
            evaluacion_2: parseFloat(document.getElementById('parcial2').value) / 100,
            evaluacion_3: parseFloat(document.getElementById('parcial3').value) / 100,
            evaluacion_Otro: parseFloat(document.getElementById('parcial4').value) / 100,
        };
        data = JSON.stringify(dataP);
    } else if (tipo === 'notaFinalEstado'){
        url = '/enviarERP/?tipo=notaFinalEstado';
        let dataP = {
            periodo: periodo,
            acta: acta,
            estudiantes: notas.estudiantes
        };
        data = JSON.stringify(dataP);
    } else {
        url = '/enviarERP/?tipo=notaPar';
    }
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    var csrfToken = getCSRFToken();
    xhr.setRequestHeader("X-CSRFToken", csrfToken);
    xhr.onload = function () {
        if (xhr.status === 200) {
            var resp = JSON.parse(xhr.responseText);
            console.log(resp);
        }
    };
    xhr.send(data);
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

function calcularNota(afterCalc) {
    var porcentaje1    = parseFloat(document.getElementById('parcial1').value);
    var porcentaje2    = parseFloat(document.getElementById('parcial2').value);
    var porcentajeFinal = parseFloat(document.getElementById('parcial3').value);
    var porcentajeOtras = parseFloat(document.getElementById('parcial4').value);

    if (isNaN(porcentaje1) || isNaN(porcentaje2) || isNaN(porcentajeFinal) || isNaN(porcentajeOtras)) {
        alert('Porcentajes deben ser números válidos');
        return false;
    }
    if (porcentaje1 < 0 || porcentaje1 > 100 || porcentaje2 < 0 || porcentaje2 > 100 ||
        porcentajeFinal < 0 || porcentajeFinal > 100 || porcentajeOtras < 0 || porcentajeOtras > 100) {
        alert('Porcentajes deben estar entre 0 y 100');
        return false;
    }
    var sumaPorcentajes = porcentaje1 + porcentaje2 + porcentajeFinal + porcentajeOtras;
    if (sumaPorcentajes !== 100) {
        alert('La suma de los porcentajes debe ser igual a 100');
        return false;
    }

    // Mostrar modal de confirmación antes de calcular
    document.getElementById('textoModalD').innerText =
        '¿Estás seguro de que deseas calcular la nota final con los porcentajes actuales? ' +
        'Eval 1: ' + porcentaje1 + '% · Eval 2: ' + porcentaje2 +
        '% · Final: ' + porcentajeFinal + '% · Otras: ' + porcentajeOtras + '%';
    $('#myModal').modal('show');

    var newButton = document.getElementById('guadarAsis');
    var newButtonClone = newButton.cloneNode(true);
    newButton.parentNode.replaceChild(newButtonClone, newButton);
    newButtonClone.addEventListener('click', function () {
        $('#myModal').modal('hide');
        _ejecutarCalculo(porcentaje1, porcentaje2, porcentajeFinal, porcentajeOtras, sumaPorcentajes);
        if (typeof afterCalc === 'function') afterCalc();
    });
}

function _ejecutarCalculo(porcentaje1, porcentaje2, porcentajeFinal, porcentajeOtras, sumaPorcentajes) {
    var table = $('#tablaLista').DataTable();
    var sumPorcentaje = 0;
    table.rows().every(function (rowIdx) {
        var row = this;
        var rowData = row.data();
        var nota1 = parseFloat(rowData[3]);
        var nota2 = parseFloat(rowData[4]);
        var nota3 = parseFloat(rowData[5]);
        var nota4 = parseFloat(rowData[6]);
        var notaFinal = (nota1 * porcentaje1 / 100) + (nota2 * porcentaje2 / 100) +
                        (nota3 * porcentajeFinal / 100) + (nota4 * porcentajeOtras / 100);
        table.cell(rowIdx, 7).data(notaFinal.toFixed(2));
        document.getElementById('calcular').style.display = 'none';
        document.getElementById('guardar').style.display = '';
        sumPorcentaje += sumaPorcentajes;
    });
}

function calcularNotaFinalPre(notaApro){
    var table = $('#tablaLista').DataTable();
    table.rows().every(function (rowIdx) {
        var row = this;
        var estado = '';
        var rowData = row.data();
        const nota = parseFloat(rowData[7]);
        let notaFinal = 0;
        if (nota) {
            notaFinal = nota >= notaApro ? notaApro : nota;
        } else {
            notaFinal = nota;
        }
        if (notaFinal >= notaApro) {
            estado = 'Aprobado';
        } else if (notaFinal == 0) {
            estado = 'En Curso';
        } else {
            estado = 'Reprobado';
        }
        const rowNode = row.node();
        const inputEstado = rowNode.querySelector('td:nth-child(10) input');
        if (inputEstado) {
            inputEstado.value = estado;
        }
    });
}
