function change() {
  var selectValue = document.getElementById("tipo");
  var input = document.getElementById("identificacion");
  var telefono = document.getElementById("telefono");
  telefono.oninput = function () {
    this.value = this.value.replace(/[^0-9]/g, "");
  };
  if (selectValue.value === "Cédula") {
    input.oninput = function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    };
    input.value = "";
    input.removeAttribute("disabled");
    input.setAttribute("minLength", "9");
    input.setAttribute("maxLength", "9");
  } else if (selectValue.value === "Dimex") {
    input.oninput = function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    };
    input.value = "";
    input.removeAttribute("disabled");
    input.setAttribute("minLength", "11");
    input.setAttribute("maxLength", "12");
  } else if (selectValue.value === "Pasaporte") {
    input.oninput = null;
    input.value = "";
    input.removeAttribute("disabled");
    input.setAttribute("minLength", "9");
    input.setAttribute("maxLength", "20");
  } else if (selectValue.value === "Refugiado") {
    input.oninput = function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    };
    input.value = "";
    input.removeAttribute("disabled");
    input.setAttribute("minLength", "12");
    input.setAttribute("maxLength", "12");
  } else if (selectValue.value === "Permiso") {
    input.oninput = null;
    input.value = "";
    input.removeAttribute("disabled");
  } else if (selectValue.value === "Cédula Residente") {
    input.oninput = function () {
      this.value = this.value.replace(/[^0-9]/g, "");
    };
    input.value = "";
    input.removeAttribute("disabled");
    input.setAttribute("minLength", "12");
    input.setAttribute("maxLength", "12");
  }
}

$(document).ready(function () {
  $('#exampleModalCenter').modal('show');
  $("#tipo").change(function () {
    $("#nombre").val("");
    $("#primerapellido").val("");
    $("#segundoapellido").val("");
    $("#telefono").val("");
    $("#fechanacimiento").val("");
    $("#correo").val("");
    $("#password1").val("");
    $("#password2").val("");
  });

  $("#identificacion").on("keydown", (e) => {
    if (e.which === 8) {
      var nombre = document.getElementById("nombre");
      var primer = document.getElementById("primerapellido");
      var segundo = document.getElementById("segundoapellido");
      nombre.value = "";
      nombre.removeAttribute("readonly");
      primer.value = "";
      primer.removeAttribute("readonly");
      segundo.value = "";
      segundo.removeAttribute("readonly");
    }
  });
  $('.select2').select2({
    width: "100%", // Ancho del dropdown
  });
  setTimeout(function() {
    var alert = document.querySelector('.alert');
    if (alert) {
      alert.style.display = 'none';
    }
  }, 1000);
});