function getPeriodo() {
  var selectedPeriodo = document.getElementById("periodos").value;
  const url = "/getCursoH/?periodo=" + encodeURIComponent(selectedPeriodo);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.onload = function () {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      detalle(data);
    }
  };
  xhr.send();
}

function detalle(data) {
  // var btnA = document.getElementById('asistenciaBtn');
  // btnA.hidden = false;
  var selectedPeriodo = document.getElementById("periodos").value;
  var cardsContainerR = document.getElementById("Regular");
  var cardsContainerS = document.getElementById("Suficiencia");
  var cardsContainerM = document.getElementById("ModalidaG");
  cardsContainerR.innerHTML = "";
  cardsContainerS.innerHTML = "";
  cardsContainerM.innerHTML = "";

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
            horarios: [],
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
      var card = document.createElement("div");
      card.className = "card mb-4 mt-1";
      card.id = "card" + cardCounter;

      // Crear el título del card
      var cardTitle = document.createElement("h1");
      cardTitle.className = "card-title p-2 fw-bold";

      // Crear el header del card
      var cardHeader = document.createElement("div");
      cardHeader.className = "card-header";

      // Crear la lista de pestañas en el header
      var tabList = document.createElement("ul");
      tabList.className = "nav nav-tabs card-header-tabs";
      tabList.role = "tablist";
      tabList.id = "v-pills-tab";

      // Crear las pestañas de los subhorarios
      for (var k = 0; k < curso.horarios.length; k++) {
        var subhorario = curso.horarios[k];
        var posicionTesis = subhorario.acta.indexOf("tesis");
        if (subhorario.tipoActa == "Tesis") {
          cardTitle.textContent =
            subhorario.acta.substring(posicionTesis + "tesis".length + 1) +
            " (Tesis)";
        } else if (subhorario.tipoActa == "Pruebas de grado") {
          cardTitle.textContent = subhorario.acta + " (Pruebas de grado)";
        } else if (subhorario.tipoActa == "Promediado") {
          cardTitle.textContent = subhorario.acta + " (Promediado)";
        } else {
          cardTitle.textContent = subhorario.curso;
        }
        var tabItem = document.createElement("li");
        tabItem.className = "nav-item";

        var tabLink = document.createElement("a");
        tabLink.className =
          subhorario === curso.horarios[0]
            ? "tabsH nav-link active"
            : "tabsH nav-link";
        tabLink.href = "#card" + cardCounter + "-" + "curso" + (k + 1);
        tabLink.setAttribute("data-bs-toggle", "pill");
        tabLink.textContent =
          "Grupo: " + subhorario.grupo + " " + subhorario.horario;

        tabItem.appendChild(tabLink);
        tabList.appendChild(tabItem);
      }

      cardHeader.appendChild(tabList);

      // Crear el cuerpo del card
      var cardBody = document.createElement("div");
      cardBody.className = "card-body";

      // Crear el contenedor de las pestañas en el cuerpo
      var tabContent = document.createElement("div");
      tabContent.className = "tab-content";
      tabContent.id = "v-pills-tabContent";

      // Crear las pestañas de los subhorarios en el cuerpo
      for (var k = 0; k < curso.horarios.length; k++) {
        var subhorarioAux = curso.horarios[k];
        var tabPane = document.createElement("div");
        tabPane.className =
          subhorarioAux === curso.horarios[0]
            ? "tab-pane fade show active mb-3"
            : "tab-pane fade show mb-3";
        tabPane.id = "card" + cardCounter + "-" + "curso" + (k + 1);
        tabPane.role = "tabpanel";
        tabPane.setAttribute("aria-labelledby", "v-pills-home-tab");

        // Crear la tabla dentro de la pestaña
        var table = document.createElement("table");
        table.className = "table misCursoTabla";

        // Crear las filas de la tabla
        var tbody = document.createElement("tbody");

        var tr1 = document.createElement("tr");
        var td11 = document.createElement("td");
        td11.id = "datos";
        td11.style.width = "50px";
        td11.textContent = "Periodo:";
        var td12 = document.createElement("td");
        td12.colSpan = "6";
        td12.style.width = "50px";
        td12.textContent = subhorarioAux.periodo;
        tr1.appendChild(td11);
        tr1.appendChild(td12);

        var tr2 = document.createElement("tr");
        var td21 = document.createElement("td");
        td21.id = "datos";
        td21.style.width = "50px";
        td21.textContent = "Sede:";
        var td22 = document.createElement("td");
        td22.style.width = "50px";
        td22.textContent = subhorarioAux.sede;
        var td23 = document.createElement("td");
        td23.id = "datos";
        td23.style.width = "50px";
        td23.textContent = "# Grupo:";
        var td24 = document.createElement("td");
        td24.style.width = "50px";
        td24.textContent = subhorarioAux.grupo;
        var td25 = document.createElement("td");
        td25.id = "datos";
        td25.style.width = "50px";
        td25.textContent = "Aula:";
        var td26 = document.createElement("td");
        td26.style.width = "50px";
        td26.textContent = subhorarioAux.aula;
        tr2.appendChild(td21);
        tr2.appendChild(td22);
        tr2.appendChild(td23);
        tr2.appendChild(td24);
        tr2.appendChild(td25);
        tr2.appendChild(td26);

        var tr3 = document.createElement("tr");
        var td27 = document.createElement("td");
        td27.id = "datos";
        td27.style.width = "50px";
        td27.textContent = "Horario:";
        var td28 = document.createElement("td");
        td28.style.width = "50px";
        td28.textContent = subhorarioAux.horario;
        var td29 = document.createElement("td");
        td29.id = "datos";
        td29.style.width = "50px";
        td29.textContent = "Estado:";
        var td30 = document.createElement("td");
        td30.style.width = "50px";
        td30.textContent = subhorarioAux.estado;
        td30.colSpan = "3";
        tr3.appendChild(td27);
        tr3.appendChild(td28);
        tr3.appendChild(td29);
        tr3.appendChild(td30);

        var tr4 = document.createElement("tr");
        var td31 = document.createElement("td");
        td31.id = "datos";
        td31.style.width = "50px";
        td31.textContent = "Cupo:";
        var td32 = document.createElement("td");
        td32.style.width = "50px";
        td32.textContent = subhorarioAux.cupo;
        var td33 = document.createElement("td");
        td33.id = "datos";
        td33.style.width = "50px";
        td33.textContent = "Matricula:";
        var td34 = document.createElement("td");
        td34.style.width = "50px";
        td34.textContent = subhorarioAux.matricula;
        td34.colSpan = "3";
        tr4.appendChild(td31);
        tr4.appendChild(td32);
        tr4.appendChild(td33);
        tr4.appendChild(td34);

        var tr5 = document.createElement("tr");
        var td35 = document.createElement("td");
        td35.id = "datos";
        td35.style.width = "50px";
        td35.textContent = "Entrega Notas:";
        var td36 = document.createElement("td");
        td36.colSpan = "5";
        td36.style.width = "50px";
        td36.textContent = subhorarioAux.entregaNotas;
        tr5.appendChild(td35);
        tr5.appendChild(td36);
        // ... Código HTML para las filas ...

        tbody.appendChild(tr1);
        tbody.appendChild(tr2);
        tbody.appendChild(tr3);
        tbody.appendChild(tr4);
        tbody.appendChild(tr5);

        // ... Agregar las demás filas a tbody ...

        table.appendChild(tbody);

        // Agregar la tabla al contenedor
        var tableContainer = document.createElement("div");
        tableContainer.className = "table-responsive mb-3";
        tableContainer.appendChild(table);
        tabPane.appendChild(tableContainer);

        // ... Código HTML para los botones ...
        var divbutton0 = document.createElement("div");
        divbutton0.className = "btn-group mr-2 col-md-2 mb-3";
        divbutton0.role = "group";
        var btnEstudiantes = document.createElement("button");
        btnEstudiantes.className = "btn btn-secondary btnPrimaryUC";
        btnEstudiantes.type = "button";
        btnEstudiantes.textContent = "Ver estudiantes";
        btnEstudiantes.addEventListener('click', (function (subhorario) {
          return function () {
            mostrarModal(selectedPeriodo, subhorario.acta, subhorario.sede, subhorario.profesor, subhorario.horario, subhorario.grupo, subhorario.curso,subhorario.notaApro)
          };
        })(subhorarioAux));
        if(subhorario.tipoActa == 'Regular' || subhorario.tipoActa == 'Suficiencia'){
          divbutton0.appendChild(btnEstudiantes);
          tabPane.appendChild(divbutton0);
        }

        tabContent.appendChild(tabPane);
        cardBody.appendChild(tabContent);
        card.appendChild(cardTitle);
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        if (subhorarioAux.tipoActa == "Regular") {
          cardsContainerR.appendChild(card);
        } else if (subhorarioAux.tipoActa == "Suficiencia") {
          cardsContainerS.appendChild(card);
        } else {
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
    periodo: periodo,
    acta: acta,
  };

  // Convert the payload to a query string
  const queryString = Object.keys(payload)
    .map(
      (key) => encodeURIComponent(key) + "=" + encodeURIComponent(payload[key])
    )
    .join("&");

  return new Promise(function (resolve, reject) {
    var url = "";
    if (tipo === "asistencia") {
      url =
        "/getListaEstudiantes/?tipo=" +
        encodeURIComponent(tipo) +
        "&semana=" +
        encodeURIComponent(document.getElementById("selectSemana").value);
    } else {
      url =
        "/getListaEstudiantes/?tipo=" +
        encodeURIComponent(tipo) +
        "&" +
        queryString;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
    xhr.onload = function () {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      reject(xhr.statusText);
    };
    xhr.send();
  });
}

function mostrarModal(selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro) {
  var contenedor = document.querySelector("#modal_funcionesBody");
  contenedor.innerHTML = "";
  document.getElementById("modal_funcionesTitle").innerText = "Subir Actas";

  // Crear fila y grupo de botones con select
  var divRow = document.createElement("div");
  divRow.className = "row mb-3";

  var divCol = document.createElement("div");
  divCol.className = "col-md-5";

  var inputGroup = document.createElement("div");
  inputGroup.className = "input-group";

  // Select
  var select = document.createElement("select");
  select.className = "form-select";
  select.id = "selectExamen";

  var optionD = document.createElement("option");
  optionD.selected = true;
  optionD.disabled = true;
  optionD.hidden = true;
  optionD.innerText = "Acta de evaluaciones";

  var optionE1 = document.createElement("option");
  optionE1.value = "Parcial1";
  optionE1.innerText = "Evaluación 1";

  var optionE2 = document.createElement("option");
  optionE2.value = "Parcial2";
  optionE2.innerText = "Evaluación 2";

  var optionEF = document.createElement("option");
  optionEF.value = "ExamenF";
  optionEF.innerText = "Evaluación Final";

  var optionEO = document.createElement("option");
  optionEO.value = "Otras";
  optionEO.innerText = "Otra evaluación";

  var optionAc = document.createElement("option");
  optionAc.value = "Acta";
  optionAc.innerText = "Acta final";

  select.appendChild(optionD);
  select.appendChild(optionE1);
  select.appendChild(optionE2);
  select.appendChild(optionEF);
  select.appendChild(optionEO);
  select.appendChild(optionAc);

  select.addEventListener("change", function (event) {
    selectedOption = event.target.value;
    habilitarInput(event.target.value, selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro);
  });

  var btnImprimirActa = document.createElement("button");
  btnImprimirActa.className = "btn btn-success";
  btnImprimirActa.innerText = "Imprimir Acta";
  btnImprimirActa.id = "btnImprimirActa";

  var divButtonGroup = document.createElement("div");
  divButtonGroup.className = "input-group-append ms-2";
  divButtonGroup.appendChild(btnImprimirActa);

  inputGroup.appendChild(select);
  inputGroup.appendChild(divButtonGroup);
  divCol.appendChild(inputGroup);
  divRow.appendChild(divCol);
  contenedor.appendChild(divRow);
  $("#modal_funciones").modal("show");
}

function actas(tipo,periodo,acta,sede,profesor,horario,grupo,curso,notaMin) {
  getData(tipo, periodo, acta)
    .then(function (dataL) {
      var data = dataL;
      var contenedor = document.querySelector("#modal_funcionesBody");
      var tablaActa = document.querySelector('#divTable');
      if (tablaActa){
        $('#tablaLista').DataTable().clear().destroy();
        tablaActa.remove();
        
      }
      var btnImprimirActa = document.getElementById('btnImprimirActa');  
      btnImprimirActa.addEventListener("click", function () {
        console.log("Imprimiendo acta...");
        let data = {
          periodo: periodo,
          sede: sede,
          profesor: profesor,
          horario: horario,
          grupo: grupo,
          curso: curso,
        };
        imprimir(data, acta);
      });

      // Crear tabla
      var divTable = document.createElement("div");
      divTable.className = "table-responsive-xl mb-3";
      divTable.id = "divTable";
      var table = document.createElement("table");
      table.className = "table table-responsive-lg dataTable";
      table.id = "tablaLista";

      var thead = document.createElement("thead");
      var tr = document.createElement("tr");

      var thNu = document.createElement("th");
      thNu.scope = "col";
      thNu.appendChild(document.createTextNode("#"));

      var thCar = document.createElement("th");
      thCar.scope = "col";
      thCar.appendChild(document.createTextNode("Carnet"));

      var thC = document.createElement("th");
      thC.scope = "col";
      thC.appendChild(document.createTextNode("Identificación"));

      var thN = document.createElement("th");
      thN.scope = "col";
      thN.appendChild(document.createTextNode("Estudiante"));

      var thP1 = document.createElement("th");
      thP1.scope = "col";
      thP1.appendChild(document.createTextNode("Nota"));

      var thP2 = document.createElement("th");
      thP2.scope = "col";
      thP2.appendChild(document.createTextNode("Nota Ext."));

      var thP5 = document.createElement("th");
      thP5.scope = "col";
      thP5.appendChild(document.createTextNode("Nota final"));

      var thP6 = document.createElement("th");
      thP6.scope = "col";
      thP6.appendChild(document.createTextNode("Resultado"));

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

      var tbody = document.createElement("tbody");
      tbody.id = "listBody";
      table.appendChild(tbody);
      divTable.appendChild(table);

      data.forEach((estudiante, item) => {
        var trRow = document.createElement("tr");

        var td_Nu = document.createElement("td");
        td_Nu.appendChild(document.createTextNode(" " + (item + 1)));

        var td_C = document.createElement("td");
        td_C.id = estudiante.identificacion;
        td_C.appendChild(
          document.createTextNode(" " + estudiante.carnet)
        );

        var td_No = document.createElement("td");
        td_No.appendChild(document.createTextNode(" " + estudiante.estudiante));

        var td_I = document.createElement("td");
        td_I.id = estudiante.identificacion;
        td_I.appendChild(
          document.createTextNode(" " + estudiante.identificacion)
        );

        var td_P1 = document.createElement("td");
        td_P1.className = "text-center";
        td_P1.appendChild(
          document.createTextNode(" " + estudiante.notaPrelinar)
        );

        var td_P2 = document.createElement("td");
        td_P2.className = "text-center";
        td_P2.appendChild(document.createTextNode(" " + estudiante.nota_Ext));

        var td_P5 = document.createElement("td");
        td_P5.className = "text-center";
        td_P5.appendChild(document.createTextNode(" " + estudiante.notaFinal));

        var td_P7 = document.createElement("td");
        td_P7.className = "text-center";
        td_P7.appendChild(document.createTextNode(" "));

        trRow.appendChild(td_Nu);
        trRow.appendChild(td_C);
        trRow.appendChild(td_No);
        trRow.appendChild(td_I);
        trRow.appendChild(td_P1);
        trRow.appendChild(td_P2);
        trRow.appendChild(td_P5);
        trRow.appendChild(td_P7);
        tbody.appendChild(trRow);
      });

      contenedor.appendChild(divTable);

      $("#tablaLista").DataTable({
        language: {
          sLengthMenu: "Mostrar _MENU_ registros",
          sInfo:
            "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
          sZeroRecords: "No se encontraron resultados",
          sInfoEmpty:
            "Mostrando registros del 0 al 0 de un total de 0 registros",
          sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
          sSearch: "Buscar:",
          oPaginate: {
            sFirst: "Primero",
            sLast: "Último",
            sNext: "Siguiente",
            sPrevious: "Anterior",
          },
        },
      });

      $("#modal_funciones").modal("show");
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

function getBase64FromImageUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => reject(error);
    img.src = url;
  });
}

function notasParciales(id, nombre, tipo, periodo, acta,sede,profesor,horario,grupo,curso,notaMin) {
  selectedOption = "";
  getData(tipo, periodo, acta)
    .then(function (dataL) {
      var data = dataL.dataE;
      if (document.getElementById(id)) {
        console.log(id);
        $("#modal_funciones").modal("show");
      } else {
        var contenedor = document.querySelector("#modal_funcionesBody");
        var tablaActa = document.querySelector('#divTable');
        if (tablaActa){
            $('#tablaLista').DataTable().clear().destroy();
            tablaActa.remove();
            
        }
        var btnImprimirActa = document.getElementById('btnImprimirActa');  
        btnImprimirActa.addEventListener("click", function () {
        console.log("Imprimiendo acta...");
        let data = {
          periodo: periodo,
          sede: sede,
          profesor: profesor,
          horario: horario,
          grupo: grupo,
          curso: curso,
        };
        imprimirExamen(data, acta,nombre);
      });
        var divTable = document.createElement("div");
        divTable.className = "table-responsive-lg mb-3";
        divTable.id = "divTable";
        var table = document.createElement("table");
        table.className = "table  dataTable";
        table.id = "tablaLista";

        var thead = document.createElement("thead");
        var tr = document.createElement("tr");

        var thNu = document.createElement("th");
        thNu.scope = "col";
        thNu.appendChild(document.createTextNode("#"));

        var thCa = document.createElement("th");
        thCa.scope = "col";
        thCa.appendChild(document.createTextNode("Carnet"));

        var thC = document.createElement("th");
        thC.scope = "col";
        thC.appendChild(document.createTextNode("Identificación"));

        var thN = document.createElement("th");
        thN.scope = "col";
        thN.appendChild(document.createTextNode("Nombre"));

        var thP1 = document.createElement("th");
        thP1.scope = "col";
        if (nombre == 'Parcial1'){
          thP1.appendChild(document.createTextNode("Evaluación 1"));
        }  
        var thP2 = document.createElement("th");
        thP2.scope = "col";
        if (nombre == 'Parcial2'){
          thP2.appendChild(document.createTextNode("Evaluación 2"));
        }
        var thP3 = document.createElement("th");
        thP3.scope = "col";
        if (nombre == 'ExamenF'){
          thP3.appendChild(document.createTextNode("Evaluación Final"));
        }
        var thP4 = document.createElement("th");
        thP4.scope = "col";
        if (nombre == 'Otras'){
          thP4.appendChild(document.createTextNode("Otras evaluación"));
        }
        var thP5 = document.createElement("th");
        thP5.scope = "col";
        if (nombre == 'Actas'){
          thP5.appendChild(document.createTextNode("Nota"));
        }
        tr.appendChild(thNu);
        tr.appendChild(thCa);
        tr.appendChild(thN);
        tr.appendChild(thC);
        if (nombre == 'Parcial1'){
            tr.appendChild(thP1);
        }

        if (nombre == 'Parcial2'){
            tr.appendChild(thP2);
        }

        if (nombre == 'ExamenF'){
            tr.appendChild(thP3);
        }

        if (nombre == 'Otras'){
            tr.appendChild(thP4);
        }

        thead.appendChild(tr);
        table.appendChild(thead);
        var tbody = document.createElement("tbody");
        tbody.id = "listBody";
        table.appendChild(tbody);
        divTable.appendChild(table);

        data.forEach((estudiante, item) => {
          var trRow = document.createElement("tr");
          var td_Nu = document.createElement("td");
          var pos = item + 1;
          td_Nu.appendChild(document.createTextNode(" " + pos));

          var td_C = document.createElement("td");
          td_C.id = estudiante.identificacion;
          td_C.appendChild(
            document.createTextNode(" " + estudiante.carnet)
          );

          var td_I = document.createElement("td");
          td_I.id = estudiante.identificacion;
          td_I.appendChild(
            document.createTextNode(" " + estudiante.identificacion)
          );

          var td_No = document.createElement("td");
          td_No.appendChild(
            document.createTextNode(" " + estudiante.estudiante)
          );

          var td_P1 = document.createElement("td");
          var inputP1 = document.createElement("input");
          inputP1.className = "form-control form-control-sm";
          inputP1.id = "par1" + estudiante.identificacion;
          inputP1.readOnly = true;
          inputP1.value = estudiante.nota_Primera_Evaluacion;
          inputP1.addEventListener("change", function () {
            validarData(
              "par1" + estudiante.identificacion,
              estudiante.identificacion,
              "Parcial1",
              nombre
            );
          });
          if (inputP1.value.trim() === "") {
            inputP1.value = obtenerValorNota(
              estudiante.identificacion,
              "Parcial1",
              nombre
            );
          }
          if (nombre == 'Parcial1'){
            td_P1.appendChild(document.createTextNode(" " + estudiante.nota_Primera_Evaluacion));
          }

          var td_P2 = document.createElement("td");
          var inputP2 = document.createElement("input");
          inputP2.className = "form-control form-control-sm";
          inputP2.id = "par2" + estudiante.identificacion;
          inputP2.readOnly = true;
          inputP2.value = estudiante.nota_Segunda_Evaluacion;
          inputP2.addEventListener("change", function () {
            validarData(
              "par2" + estudiante.identificacion,
              estudiante.identificacion,
              "Parcial2",
              nombre
            );
          });
          if (inputP2.value.trim() === "") {
            inputP2.value = obtenerValorNota(
              estudiante.identificacion,
              "Parcial2",
              nombre
            );
          }
          if (nombre == 'Parcial2'){
            td_P2.appendChild(document.createTextNode(" " + estudiante.nota_Segunda_Evaluacion));
          }
          var td_P3 = document.createElement("td");
          var inputP3 = document.createElement("input");
          inputP3.className = "form-control form-control-sm";
          inputP3.id = "par3" + estudiante.identificacion;
          inputP3.readOnly = true;
          inputP3.value = estudiante.nota_Tercera_Evaluacion;
          inputP3.addEventListener("change", function () {
            validarData(
              "par3" + estudiante.identificacion,
              estudiante.identificacion,
              "Parcial3",
              nombre
            );
          });
          if (inputP3.value.trim() === "") {
            inputP3.value = obtenerValorNota(
              estudiante.identificacion,
              "Parcial3",
              nombre
            );
          }
          if (nombre == 'ExamenF'){
            td_P3.appendChild(document.createTextNode(" " + estudiante.nota_Tercera_Evaluacion))
          }
          var td_P4 = document.createElement("td");
          var inputP4 = document.createElement("input");
          inputP4.className = "form-control form-control-sm";
          inputP4.id = "par4" + estudiante.identificacion;
          inputP4.readOnly = true;
          inputP4.value = estudiante.nota_Otros_Copnceptos;
          inputP4.addEventListener("change", function () {
            validarData(
              "par4" + estudiante.identificacion,
              estudiante.identificacion,
              "Parcial4",
              nombre
            );
          });
          if (inputP4.value.trim() === "") {
            inputP4.value = obtenerValorNota(
              estudiante.identificacion,
              "Parcial4",
              nombre
            );
          }
          if (nombre == 'Otras'){
            td_P4.appendChild(document.createTextNode(" " + estudiante.nota_Otros_Copnceptos));
          }
          var td_Mod = document.createElement("td");
          td_Mod.appendChild(
            document.createTextNode(" " + estudiante.modialidad)
          );

          trRow.appendChild(td_Nu);
          trRow.appendChild(td_C);
          trRow.appendChild(td_No);
          trRow.appendChild(td_I);
          if (nombre == 'Parcial1'){
            trRow.appendChild(td_P1);
          }
          if (nombre == 'Parcial2'){
            trRow.appendChild(td_P2);
          }
          if (nombre == 'ExamenF'){
            trRow.appendChild(td_P3);
          }
          if (nombre == 'Otras'){
            trRow.appendChild(td_P4);
          }
          tbody.appendChild(trRow);
        });
        contenedor.appendChild(divTable);
        $("#tablaLista").DataTable({
          language: {
            sLengthMenu: "Mostrar _MENU_ registros",
            sInfo:
              "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            sZeroRecords: "No se encontraron resultados",
            sInfoEmpty:
              "Mostrando registros del 0 al 0 de un total de 0 registros",
            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
            sSearch: "Buscar:",
            oPaginate: {
              sFirst: "Primero",
              sLast: "Último",
              sNext: "Siguiente",
              sPrevious: "Anterior",
            },
          },
          drawCallback: function () {
            habilitarInput(selectedOption);
          },
        });
        $("#modal_funciones").modal("show");
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

function habilitarInput(index, selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro) {
    if (index === 'Parcial1') {
        notasParciales('1','Parcial1','notaPar',selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro)
    }
    if (index === 'Parcial2') {
        notasParciales('1','Parcial2','notaPar',selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro)
    }
    if (index === 'ExamenF') {
        notasParciales('1','ExamenF','notaPar',selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro)
    }
    if (index === 'Otras') {
        notasParciales('1','Otras','notaPar',selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro)
    }
    if (index === 'Acta') {
        actas('actas',selectedPeriodo, acta, sede, profesor, horario, grupo, curso, notaApro)
    }
}

async function imprimir(data,acta) {
    const imageUrl = '../../../../static/img/logoreportUC.png';
    const imageData = await getBase64FromImageUrl(imageUrl);
    var fileActa = acta + '.pdf'; ;
    const today = new Date();
    var diaN = today.getDate();
    var diaT = today.toLocaleDateString('es-ES', { weekday: 'long' });
    var fecha = today.toLocaleDateString('es-ES', { month: 'long' }) + ' ' + today.toLocaleDateString('es-ES', { year: 'numeric' });
    var hora = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    var numericHour = parseInt(hora.substring(0, 2), 10);
    if (numericHour < 12) {
        hora = hora + ' a.m.';
    } else {
        hora = hora + ' p.m.';
    }
    var fechaImpri = diaT + ', ' + diaN + ' ' + fecha + ', ' + hora;

    const tableData = [];
    var table = $('#tablaLista').DataTable();
    table.rows().every(function (rowIdx) {
        var row = this;
        var rowDataT = row.data();

        const rowDataS = [];
        rowDataS.push(rowDataT[0]);
        rowDataS.push(rowDataT[1]);
        rowDataS.push(rowDataT[2]);
        rowDataS.push(rowDataT[3]);
        rowDataS.push(rowDataT[4]);
        rowDataS.push(rowDataT[5]);
        rowDataS.push(rowDataT[6]);
        rowDataS.push(rowDataT[7]);
        tableData.push(rowDataS);
    });
    const signatureLine = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [-50, 32, 0, 0],
    };

    const signatureLine2 = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [143, -47, 0, 0],
    };

    const signatureLine3 = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [340, -47, 0, 0],
    };
    var docDefinition = {

        footer: function (currentPage, pageCount) {
            if (currentPage === pageCount) {
                return {
                    columns: [
                        { text: fechaImpri, style: 'footerT' }
                    ]
                };
            }
        },
        content: [
            { text: 'Acta de Resultados de Curso', style: 'header' },
            { text: data.sede, style: 'subheader' },
            { text: data.periodo, style: 'subheader2' },
            {
                image: imageData,
                width: 100,
                alignment: 'left',
                margin: [20, -60, 0, 25],
            },
            {
                table: {
                    body: [
                        [
                            { text: data.curso, colSpan: 2, style: 'headerCellC' },
                            {},
                        ],
                        [
                            { text: 'Profesor:', style: 'row1' },
                            { text: data.profesor ,style: 'cell'},
                        ],
                        [
                            { text: 'Sede:', style: 'row2' },
                            { text: data.sede,style: 'cell' },
                        ],
                        [
                            { text: 'Horario:', style: 'row3' },
                            { text: data.horario, style: 'cell' }
                        ],
                        [
                            { text: 'No. Grupo:', style: 'row4' },
                            { text: data.grupo ,style: 'cell'}],
                    ],
                    headerRows: 1,
                    widths: ['18%', '87%'],
                },
                style: 'tabla'
            },
            {
                table: {
                    body: [
                        [
                            { text: '', style: 'headerCell' },
                            { text: 'No. Carnet', style: 'headerCell' },
                            { text: 'Estudiante', style: 'headerCell' },
                            { text: 'Cédula', style: 'headerCell' },
                            { text: 'Nota', style: 'headerCell' },
                            { text: 'Nots Ext.', style: 'headerCell' },
                            { text: 'Nota Final', style: 'headerCell' },
                            { text: 'Resultado', style: 'headerCell' },
                        ],
                        ...tableData.map((rowData) => {
                            return [
                                { text: rowData[0], style: 'cell' },
                                { text: rowData[1], style: 'cell' },
                                { text: rowData[2], style: 'cell' },
                                { text: rowData[3], style: 'cell' },
                                { text: rowData[4], style: 'cell' },
                                { text: rowData[5] === 0 ? '--' : rowData[5], style: 'cell' },
                                { text: rowData[6], style: 'cell' },
                                { text: rowData[7], style: 'cell' },
                            ];
                        })
                    ],
                    widths: ['2%', '15%', '29%', '15%', '10%', '10%', '10%', '15%'],
                },
                style: 'tablaDato',
            },
            { text: 'REP: Reprobado. NSP: No se presentó. NPF: No presentó Examen Final. MAT: Matriculado.', style: 'subheader3' },
            { text: 'Nota Mínima de Aprobación: 70.0 (Cursos Regulares) y 80.0 (Pruebas de Grado).', style: 'subheader3' },
            { text: 'Examen Extraordinario: 60.0 - 69.0. Reprobado: < 60.0', style: 'subheader3' },
            signatureLine,
            { text: 'Firma Profesor', style: 'prof' },
            signatureLine2,
            { text: 'Firma Registro', style: 'reg' },
            signatureLine3,
            { text: 'Fecha Recibido', style: 'fecha' },

        ],
        styles: {
            header: { fontSize: 12, bold: true, alignment: 'right', margin: [0, -30, -25, 5] },
            subheader: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 0, -25, 5] },
            subheader2: { fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, -25, 8] },
            headerCell: { fontSize: 10, bold: true, alignment: 'center', fillColor: '#C9D6ED'},
            headerCellC: { fontSize: 12, bold: true, alignment: 'Left', fillColor: '#C9D6ED'},
            tabla: { borderColor: '#bfbfbf', margin: [-32, 5, 0, 6], },
            tablaDato: { borderColor: '#bfbfbf', margin: [-32, 10, 0, 5], },
            prof: { fontSize: 9, margin: [25, 10, 0, 5], },
            reg: { fontSize: 9, margin: [220, 10, 0, 5], },
            fecha: { fontSize: 9, margin: [415, 10, 0, 5], },
            cell: { fontSize: 9},
            row1: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row2: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row3: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row4: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            subheader3: { fontSize: 9, alignment: 'left', margin: [-32, 0, 0, 0], },
            footerT: { fontSize: 9, alignment: 'right', margin: [0, 0, 20, 0] }
        },
    };

    pdfMake.createPdf(docDefinition).download(fileActa);
}

async function imprimirExamen(data,acta,tipo) {
  var nameE= '';
  if(tipo=='Parcial1'){
    nameE = 'Hoja de resultado de la primera evaluación'
  }
  if(tipo=='Parcial2'){
    nameE = 'Hoja de resultado de la segunda evaluación'
  }
  if(tipo=='ExamenF'){
    nameE = 'Hoja de resultado de la tercera evaluación'
  }
  if(tipo=='Otras'){
    nameE = 'Hoja de resultado de otras evaluación'
  }
    const imageUrl = '../../../../static/img/logoreportUC.png';
    const imageData = await getBase64FromImageUrl(imageUrl);
    var fileActa = acta + '.pdf'; ;
    const today = new Date();
    var diaN = today.getDate();
    var diaT = today.toLocaleDateString('es-ES', { weekday: 'long' });
    var fecha = today.toLocaleDateString('es-ES', { month: 'long' }) + ' ' + today.toLocaleDateString('es-ES', { year: 'numeric' });
    var hora = today.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
    var numericHour = parseInt(hora.substring(0, 2), 10);
    if (numericHour < 12) {
        hora = hora + ' a.m.';
    } else {
        hora = hora + ' p.m.';
    }
    var fechaImpri = diaT + ', ' + diaN + ' ' + fecha + ', ' + hora;

    const tableData = [];
    var table = $('#tablaLista').DataTable();
    table.rows().every(function (rowIdx) {
        var row = this;
        var rowDataT = row.data();

        const rowDataS = [];
        rowDataS.push(rowDataT[0]);
        rowDataS.push(rowDataT[1]);
        rowDataS.push(rowDataT[2]);
        rowDataS.push(rowDataT[3]);
        rowDataS.push(rowDataT[4]);
        rowDataS.push(rowDataT[5]);
        rowDataS.push(rowDataT[6]);
        rowDataS.push(rowDataT[7]);
        tableData.push(rowDataS);
    });
    const signatureLine = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [-50, 32, 0, 0],
    };

    const signatureLine2 = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [143, -47, 0, 0],
    };

    const signatureLine3 = {
        canvas: [
            {
                type: 'line',
                x1: 40,
                y1: 20,
                x2: 190,
                y2: 20,
                lineWidth: 1,
                lineColor: '#000000',
            },
        ],
        margin: [340, -47, 0, 0],
    };
    var docDefinition = {

        footer: function (currentPage, pageCount) {
            if (currentPage === pageCount) {
                return {
                    columns: [
                        { text: fechaImpri, style: 'footerT' }
                    ]
                };
            }
        },
        content: [
            { text: nameE, style: 'header' },
            { text: data.sede, style: 'subheader' },
            { text: data.periodo, style: 'subheader2' },
            {
                image: imageData,
                width: 100,
                alignment: 'left',
                margin: [20, -60, 0, 25],
            },
            {
                table: {
                    body: [
                        [
                            { text: data.curso, colSpan: 2, style: 'headerCellC' },
                            {},
                        ],
                        [
                            { text: 'Profesor:', style: 'row1' },
                            { text: data.profesor ,style: 'cell'},
                        ],
                        [
                            { text: 'Sede:', style: 'row2' },
                            { text: data.sede,style: 'cell' },
                        ],
                        [
                            { text: 'Horario:', style: 'row3' },
                            { text: data.horario, style: 'cell' }
                        ],
                        [
                            { text: 'No. Grupo:', style: 'row4' },
                            { text: data.grupo ,style: 'cell'}],
                    ],
                    headerRows: 1,
                    widths: ['18%', '86.5%'],
                },
                style: 'tabla'
            },
            {
                table: {
                    body: [
                        [
                            { text: '', style: 'headerCell' },
                            { text: 'No. Carnet', style: 'headerCell' },
                            { text: 'Estudiante', style: 'headerCell' },
                            { text: 'Cédula', style: 'headerCell' },
                            { text: 'Nota', style: 'headerCell' },
                        ],
                        ...tableData.map((rowData) => {
                            return [
                                { text: rowData[0], style: 'cell' },
                                { text: rowData[1], style: 'cell' },
                                { text: rowData[2], style: 'cell' },
                                { text: rowData[3], style: 'cell' },
                                { text: rowData[4], style: 'cell' },
                            ];
                        })
                    ],
                    widths: ['2%', '25%', '38%', '25%', '15%'],
                },
                style: 'tablaDato',
            },
            { text: 'REP: Reprobado. NSP: No se presentó. NPF: No presentó Examen Final. MAT: Matriculado.', style: 'subheader3' },
            { text: 'Nota Mínima de Aprobación: 70.0 (Cursos Regulares) y 80.0 (Pruebas de Grado).', style: 'subheader3' },
            { text: 'Examen Extraordinario: 60.0 - 69.0. Reprobado: < 60.0', style: 'subheader3' },
            signatureLine,
            { text: 'Firma Profesor', style: 'prof' },
            signatureLine2,
            { text: 'Firma Registro', style: 'reg' },
            signatureLine3,
            { text: 'Fecha Recibido', style: 'fecha' },

        ],
        styles: {
            header: { fontSize: 12, bold: true, alignment: 'right', margin: [0, -30, -25, 5] },
            subheader: { fontSize: 12, bold: true, alignment: 'right', margin: [0, 0, -25, 5] },
            subheader2: { fontSize: 10, bold: true, alignment: 'right', margin: [0, 0, -25, 8] },
            headerCell: { fontSize: 10, bold: true, alignment: 'center', fillColor: '#C9D6ED'},
            headerCellC: { fontSize: 12, bold: true, alignment: 'Left', fillColor: '#C9D6ED'},
            tabla: { borderColor: '#bfbfbf', margin: [-32, 5, 0, 6], },
            tablaDato: { borderColor: '#bfbfbf', margin: [-32, 10, 0, 5], },
            prof: { fontSize: 9, margin: [25, 10, 0, 5], },
            reg: { fontSize: 9, margin: [220, 10, 0, 5], },
            fecha: { fontSize: 9, margin: [415, 10, 0, 5], },
            cell: { fontSize: 9},
            row1: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row2: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row3: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            row4: { fontSize: 10, alignment: 'left', fillColor: '#E9F1FD',bold: true },
            subheader3: { fontSize: 9, alignment: 'left', margin: [-32, 0, 0, 0], },
            footerT: { fontSize: 9, alignment: 'right', margin: [0, 0, 20, 0] }
        },
    };

    pdfMake.createPdf(docDefinition).download(fileActa);
}
