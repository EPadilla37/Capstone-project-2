const alertsBS = {};

alertsBS.createAlert = (statusType, title, message, autoClose = true) => {
  const idRandom = `alert-${statusType}-` + Math.floor(Math.random() * 9999);
  const closeClass = autoClose ? "autoClose" : "manualClose";
  const html = `<div id="${idRandom}" class="alert alert-${statusType} alert-dismissible ${closeClass} fade show d-flex align-items-center alert_bs" role="alert" data-type="${statusType}">
            <div class="d-flex justify-content-end">
              <i class="fa ${getIcon(statusType)}"></i>
            </div>
            <div class="mx-3 alert-message">
                <strong>${title}</strong>
                <br>${message}
            </div>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
  return html;
};

function getIcon(type) {
  switch (type) {
    case "success":
      return "fa-check-circle";
    case "info":
      return "fa-info-circle";
    case "warning":
      return "fa-exclamation-triangle";
    case "danger":
      return "fa-times-circle";
  }
}

export { alertsBS };
