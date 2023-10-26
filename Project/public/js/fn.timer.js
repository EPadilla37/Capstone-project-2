let timer = null;

const Timer = {
  timerRunning: false,
  startCallback: null, // callback se inicia el temporizador
  stopCallback: null, // callback se detiene el temporizador
  timerStart: function () {
    if (!this.timerRunning) {
      let tiempoRestante = 120;

      const actualizarTemporizador = () => {
        if (tiempoRestante <= 0) {
          Timer.timerStop(true);
          $("#mdlConfirmAppointment").modal("hide");
        } else {
          var minutos = Math.floor(tiempoRestante / 60);
          var segundos = tiempoRestante % 60;
          var tiempoRestanteFormatado = "";

          if (tiempoRestante >= 60) {
            tiempoRestanteFormatado =
              minutos + " min " + (segundos < 10 ? "0" : "") + segundos + " s";
          } else if (tiempoRestante > 29) {
            $("#timer").removeClass("red-clock");
            $("#timer").addClass("orange-clock");
            tiempoRestanteFormatado = segundos + " s";
          } else {
            $("#timer").removeClass("orange-clock");
            $("#timer").addClass("red-clock");
            tiempoRestanteFormatado = segundos + " s";
          }
          $("#timerCount").text(tiempoRestanteFormatado);
          tiempoRestante--;

          // Configurar el siguiente temporizador
          timer = setTimeout(actualizarTemporizador, 1000);
        }
      };

      // Ejecutar el callback de inicio si está definido
      if (typeof this.startCallback === "function") {
        this.startCallback();
      }

      // Iniciar el primer temporizador
      actualizarTemporizador();

      this.timerRunning = true;
    }
  },

  timerStop: function (modal = false) {
    clearTimeout(timer); // Detener el temporizador utilizando clearTimeout
    timer = null;
    this.timerRunning = false;
    $("#timer").removeClass("red-clock orange-clock");

    // Ejecutar el callback de detención si está definido
    if (typeof this.stopCallback === "function") {
      this.stopCallback();
    }

    if (modal) {
      $("#btnModalConfirmar").prop("disabled", true);
      $("#btnModalCancel").prop("disabled", true);
      $("#endtime").modal({ backdrop: "static", keyboard: false });
      $("#endtime").modal("show");
    }
  },
};
