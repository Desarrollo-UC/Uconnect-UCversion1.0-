window.onload = function () {
  var inputValue = document.getElementById("amount").value;
  inputValue = inputValue.replace(",", ".");

  if (inputValue.indexOf(".") === -1) {
      inputValue += ".00";
  } else if (inputValue.split(".")[1].length === 1) {
      inputValue += "0";
  }
  document.getElementById("amount").value = inputValue;
};

function time(){
    var time = document.getElementById("time");
    var url = "/obtener-time/";

    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
      if (request.status === 200) {
        time.value = JSON.parse(request.responseText);
      }
    };
    request.send();
}

function keyID(){
  var key = document.getElementById("key_id");
  var url = "/obtener-key/";

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {
    if (request.status === 200) {
      key.value = JSON.parse(request.responseText);
    }
  };
  request.send();
}

function hashEntrada(){
  var hash = document.getElementById("hash");
  var url = "/hash-entrada/";

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {
    if (request.status === 200) {
      hash.value = JSON.parse(request.responseText);
    }
  };
  request.send();
}