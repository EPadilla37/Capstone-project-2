document.addEventListener("DOMContentLoaded", function () {
  const copyButtons = document.querySelectorAll(".table-action.edit");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      const id = this.getAttribute("data-id");
      copyToClipboard(id);
    });
  });
});

function copyToClipboard(idInput) {
  console.log("inside copytoclipboard");
  var url = document.getElementById("link" + idInput).getAttribute("href");

  var tempInput = document.createElement("input");
  document.body.appendChild(tempInput);
  tempInput.value = url;
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);

  showAlert(
    "primary",
    "<big>Excelente!!</big> Enlace copiado correctamente!! </big><br>El enlace se ha copiado en el portapapeles.<br>",
    "nc-notification-70",
    1000
  );
}

function showAlert(type, message, iconClass, duration) {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
  alertDiv.innerHTML = `
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="d-flex align-items-center">
            <i class="fa ${iconClass} mr-2"></i>
            ${message}
        </div>
        `;

  document.body.appendChild(alertDiv);

  setTimeout(function () {
    alertDiv.remove();
  }, duration);
}
