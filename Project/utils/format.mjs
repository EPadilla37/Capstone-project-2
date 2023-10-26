const formatString = {
  formatCurrency(amount, currency = "MXN") {
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
        return `${hours} hora y ${remainingMinutes} minutos`;
      }
    } else if (hours > 1) {
      if (remainingMinutes === 1) {
        return `${hours} horas y ${remainingMinutes} minuto`;
      } else {
        return `${hours} horas y ${remainingMinutes} minutos`;
      }
    } else {
      return `${minutes} minutos`;
    }
  },
};

export { formatString };
