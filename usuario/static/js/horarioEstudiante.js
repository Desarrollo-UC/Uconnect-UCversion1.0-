function getPeriodo() {
    var selectedPeriodo = document.getElementById('periodos').value;
    const url = '/getHorarios/?periodo=' + encodeURIComponent(selectedPeriodo);
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.onload = function () {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            populateSchedule(data);
        }
    };
    xhr.send();
}

function populateSchedule(data) {
    var bodyHorarioEstudiante = document.getElementById("bodyHorarioEstudiante");
    bodyHorarioEstudiante.innerHTML = '';
    // Objeto para agrupar cursos por hora de inicio
    var cursosPorHora = {};

    for (var type in data) {
        if (data.hasOwnProperty(type)) {
            data[type].forEach(function (horario) {
                // Verificar si la hora de inicio ya existe en el objeto
                if (!cursosPorHora[horario.horaInicio]) {
                    cursosPorHora[horario.horaInicio] = [];
                }

                cursosPorHora[horario.horaInicio].push(horario);
            });
        }
    }

    // Obtener las horas ordenadas de menor a mayor
    var horasOrdenadas = Object.keys(cursosPorHora).sort(function (a, b) {
        return parseInt(a) - parseInt(b);
    });

    // Recorrer el objeto agrupado y agregar las filas al cuerpo de la tabla
    horasOrdenadas.forEach(function (horaInicio) {
        var row = document.createElement("tr");

        var horaCell = document.createElement("td");
        horaCell.textContent = horaInicio + ":00";
        row.appendChild(horaCell);

        var cursosEnHora = cursosPorHora[horaInicio];
        var dias = ["L", "K", "M", "J", "V", "S"];
        dias.forEach(function (dia) {
            var diaCell = document.createElement("td");
            var cursosEnDia = cursosEnHora.filter(function (curso) {
                return curso.dia === dia;
            });

            if (cursosEnDia.length > 0) {
                cursosEnDia.forEach(function (curso) {
                    var divCursoInfo = document.createElement("div");
                    divCursoInfo.className="divCursoInfo";
                    divCursoInfo.style.backgroundColor = "#10CFC9";
                    divCursoInfo.style.borderRadius = "25px";
                    divCursoInfo.style.padding = "5px";
                    divCursoInfo.style.cursor = "pointer";
                    var cursoSpan = document.createElement("span");
                    cursoSpan.className = "curso fw-bold";
                    cursoSpan.textContent = curso.curso_id;

                    var colorTextDiv = document.createElement("div");
                    colorTextDiv.className = "colorText fw-bold";
                    colorTextDiv.textContent = curso.horaInicio + " - " + curso.horaFin;
                    divCursoInfo.appendChild(cursoSpan);
                    divCursoInfo.appendChild(colorTextDiv);
                    diaCell.appendChild(divCursoInfo);

                    divCursoInfo.addEventListener("click", function () {
                        showCourseModal(curso);
                    });
     
                });
            } else {
                diaCell.textContent = "-";
            }

            row.appendChild(diaCell);
        });

        bodyHorarioEstudiante.appendChild(row);
    })
}

function showCourseModal(curso) {
    // Obtén una referencia al modal
    var modal = document.querySelector('.modal.horario');
    var modalBody = modal.querySelector('.modal-body');
    modalBody.innerHTML = `<div class="text-center">
        <span style="font-weight: bold; color:#01406d">Curso: </span><span>${curso.curso_id}</span><br>
        <span style="font-weight: bold; color:#01406d">Día: </span><span>${curso.dia}</span><br>
        <span style="font-weight: bold; color:#01406d">Grupo: </span><span>${curso.grupo}</span><br>
        <span style="font-weight: bold; color:#01406d">Profesor: </span><span>${curso.docente_id}</span><br>
        <span style="font-weight: bold; color:#01406d">Aula: </span><span>${curso.aula_id}</span><br>
        <span style="font-weight: bold; color:#01406d">Horario: </span><span>${curso.horaInicio}:${curso.minutoInicio} - ${curso.horaFin}:${curso.minutoFin}</span>
        </div>
    `;
    $('#exampleModal').modal('show');
}