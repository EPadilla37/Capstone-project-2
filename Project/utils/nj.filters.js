const filtros = {
  formatoMoneda: function (numero, locale = "es-MX", moneda = "MXN") {
    try {
      if (isNaN(numero)) {
        throw new Error("Número no válido");
      }
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: moneda,
      }).format(numero);
    } catch (error) {
      console.error('Error en el filtro "formatoMoneda":', error.message);
      return "Número inválido";
    }
  },

  formatoFecha: function (dateString, time = false) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Fecha no válida");
      }

      let options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      if (time) {
        options = {
          ...options,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZoneName: "short",
        };
      }

      return date.toLocaleDateString("es-ES", options);
    } catch (error) {
      console.error('Error en el filtro "formatoFecha":', error.message);
      return "Fecha inválida";
    }
  },

  formatoHoraMinutos: function (minutos) {
    try {
      const minutosValue = parseInt(minutos);

      if (isNaN(minutosValue)) {
        throw new Error("Minutos no válidos");
      }

      const horas = Math.floor(minutosValue / 60);
      const minutosRestantes = minutosValue % 60;

      let resultado = "";

      if (horas !== 0) {
        resultado += `${horas} horas`;
      }

      if (minutosRestantes !== 0) {
        if (resultado !== "") {
          resultado += " y ";
        }
        resultado += `${minutosRestantes} minutos`;
      }

      return resultado || "0 minutos"; // Si no hay horas ni minutos, mostrar '0 minutos'
    } catch (error) {
      console.error('Error en la función "formatoHoraMinutos":', error.message);
      return "Minutos inválidos";
    }
  },

  formatoHora12Horas: function (hora24) {
    try {
      // Divide la hora en horas y minutos
      const [horas, minutos] = hora24.split(":");
      const horasInt = parseInt(horas);
      const periodo = horasInt >= 12 ? "PM" : "AM";
      const horas12 = horasInt > 12 ? horasInt - 12 : horasInt;
      const horaFormateada = `${horas12}:${minutos} ${periodo}`;
      return horaFormateada;
    } catch (error) {
      console.error('Error en la función "formatoHora12Horas":', error.message);
      return "Hora inválida";
    }
  },

  trimString: function (string) {
    try {
      if (typeof input === "string") {
        return input.trim();
      }
      return input;
    } catch (error) {
      console.error('Error en la función "trimString":', error.message);
      return "Texto inválido";
    }
  },
};

export default filtros;
