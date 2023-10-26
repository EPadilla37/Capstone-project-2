$(document).ready(function () {
  agendaCita.initFlatPickr();
  $("#btnCancelarCita").on("click", function () {
    agendaCita.clearSession();
  });

  $("#btnUpdateProfile").on("click", function (event) {
    event.preventDefault();
    const formData = $("#formProfile").serialize();
    const idPersona = $("#txtIdPersona").val();
    $.ajax({
      type: "PUT",
      url: `/dashboard/updateProfile/${idPersona}`,
      data: formData,
      success: function (response) {
        $("#msgNotifyHome").html(response.msg).fadeIn().delay(2500).fadeOut();
      },
      error: function (error) {
        console.log(error);
      },
    });
  });

  /*Validar Disponibiidad*/
  $(document).on(
    "click",
    "#tblDisponibilidad #tbodyHorasDisponibles .tdENABLE",
    function (e) {
      agendaCita.validateAvailability(
        $(this).attr("data-position"),
        $(this).attr("data-time")
      );
    }
  );

  $("#mdlConfirmAppointment").on("hidden.bs.modal", function () {
    //agendaCita.cancelAppointment();
  });

  $("#btnConfirmarCita").click(function () {
    console.log("Paso 3 :: Modal :: Confirmar Cita");
  });

  $("#btnEndTime").click(function () {
    console.log("Paso 3 :: Timer :: Cita Cancelada");
    agendaCita.cancelAppointment();
    Timer.timerStop();
  });

  $("#btnModalConfirmar").on("click", function () {
    $(this).addClass("disabled");
    $("#btnModalCancel").addClass("disabled");
    agendaCita
      .finishAppointment($("#idNewCita").val())
      .then(function (result) {
        if (result.status == 200) {
          $("#msgNotifyHome")
            .html(result.msg)
            .fadeIn()
            .delay(2500)
            .fadeOut(function () {
              $("#mdlConfirmAppointment").modal("hide");
              agendaCita.clearSession();
            });
        }
      })
      .catch(function (error) {
        $(this).removeClass("disabled");
        $("#btnModalCancel").removeClass("disabled");
        console.log(error);
      });
  });

  $("#btnModalCancel").on("click", function () {
    $(this).addClass("disabled");
    $("#btnModalConfirmar").addClass("disabled");
    agendaCita
      .cancelNewAppointment($("#idNewCita").val())
      .then(function (result) {
        if (result.status == 200) {
          Timer.stopCallback = function () {
            $("#btnModalCancel").removeClass("disabled");
            $("#btnModalConfirmar").removeClass("disabled");
            $("#mdlConfirmAppointment").modal("hide");
          };
          Timer.timerStop();
          $("#msgNotifyHome").html(result.msg).fadeIn().delay(2500).fadeOut();
        }
      })
      .catch(function (error) {
        $("#btnModalCancel").removeClass("disabled");
        $("#btnModalConfirmar").removeClass("disabled");
        console.log(error);
      });
  });
});

agendaCita = {
  initFlatPickr: () => {
    $("#dpAgendarCita").flatpickr({
      inline: true,
      dateFormat: "Y-m-d", // Formato de fecha deseado
      //minDate: new Date(), // Fecha mínima seleccionable
      locale: "es", // Idioma español
      disable: [
        function (date) {
          // Deshabilitar fechas en función de una función personalizada
          return date.getDay() === 0; // Deshabilitar los domingos
        },
      ],
      onReady: function (selectedDates, dateStr, instance) {
        $("#lblCurDate").text(agendaCita.formatFullDate(new Date()));

        agendaCita.getCitasAgenda($("#dateSelected").val());
      },
      onChange: function (selectedDates, dateStr, instance) {
        $("#lblCurDate").text(
          agendaCita.formatFullDate(new Date(dateStr + " 00:00:00"))
        );

        $("#dateSelected").val(dateStr);
        agendaCita.getCitasAgenda(dateStr);
      },
    });
  },

  fillHorario: function (infoCitas) {
    var $tbody = $("#tbodyHorasDisponibles");
    var horaInicio = 8;
    var horaFin = 20;
    var intervaloMinutos = 15;

    // Limpiar tbody
    $tbody.empty();

    // Generar las horas disponibles y agregarlas a la tabla
    for (var hora = horaInicio; hora <= horaFin; hora++) {
      for (var minutos = 0; minutos < 60; minutos += intervaloMinutos) {
        var horaFormateada = (hora < 10 ? "0" : "") + hora;
        var minutosFormateados = minutos === 0 ? "00" : minutos;
        var ampm = hora < 12 ? "AM" : "PM";

        // Calcular la hora en formato de 12 horas
        var hora12Format =
          (hora % 12 === 0 ? 12 : hora % 12) +
          ":" +
          minutosFormateados +
          " " +
          ampm;

        // Crear una nueva fila de tabla y celda
        var $fila = $("<tr class='hr_hora'>");
        var $celda = $("<td>");

        // Agregar la hora a la celda
        $celda.text(hora12Format);

        // Agregar la celda a la fila y la fila al tbody
        $fila.append($celda);
        $tbody.append($fila);
      }
    }
  },

  formatFullDate(date, lang = "es-ES") {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString(lang, options);
  },

  getCitaActiva: function (selectedDate) {
    if ($(".schedule_addcita").length > 0) {
      const mod = $("#idModSelected").val();
      $.ajax({
        type: "GET",
        url: `/cita/getCitasActive/${selectedDate}/${mod}`, // Hardcoded date and salaID
        success: function (citas) {
          agendaCita.fillHorario(citas);
        },
        error: function (error) {
          console.log(error);
        },
      });
    }
  },

  getCitasAgenda: function (selectedDate) {
    if ($(".schedule_addcita").length > 0) {
      $.ajax({
        type: "GET",
        url: `/cita/getCitasAgenda/${selectedDate}`,
        success: function (citas) {
          if (citas.status == 200) {
            agendaCita.fillDisponibilidad(citas.schedule_time);
          }
        },
        error: function (error) {
          console.log(error);
        },
      });
    }
  },

  checkDisponibilidad: function (selDate, selHour, duration) {
    return new Promise((resolve, reject) => {
      if ($(".schedule_addcita").length > 0) {
        $.ajax({
          type: "GET",
          url: `/cita/checkingDisponibilidad/${selDate}/${selHour}/${duration}`,
          success: function (result) {
            resolve(result);
          },
          error: function (error) {
            reject(error);
          },
        });
      }
    });
  },

  fillDisponibilidad(infoCitas) {
    const tablaHoras = $("#tbodyHorasDisponibles");
    tablaHoras.empty();
    const filas = infoCitas.map((item) =>
      $("<tr>").append(agendaCita.addRowDisponibilidad(item))
    );
    tablaHoras.append(filas);
  },

  addRowDisponibilidad(item) {
    if (!item.sch_expired) {
      return $(
        '<td id="tdPos_' +
          item.sch_startPosition +
          '" class="td' +
          item.sch_active +
          '" data-active="' +
          item.sch_active +
          '" data-position="' +
          item.sch_startPosition +
          '" data-time="' +
          item.sch_startTime +
          '">' +
          formatString.convertAMPM(item.sch_startTime) +
          "</td>"
      );
    }
  },

  incrementHour: function (time) {
    // Increment the time in HH:MM format
    const parts = time.split(":");
    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);
    minutes += 15;

    if (minutes >= 60) {
      hours += 1;
      minutes = 0;
    }

    return `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes}`;
  },

  validateAvailability: function (idPos, timePos) {
    const rspan = parseInt($("#totalTime").val(), 10) / 15;
    const pStart = parseInt(idPos, 10);
    const pEnd = pStart + parseInt(rspan, 10);

    $("#tbodyHorasDisponibles td").removeClass(
      "tdEnableToggle tdDisableToggle"
    );

    let val = true;
    let rws = "";

    for (let c = 0; c < rspan; c++) {
      if (c > 0) rws += ",";
      const ind = pStart + c;
      if (ind < 48) {
        const element = $("#tdPos_" + ind);
        const act = element.data("active");
        const pActive = pStart + c;

        if (pActive < pEnd) {
          if (act == "DISABLE") {
            val = false;
          }
          rws += "#tdPos_" + ind;
        }
      } else {
        rws += "#tdPos_" + ind;
        val = false;
      }
    }

    $("#timeSelected").val(timePos);
    const dateSel = $("#dateSelected").val();
    const duration = $("#totalTime").val();

    // VALIDAR EN SERVER LA DISPONIBILIDAD
    agendaCita
      .checkDisponibilidad(dateSel, timePos, duration)
      .then(function (result) {
        if (result.disponible) {
          $(rws).addClass("tdEnableToggle");
          return agendaCita.addNewCita();
          //agendaCita.confirmAppointment(dateSel, timePos); //modal
        } else {
          $(rws).addClass("tdDisableToggle");
          $("#btnPasoAgendar").prop("disabled", "disabled");
          throw new Error("La cita seleccionada no está disponible");
        }
      })
      .then(function (newCitaResult) {
        if (newCitaResult.status == 200) {
          $("#idNewCita").val(newCitaResult.citaId);
          agendaCita.confirmAppointment(dateSel, timePos);
          $("#msgNotifyHome")
            .html(newCitaResult.mensaje)
            .fadeIn()
            .delay(2500)
            .fadeOut();
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  },

  confirmAppointment: function (date, time) {
    //console.log("Confirm Appointment");
    $("#mdlTblDate").html(formatString.fullDayNameFormat(date, "confirm"));
    $("#mdlTblTime").html(formatString.formatTime12Hrs(date + " " + time));
    $("#mdlBodyTblEstudios").html($("#tblEstudiosSession").html());
    $("#mdlConfirmAppointment").modal({ backdrop: "static", keyboard: false });
    intervalo = null;
    Timer.startCallback = function () {
      $("#mdlConfirmAppointment").modal("show");
    };
    Timer.timerStart();
  },

  cancelAppointment() {
    Timer.stopCallback = function () {
      $("#timeSelected").val("");
      $("#tbodyHorasDisponibles td").removeClass("tdEnableToggle");
    };
    Timer.timerStop();
  },

  addNewCita: function () {
    return new Promise(function (resolve, reject) {
      //console.log("addNewCita :: Promise");
      const citaData = {
        dateSelected: $("#dateSelected").val(),
        timeSelected: $("#timeSelected").val(),
        duration: $("#totalTime").val(),
      };
      $.ajax({
        type: "POST",
        url: `/cita/addCita`,
        data: citaData,
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  },

  finishAppointment(id) {
    return new Promise(function (resolve, reject) {
      const citaData = {
        dateSelected: $("#dateSelected").val(),
        timeSelected: $("#timeSelected").val(),
      };
      $.ajax({
        type: "PUT",
        url: `/cita/confirmCita/${id}`,
        data: citaData,
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  },

  cancelNewAppointment(id) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        type: "PUT",
        url: `/cita/cancelCita/${id}`,
        success: function (result) {
          resolve(result);
        },
        error: function (error) {
          reject(error);
        },
      });
    });
  },

  clearSession() {
    $.get("/agenda/clearSession", function (response) {
      if (response === "OK") {
        localStorage.removeItem("currModalidad");
        window.location.href = "/dashboard/agendar";
      } else {
        console.log("Error clearing sessions");
      }
    });
  },
};
