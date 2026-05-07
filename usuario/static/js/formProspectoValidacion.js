var doc1 = 0;
var doc2 = 0;
var doc3 = 0;
var doc4 = 0;
var doc5 = 0;
var doc6 = 0;
var doc7 = 0;

const alertPlaceholder = document.getElementById("liveAlertPlaceholder");
const alert = (message, type) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert" id="alertInfo">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    "</div>",
  ].join("");

  alertPlaceholder.append(wrapper);
  setTimeout(() => {
    document.getElementById('alertInfo').remove();
}, 10000);
};

function validateFile(inputSelector, allowedExtensions, errorMessage) {
    $(inputSelector).on('change', function () {
        const fullPath = $(this).val();
        const fileName = fullPath.replace(/^.*[\\\/]/, '');
        const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
        const fileExtension = fileName.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            const message = 'El documento ' + fileNameWithoutExtension + errorMessage;
            alert(message, 'warning');
            $(this).val('');
        }
    });
}

validateFile('#titulobachillerto, #titulouniversitario, #cedulafotografia, #titulouniversitarioPI, #certificacionnotas', ['pdf'], ' no es tipo PDF. Por favor cambiarlo.');
validateFile('#fotoperfil', ['jpg', 'jpeg', 'png', 'heic', 'heif', 'raw'], ' no posee el formato permitido, solo se permite tipo: .jpg, .jpeg, .png, .heic, .heif, .raw. Por favor cambiarlo.');


function verificarInputFile(input_name, input_id) {
  var inputArchivo = document.getElementById(input_id);
  var archivo = inputArchivo.files[0];

  if (input_id === "titulobachillerto") {
    doc1 = parseInt(archivo.size);
  }

  if (input_id === "titulouniversitario") {
    doc2 = parseInt(archivo.size);
  }

  if (input_id === "fotoperfil") {
    doc3 = parseInt(archivo.size);
  }

  if (input_id === "cedulafotografia") {
    doc4 = parseInt(archivo.size);
  }

  if (input_id === "titulouniversitarioPI") {
    doc5 = parseInt(archivo.size);
  }

  if (input_id === "certificacionnotas") {
    doc6 = parseInt(archivo.size);
  }

  if (input_id === "planestudio") {
    doc7 = parseInt(archivo.size);
  }

  var maxSizeIndividual = 76800000;
  var btnCarga = document.getElementById("btnModal");

  if (archivo.size > maxSizeIndividual) {
    alert(
      "El documento " +
        input_name +
        " cargado es muy pesado! Por favor, cambiar el tamaño del documento.",
      "warning"
    );
    setTimeout(() => {
      document.getElementById("alertInfo").remove();
    }, 10000);
    btnCarga.disabled = true;
  } else {
    btnCarga.disabled = false;
  }
}

document
  .getElementById("formProspecto")
  .addEventListener("submit", function (event) {
    if (verificacionSizeGroup()) {
      console.log("Exito");
    } else {
      alert(
        "Los documentos cargados son muy pesados! Por favor, cambiar el tamaño de tus documentos.",
        "warning"
      );
      setTimeout(() => {
        document.getElementById("alertInfo").remove();
      }, 10000);
      event.preventDefault();
    }
  });

function verificacionSizeGroup() {
  var btnCarga = document.getElementById("btnModal");
  var maxSizeGroup = 460800000;
  var docMaxSize = doc1 + doc2 + doc3 + doc4 + doc5 + doc6 + doc7;
  if (docMaxSize > maxSizeGroup) {
    btnCarga.disabled = true;
    return false;
  } else {
    btnCarga.disabled = false;
    return true;
  }
}

async function fileVerification(file) {
  const terminations = ["jpg", "jpeg", "png", "heic", "heif", "raw", "pdf"];
  var status = [true];

  var getFileTermination = (fileName) => fileName.split(".")[1].toLowerCase();

  try {
    // Intenta cargar el archivo como un archivo ZIP
    var zip = new JSZip();
    var zipData = await new Response(file).arrayBuffer();
    var zipContents = await zip.loadAsync(zipData);

    // Itera sobre los archivos en el ZIP
    zipContents.forEach((relativePath, file) => {
      var fileName = file.name;
      var fileTermination = getFileTermination(fileName);

      if (!terminations.includes(fileTermination)) {
        status[0] = false;
        status.push(fileName);
        alert(
          "El documento " +
            fileName +
            " dentro del archivo comprimido no posee el formato permitido. Por favor cambiarlo.",
          "warning"
        );
        setTimeout(() => {
          document.getElementById("alertInfo").remove();
        }, 10000);
      }
    });
  } catch (zipError) {
    status[0] = false;
    status.push("Error al cargar el archivo.");
    alert("Error al cargar el archivo.", "danger");
    setTimeout(() => {
      document.getElementById("alertInfo").remove();
    }, 10000);
  }
  return status;
}

// var inputFile = document.getElementById('planestudio');

// inputFile.addEventListener('change', async (event) => {
//     var files = event.target.files;
//     if (files.length > 0) {
//         var file = files[0];
//         var verificationStatus = await fileVerification(file);
//         var btnCarga = document.getElementById('btnModal');
//         if (verificationStatus[0]) {
//             btnCarga.disabled = false;
//         } else {
//             btnCarga.disabled = true;
//         }
//     } else {
//         var btnCarga = document.getElementById('btnModal');
//         btnCarga.disabled = true;
//     }
// });