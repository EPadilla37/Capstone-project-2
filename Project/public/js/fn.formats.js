const formatString = {
  formatCurrency(amount, currency) {
    if (currency === "MXN") {
      return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " MXN";
    } else if (currency === "USD") {
      return (
        "$" + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " USD"
      );
    } else {
      //Default - MXN format
      return amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,") + " MXN";
    }
  },

  convertMinutesToHours(minutes) {
    if (minutes < 0) {
      return "El valor de entrada debe ser un número positivo.";
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 1) {
      if (remainingMinutes === 1) {
        return `${hours} hora y ${remainingMinutes} minuto`;
      } else {
        return `${hours} hora${remainingMinutes > 0 ? "s" : ""} ${
          remainingMinutes > 0 ? `y ${remainingMinutes} minutos` : ""
        }`;
      }
    } else if (hours > 1) {
      if (remainingMinutes === 1) {
        return `${hours} horas y ${remainingMinutes} minuto`;
      } else {
        return `${hours} hora${remainingMinutes > 0 ? "s" : ""} ${
          remainingMinutes > 0 ? `y ${remainingMinutes} minutos` : ""
        }`;
      }
    } else {
      return `${minutes} minutos`;
    }
  },

  convertAMPM(horaMilitar) {
    const [horas, minutos] = horaMilitar.split(":");
    const horasNum = parseInt(horas);
    const periodo = horasNum >= 12 ? "PM" : "AM";
    let horas12 = horasNum % 12;
    horas12 = horas12 === 0 ? 12 : horas12;
    return `${horas12}:${minutos} ${periodo}`;
  },

  fullDayNameFormat(selDate, format = "defualt") {
    var moths = new Array(
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic"
    );
    var mothName = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    var days = new Array(
      "Domingo",
      "Lunes",
      "Martes",
      "Miercoles",
      "Jueves",
      "Viernes",
      "Sabado"
    );
    var date = new Date(selDate + "T00:00:00");
    var dName = days[date.getDay()];
    if (format == "defualt")
      result = dName + " " + date.getDate() + " " + moths[date.getMonth()];
    if (format == "confirm")
      result =
        dName +
        " " +
        date.getDate() +
        " " +
        mothName[date.getMonth()] +
        ", " +
        date.getFullYear();
    return result;
  },

  formatTime12Hrs(time) {
    const d = new Date(time),
      hours = d.getHours(),
      minutes = this.formatTime(d.getMinutes()),
      seconds = this.formatTime(d.getSeconds()),
      fixHours = this.formatTime(((hours + 11) % 12) + 1),
      format = hours < 12 || hours == 24 ? "AM" : "PM";

    return fixHours + ":" + minutes + " " + format;
  },

  formatTime: function (hr) {
    return hr < 10 ? "0" + hr : hr;
  },
};
