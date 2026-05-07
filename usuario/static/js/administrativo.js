function imagenes(input, img) {
  const idimagen = document.getElementById(img);
  const inputFile = document.getElementById(input);
  const file = inputFile.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      idimagen.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    idimagen.src = "#";
  }
}

function guadarImagenNoticia(event) {
  event.preventDefault();
  var data = new FormData();
  var imagen = document.getElementById("floatingFile");
  const check = document.querySelectorAll('input[name="inlineRadioOptions"]');
  let valorSeleccionado;
  let checkE = false;
  let checkP = false;
  let checkD = false;
  if (check[0].checked && check[1].checked) {
    valorSeleccionado = "Ambos";
    checkE = true;
    checkP = true;
  } else if (check[0].checked) {
    valorSeleccionado = "Estudiante";
    checkE = true;
  } else if (check[1].checked) {
    valorSeleccionado = "Profesor";
    checkP = true;
  } else if (check[2].checked) {
    valorSeleccionado = "Destacada";
    checkD = true;
  }
  var imagenFile = imagen.files[0];
  if (imagenFile) {
    data.append("imagen", imagenFile);
  }
  data.append("fechaI", document.getElementById("fechaI").value);
  data.append("horaI", document.getElementById("horaI").value);
  data.append("fechaF", document.getElementById("fechaF").value);
  data.append("horaF", document.getElementById("horaF").value);
  data.append("tipo", valorSeleccionado);
  data.append("tipoE", checkE);
  data.append("tipoP", checkP);
  data.append("tipoD", checkD);

  var xhr = new XMLHttpRequest();
  var url = "/guardarImagen/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        const idimagen = document.getElementById("imgNoticas");
        idimagen.src = "";
        showToast("Se guardo la imagen", "success");
        $("#modal_anadirImagenesM").modal("hide");
        location.reload();
      } else {
        const idimagen = document.getElementById("imgNoticas");
        idimagen.src = "";
        showToast("Hubo un error al guardar la imagen", "error");
        $("#modal_anadirImagenesM").modal("hide");
      }
    }
  };
  xhr.send(data);
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

function showToast(message, type) {
  var toastElement = document.getElementById("liveToast");
  var toastBody = toastElement.querySelector(".textoBody");
  var toastCloseButton = toastElement.querySelector(".btn-close");
  var toastHeaderImg = toastElement.querySelector("#img_check");

  if (type === "error") {
    toastElement.classList.add("bg-danger");
    toastBody.innerText = message;
    toastHeaderImg.src = "../../../../static/img/error.png";
  } else {
    toastElement.classList.remove("bg-danger");
    toastBody.innerText = message;
    toastHeaderImg.src = "../../../../static/img/check.png";
  }
  toastCloseButton.addEventListener("click", function () {
    var bootstrapToast = bootstrap.Toast.getInstance(toastElement);
    bootstrapToast.hide();
  });
  var bootstrapToast = new bootstrap.Toast(toastElement, { delay: 3000 });
  bootstrapToast.show();
}

function deleteImageNoticia(id) {
  var data = new FormData();
  data.append("id", id);

  var xhr = new XMLHttpRequest();
  var url = "/eliminarImageNoticia/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.success) {
        showToast("Se borro la imagen", "success");
        location.reload();
      } else {
        showToast("Hubo un error al borrar la imagen", "error");
      }
    }
  };
  xhr.send(data);
}

function dataModal(id) {
  var xhr = new XMLHttpRequest();
  var url = "/buscarImageNoticia/?id=" + encodeURIComponent(id);
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var fotoNoticia = response.fotoNoticia;
      var id = document.getElementById("idM");
      var imagenN = document.getElementById("imgNoticasM");
      var fechaI = document.getElementById("fechaIA");
      var horaI = document.getElementById("horaIA");
      var fechaF = document.getElementById("fechaFA");
      var horaF = document.getElementById("horaFA");
      var est = document.getElementById("inlineRadio1M");
      var prof = document.getElementById("inlineRadio2M");
      var des = document.getElementById("inlineRadio3M");
      fotoNoticia.forEach(function (imagen) {
        id.value = imagen.id;
        imagenN.src = "data:image/png;base64," + imagen.imagen;
        imagenN.alt = imagen.imagen_nombre;
        fechaI.value = setDate(imagen.fecha_inicio);
        fechaF.value = setDate(imagen.fecha_fin);
        horaI.value = imagen.hora_inicio;
        horaF.value = imagen.hora_fin;
        est.checked = imagen.estudiante;
        prof.checked = imagen.profesor;
        des.checked = imagen.destacada;
      });
    }
  };
  xhr.send();
}

function actualizarImagenNoticia(event) {
  event.preventDefault();
  var data = new FormData();
  var id = document.getElementById("idM");
  var imagen = document.getElementById("floatingFileM");
  const checks = document.querySelectorAll('input[name="inlineRadioOptionsM"]');
  let valorSeleccionado;
  let checkE = false;
  let checkP = false;
  let checkD = false;
  data.append("id", id.value);
  if (checks[0].checked && checks[1].checked) {
    valorSeleccionado = "Ambos";
    checkE = true;
    checkP = true;
    checkD = checks[2].checked;
} else if (checks[0].checked) {
    valorSeleccionado = "Estudiante";
    checkE = true;
    checkD = checks[2].checked;
} else if (checks[1].checked) {
    valorSeleccionado = "Profesor";
    checkP = true;
    checkD = checks[2].checked;
} else if (checks[2].checked) {
    checkD = checks[2].checked;;
}
  var imagenFile = imagen.files[0];
  if (imagenFile) {
    data.append("imagen", imagenFile);
  }
  data.append("fechaI", document.getElementById("fechaIA").value);
  data.append("horaI", document.getElementById("horaIA").value);
  data.append("fechaF", document.getElementById("fechaFA").value);
  data.append("horaF", document.getElementById("horaFA").value);
  data.append("tipo", valorSeleccionado);
  data.append("tipoE", checkE);
  data.append("tipoP", checkP);
  data.append("tipoD", checkD);

  var xhr = new XMLHttpRequest();
  var url = "/actualizarImageNoticia/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
      showToast("Se guardo la imagen", "success");
      $("#modal_actualizarNoticiaI").modal("hide");
      location.reload();
    } else {
      $("#modal_actualizarNoticiaI").modal("hide");
      showToast("Hubo un error al guardar la imagen", "error");
    }
  };
  xhr.send(data);
}

function saveNoticia(event) {
  event.preventDefault();
  var data = new FormData();
  var imagen = document.getElementById("floatingFileT");
  var titulo = document.getElementById("tituloN");
  var descripcion = document.getElementById("descripN");
  const check = document.querySelectorAll('input[name="inlineRadioOptionsT"]');
  let valorSeleccionado;
  let checkE = false;
  let checkP = false;
  if (check[0].checked && check[1].checked) {
    valorSeleccionado = "Ambos";
    checkE = true;
    checkP = true;
  } else if (check[0].checked) {
    valorSeleccionado = "Estudiante";
    checkE = true;
  } else if (check[1].checked) {
    valorSeleccionado = "Profesor";
    checkP = true;
  }
  var imagenFile = imagen.files[0];
  if (imagenFile) {
    data.append("imagen", imagenFile);
  }
  data.append("titulo", titulo.value);
  data.append("descripcion", descripcion.value);
  data.append("fechaI", document.getElementById("fechaIN").value);
  data.append("horaI", document.getElementById("horaIN").value);
  data.append("fechaF", document.getElementById("fechaFN").value);
  data.append("horaF", document.getElementById("horaFN").value);
  data.append("tipo", valorSeleccionado);
  data.append("tipoE", checkE);
  data.append("tipoP", checkP);

  var xhr = new XMLHttpRequest();
  var url = "/guardarNoticia/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        showToast("Se guardo la imagen", "success");
        // updateImageSection('noticia');

        $("#modal_actualizarNoticiaT").modal("hide");
        location.reload();
      } else {
        const idimagen = document.getElementById("imgNoticas");
        idimagen.src = "";
        showToast("Hubo un error al guardar la imagen", "error");
        $("#modal_actualizarNoticiaI").modal("hide");
      }
    }
  };
  xhr.send(data);
}

function noticiaModal(id) {
  var xhr = new XMLHttpRequest();
  var url = "/buscarNoticia/?id=" + encodeURIComponent(id);
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var noticia = response.Noticias;
      var id = document.getElementById("idNA");
      var imagen = document.getElementById("imgNoticasTA");
      var titulo = document.getElementById("tituloNA");
      var descripcion = document.getElementById("descripNA");
      var fechaI = document.getElementById("fechaINA");
      var horaI = document.getElementById("horaINA");
      var fechaF = document.getElementById("fechaFNA");
      var horaF = document.getElementById("horaFNA");
      var est = document.getElementById("inlineRadio1TA");
      var prof = document.getElementById("inlineRadio2TA");
      noticia.forEach(function (noticia) {
        id.value = noticia.id;
        imagen.src = "data:image/png;base64," + noticia.imagen;
        titulo.value = noticia.titulo;
        descripcion.value = noticia.descripcion;
        fechaI.value = noticia.fecha_inicio;
        fechaF.value = noticia.fecha_fin;
        horaI.value = noticia.hora_inicio;
        horaF.value = noticia.hora_fin;
        imagen.alt = noticia.imagen_nombre;
        est.checked = noticia.estudiante;
        prof.checked = noticia.profesor;
      });
    }
  };
  xhr.send();
}

function deleteNoticia(id) {
  var data = new FormData();
  data.append("id", id);

  var xhr = new XMLHttpRequest();
  var url = "/eliminarNoticia/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      if (response.success) {
        showToast("Se borro la noticia", "success");
        location.reload();
      } else {
        showToast("Hubo un error al borrar la noticia", "error");
      }
    }
  };
  xhr.send(data);
}

function actualizarNoticia(event) {
  event.preventDefault();
  var data = new FormData();
  var id = document.getElementById("idNA");
  var imagen = document.getElementById("floatingFileTA");
  var titulo = document.getElementById("tituloNA");
  var descripcion = document.getElementById("descripNA");
  const check = document.querySelectorAll('input[name="inlineRadioOptionsTA"]');
  let valorSeleccionado;
  let checkE = false;
  let checkP = false;
  data.append("id", id.value);
  if (check[0].checked && check[1].checked) {
    valorSeleccionado = "Ambos";
    checkE = true;
    checkP = true;
  } else if (check[0].checked) {
    valorSeleccionado = "Estudiante";
    checkE = true;
  } else if (check[1].checked) {
    valorSeleccionado = "Profesor";
    checkP = true;
  }
  var imagenFile = imagen.files[0];
  if (imagenFile) {
    data.append("imagen", imagenFile);
  }
  data.append("titulo", titulo.value);
  data.append("descripcion", descripcion.value);
  data.append("fechaI", document.getElementById("fechaINA").value);
  data.append("horaI", document.getElementById("horaINA").value);
  data.append("fechaF", document.getElementById("fechaFNA").value);
  data.append("horaF", document.getElementById("horaFNA").value);
  data.append("tipo", valorSeleccionado);
  data.append("tipoE", checkE);
  data.append("tipoP", checkP);

  var xhr = new XMLHttpRequest();
  var url = "/actualizarNoticia/";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("X-CSRFToken", getCSRFToken());

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        console.log(response);
        showToast("Se actualizó la noticia", "success");
        $("#modal_actualizarNoticiaTA").modal("hide");
        location.reload();
      } else {
        const idimagen = document.getElementById("imgNoticas");
        idimagen.src = "";
        showToast("Hubo un error al actualiza la noticia", "error");
        $("#modal_actualizarNoticiaTA").modal("hide");
      }
    }
  };
  xhr.send(data);
}

function setDelete(id, tipo) {
  var texto = document.getElementById("textoModalD");
  var boton = document.getElementById("eliminarFN");
  if (tipo === "foto") {
    texto.innerText =
      "¿Realmente quieres borrar la imagen? Este proceso no se puede deshacer.";
    boton.onclick = function () {
      deleteImageNoticia(id);
    };
  } else {
    texto.innerText =
      "¿Realmente quieres borrar la noticia? Este proceso no se puede deshacer.";
    deleteNoticia(id);
  }
}

function setDate(fecha) {
  var partesFecha = fecha.split("-");
  var year = partesFecha[0];
  var month = partesFecha[1];
  var day = partesFecha[2];
  var fechaFormateada = year + "-" + month + "-" + day;
  return fechaFormateada;
}

function mostrarFiltro() {
  var inputs = document.querySelectorAll("input");
  inputs.forEach(function (input) {
    if (input.disabled == true) {
      input.disabled = false;
      input.value = "";
    } else {
      input.disabled = true;
    }
  });
  filtrar();
}

function filtrar() {
  var inputs = document.querySelectorAll("input");
  var filters = [];
  inputs.forEach(function (input) {
    if (!input.disabled) {
      var column = input.getAttribute("id");
      var filterValue = input.value.toUpperCase();
      filters.push({ column: column, filterValue: filterValue });
    }
  });

  var table = document.getElementById("tablaU");
  var tr = table.getElementsByTagName("tr");
  Array.from(tr).forEach(function (row) {
    var shouldDisplay = true;
    filters.forEach(function (filter) {
      var column = filter.column;
      var filterValue = filter.filterValue;
      var td = row.querySelector(
        "td:nth-child(" + (columnIndex(column) + 1) + ")"
      );
      if (td) {
        var txtValue = td.innerText;
        if (txtValue.toUpperCase().indexOf(filterValue) === -1) {
          shouldDisplay = false;
        }
      }
    });
    if (shouldDisplay) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function columnIndex(columnName) {
  var headers = document.querySelectorAll("#tablaU thead th");
  for (var i = 0; i < headers.length; i++) {
    if (headers[i].querySelector("input").getAttribute("id") === columnName) {
      return i;
    }
  }
  return -1;
}
var totalCurso;
var cursoAprovados;
var totalCreditos;
var creditosAprovados;
function getCursos() {
  const type = document.getElementById("typeE");
  const id = document.getElementById("idE");
  const status = document.getElementById("StatusE");
  totalCurso = 0;
  cursoAprovados = 0;
  totalCreditos = 0;
  creditosAprovados = 0;
  var plan = document.getElementById("carrera").value;
  const url = `/Estudiante/plan/carrera/?plan=` + encodeURIComponent(plan);
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr.onload = function () {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      actualizarEstado(data);
      var lineBar = new ProgressBar.Line("#line-container", {
        trailWidth: 0.5,
        from: { color: "#FF9900" },
        to: { color: "#00FF99" },
        text: {
          value: "0",
          className: "progress-text",
          style: {
            color: "black",
            position: "absolute",
            top: "50%",
            left: "50%",
            padding: 0,
            margin: 0,
            transform: "translate(-50%, -50%)",
          },
        },
        step: (state, shape) => {
          shape.path.setAttribute("stroke", state.color);
          shape.setText(Math.round(shape.value() * 100) + " %");
        },
      });

      var porcentajeAprobados = (creditosAprovados / totalCreditos) * 100;
      var procentaje = porcentajeAprobados / 100;
      lineBar.animate(procentaje, {
        duration: 2000,
      });
      actualizarTabla(data);
    }
  };
  xhr.send();
}

function actualizarEstado(data) {
  data.forEach((cuatrimestreObj) => {
    totalCurso = cuatrimestreObj.data.totalCursos;
    totalCreditos = cuatrimestreObj.data.totalCreditos;
    cursoAprovados = cuatrimestreObj.data.cursosAprobados;
    creditosAprovados = cuatrimestreObj.data.creditosAprobados;
  });
  var select = document.getElementById("carrera");
  var estadoDiv = document.querySelector(".estado");
  estadoDiv.innerHTML = "";

  var divRowPlan = document.createElement("div");
  divRowPlan.className = "row";
  var divInfo = document.createElement("div");
  divInfo.className = "col-12 col-md-12";

  var fieldset = document.createElement("fieldset");
  fieldset.className = "border p-2 mb-2";
  var legend = document.createElement("legend");
  legend.className = "float-none w-auto ";
  legend.innerText = select.value;
  fieldset.appendChild(legend);

  var divRowInfo = document.createElement("div");
  divRowInfo.className = "row";

  var divRowInfoCu = document.createElement("div");
  divRowInfoCu.className = "row";

  var divRowInfoCr = document.createElement("div");
  divRowInfoCr.className = "row";

  var divRowProceso = document.createElement("div");
  divRowProceso.className = "row";

  var divGrado = document.createElement("div");
  divGrado.className = "col-6 col-md-4";
  var pGrado = document.createElement("h6");
  pGrado.textContent = "Grado: " + data[0].data.grado;

  var divEnfasis = document.createElement("div");
  divEnfasis.className = "col-6 col-md-4";
  var pEnfasis = document.createElement("h6");
  pEnfasis.textContent = "Enfasis: " + data[0].data.enfasis;

  divGrado.appendChild(pGrado);
  divEnfasis.appendChild(pEnfasis);
  divRowInfo.appendChild(divGrado);
  divRowInfo.appendChild(divEnfasis);

  var divCursoT = document.createElement("div");
  divCursoT.className = "col-6 col-md-4";
  var pCursoT = document.createElement("h6");
  pCursoT.textContent = "Total de Curso: " + totalCurso;

  var divCursoA = document.createElement("div");
  divCursoA.className = "col-6 col-md-4";
  var pCursoA = document.createElement("h6");
  pCursoA.textContent = "Cursos Aprobados: " + cursoAprovados;

  divCursoT.appendChild(pCursoT);
  divCursoA.appendChild(pCursoA);
  divRowInfoCu.appendChild(divCursoT);
  divRowInfoCu.appendChild(divCursoA);

  var divCreditoT = document.createElement("div");
  divCreditoT.className = "col-6 col-md-4";
  var pCreditoT = document.createElement("h6");
  pCreditoT.textContent = "Total de Créditos: " + totalCreditos;

  var divCreditoA = document.createElement("div");
  divCreditoA.className = "col-6 col-md-4";
  var pCreditoA = document.createElement("h6");
  pCreditoA.textContent = "Créditos Aprobados: " + creditosAprovados;

  divCreditoT.appendChild(pCreditoT);
  divCreditoA.appendChild(pCreditoA);
  divRowInfoCr.appendChild(divCreditoT);
  divRowInfoCr.appendChild(divCreditoA);

  var divproceso = document.createElement("div");
  divproceso.className = "col-md-12";
  var pProceso = document.createElement("h6");
  pProceso.textContent = "Total Completado";
  var divEstado = document.createElement("div");
  divEstado.id = "line-container";

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
        const cursosAprobados = data[0].data.cursosAprobadosCodigos;
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
            thAp.className = 'd-none d-sm-table-cell';
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
                    td_apro.className = 'd-none d-sm-table-cell';
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
                    } else if (items.requisitos === '' || items.requisitos.split(',').every(requisito => cursosAprobados.includes(requisito))) {
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
}

function mostrarTabla(index) {
  const div = document.getElementById(index);
  if (div.style.display !== "none") {
    div.style.display = "none";
  } else {
    div.style.display = "";
  }
}

function cambiarColor(id, id2) {
  var nuevoColorU2 = document.getElementById(id).value;
  var atributo = document.getElementById(id2).value;
  document.documentElement.style.setProperty("--color-U-7", nuevoColorU2);
  var xhr = new XMLHttpRequest();
  var url =
    "/cambiarColor/?color=" +
    encodeURIComponent(nuevoColorU2) +
    "&atributo=" +
    encodeURIComponent(atributo);
  xhr.open("GET", url, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      console.log(response);
    }
  };
  xhr.send();
}

function actODesc() {
  const checkboxes = document.querySelectorAll(".usuario-checkbox");
  
  checkboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function (event) {
        const email = event.target.getAttribute("data-email");
        const active = event.target.checked;
        console.log(email);
        console.log(active);
        enviarActODesc(email,active);
    });
  });
 
}

function enviarActODesc(email,active){
    var data = new FormData();
    var xhr = new XMLHttpRequest();
    var url = "/actODesc/";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("X-CSRFToken", getCSRFToken());
    data.append("email", email);
    data.append("active", active);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {

        }
      }
    };
    xhr.send(data);
}