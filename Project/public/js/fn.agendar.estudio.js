/*Se cambia por lo que hay en agendaFunctions.js */
$(document).ready(function () {
  const ddlModalidades = $("#ddlModalidades");
  const modalidadDefault = $("#defaultModalidadOption");
  const ddlEstudios = $("#ddlEstudios");
  const table = $("#tblEstudios");
  const lbDuracion = $("#lbDuracion");
  const lbCosto = $("#lbCosto");
  const totalTiempo = $("#totalTiempo");
  const totalPrecio = $("#totalPrecio");

  let selectedModalidadId;
  let selectedModalidadData;
  let selectedEstudio = null;
  let estudios = [];
  let isModalidadLocked = false;

  //borrar tblEstudios Body
  $("#tblEstudios").empty();

  //btnPasoAgendar  -  Hide
  $("#btnPasoAgendar").hide();
  $("#addEstudio").hide();

  let currEstudio;
  let currModalidad; // mantiene nombre pero hace referencia a Sala

  // Retrieve currModalidad from local storage if available
  currModalidad = JSON.parse(localStorage.getItem("currModalidad")) || null;

  function saveCurrModalidadToLocalStorage() {
    // Save currModalidad to local storage
    localStorage.setItem("currModalidad", JSON.stringify(currModalidad));
  }

  function removeCurrModalidadFromLocalStorage() {
    // Remove currModalidad from local storage
    localStorage.removeItem("currModalidad");
    $("#btnPasoAgendar").hide();
    ddlEstudios.empty();
    ddlEstudios.append(addDefaultOption("SELECCIONAR ESTUDIO"));
    $("#addEstudio").hide();
    currEstudio = "";
    $("#totalTiempo, #totalPrecio, #lbDuracion, #lbCosto").text("");
  }

  function fetchEstudiosWithModalidadId(modalidadId) {
    $.get(`/agenda/estudios/${modalidadId}`, function (data) {
      estudios = data;
      estudios.forEach(function (estudio) {
        const option = $("<option>")
          .val(estudio.est_descripcion)
          .text(estudio.est_descripcion);
        ddlEstudios.append(option);
      });
    });
  }

  function fetchEstudiosWithSalaId(salaId) {
    ddlEstudios.empty();
    ddlEstudios.append(addDefaultOption("SELECCIONAR ESTUDIO"));

    $.get(`/agenda/estudiosdisponibles/${salaId}`, function (estudios) {
      estudios.forEach(function (estudio) {
        const option = $("<option>")
          .val(estudio.est_id_estudio)
          .text(estudio.est_descripcion);
        ddlEstudios.append(option);
        $("#addEstudio").show();
      });
    });
  }

  function addEstudioToTable(estudio) {
    const dataToSend = {};
    if (estudio && currModalidad) {
      dataToSend.estudio = estudio;
      dataToSend.sala = currModalidad;
    }

    $.post("/agenda/addEstudio", dataToSend, function (response) {
      if (response === "OK") {
        fetch("/agenda/getEstudio")
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((estudiosInSession) => {
            renderEstudiosTable(estudiosInSession);

            $.get("/agenda/addTotal", function (response) {
              totalTiempo.text(
                "Tiempo en Sala : " +
                  formatString.convertMinutesToHours(response.totalDuracion)
              );
              totalPrecio.text(
                "Total : " +
                  formatString.formatCurrency(parseFloat(response.totalPrecio))
              );
            });
          })
          .catch((error) => {
            console.error("Error fetching estudios from session:", error);
          });
      } else {
        console.log("Error");
      }
    });
  }

  function renderEstudiosTable(estudiosInSession) {
    const table = $("#tblEstudios");
    table.empty();
    if (estudiosInSession) {
      estudiosInSession.estudios.forEach((estudio) => {
        const newRow = $("<tr>");
        newRow.append($("<td>").text(estudio.descripcion));
        newRow.append(
          $("<td>").text(formatString.convertMinutesToHours(estudio.duracion))
        );
        newRow.append(
          $("<td>").text(
            formatString.formatCurrency(parseFloat(estudio.precio))
          )
        );
        newRow.append(
          $("<td>").html(
            '<button type="button" class="btn btn-danger btn-sm btn-remove"><i class="fas fa-trash-alt"></i></button>'
          )
        );
        $("#btnPasoAgendar").show();
        table.append(newRow);
      });
    }
  }

  function fetchSalasActivas() {
    ddlModalidades.empty();

    //default option
    ddlModalidades.append(addDefaultOption("SELECCIONAR MODALIDAD"));

    $.get("/agenda/salas", function (salas) {
      salas.forEach(function (sala) {
        const option = $("<option>")
          .val(sala.sal_id_sala)
          .text(`${sala.sal_prefijo} - ${sala.sal_descripcion}`);
        ddlModalidades.append(option);
      });
    });
  }

  function updateEstudioDetails(response) {
    if (response) {
      lbDuracion.text(formatString.convertMinutesToHours(response.duracion));
      lbCosto.text(formatString.formatCurrency(parseFloat(response.precio)));
    } else {
      lbDuracion.text("NA");
      lbCosto.text("NA");
    }
  }

  function initEstudios() {
    $.get("/agenda/salaActive", function (sala) {
      if (sala.result !== "NA") {
        ddlModalidades.empty();
        ddlModalidades.append(
          $("<option>", {
            value: sala,
            text: sala,
          })
        );
        ddlModalidades.prop("disabled", true);
        $("#lockedModalidad").show();
      } else {
        ddlModalidades.show();
        ddlModalidades.prop("disabled", false);
        modalidadDefault.val("SELECCIONAR MODALIDAD");
        fetchSalasActivas();
      }
    });

    fetch("/agenda/getEstudio")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((estudiosInSession) => {
        const modalidadExists =
          estudiosInSession.modalidades;
        if (modalidadExists) {
          const modalidadDescripcion = currModalidad
            ? currModalidad.descripcion
            : estudiosInSession.modalidades[0].descripcion;
          ddlModalidades.empty();
          ddlModalidades.append(
            $("<option>", {
              value: modalidadDescripcion,
              text: modalidadDescripcion,
            })
          );

          $.get("/agenda/addTotal", function (response) {
            totalTiempo.text(
              formatString.convertMinutesToHours(response.totalDuracion)
            );
            totalPrecio.text(
              formatString.formatCurrency(parseFloat(response.totalPrecio))
            );
          });

          isModalidadLocked = true;
          ddlModalidades.prop("disabled", true);
        } else {
          ddlModalidades.show();
          ddlModalidades.prop("disabled", false);
          modalidadDefault.val("SELECCIONAR MODALIDAD");
          fetchSalasActivas();
        }

        renderEstudiosTable(estudiosInSession);
        if (modalidadExists) {
          fetchEstudiosWithSalaId(estudiosInSession.modalidades.id);
        }
      })
      .catch((error) => {
        console.error("Error fetching data from session:", error);
      });
  }

  $("#addEstudio").on("click", function () {
    if (currEstudio) {
      addEstudioToTable(currEstudio);
      isModalidadLocked = true;
      ddlModalidades.prop("disabled", true);
    }
  });

  ddlModalidades.on("change", function () {
    const idSala = $(this).val();
    if (idSala !== "") {
      currModalidad = {
        id: idSala,
        descripcion: $(this).find("option:selected").text(),
      };

      ddlEstudios.empty();
      fetchEstudiosWithSalaId(idSala);
      // Save currModalidad to local storage
      saveCurrModalidadToLocalStorage();
    }
  });

  ddlEstudios.on("change", function () {
    const optSelected = $(this).find("option:selected");
    if (optSelected.val()) {
      const estId = optSelected.val();

      $.get(`/agenda/estudioSeleccionado/${estId}`, function (response) {
        if (response) {
          currEstudio = response;
          updateEstudioDetails(currEstudio);
        } else {
          console.error("No se agrago estudio");
        }
      });
    }
  });

  $("#btnEmpty").on("click", function () {
    $("#tblEstudios").empty();
    // Delete Session
    $.get("/agenda/clearSession", function (response) {
      if (response === "OK") {
        console.log("inside btnEmpty");
        ddlModalidades.show();
        $("#lockedModalidad").hide();
        ddlModalidades.prop("disabled", false);
        ddlModalidades.val("SELECCIONAR MODALIDAD");
        currModalidad = null; 
        localStorage.removeItem("currModalidad"); 
        fetchSalasActivas(); 
        // ddlEstudios.empty(); 
      } else {
        console.log("Error clearing sessions");
      }
    });
  });
  

  $("#tblEstudios").on("click", ".btn-remove", function () {
    const row = $(this).closest("tr");
    const estudioDescripcion = row.find("td:nth-child(1)").text();

    const rowCountBeforeRemoval = $("#tblEstudios tr").length; // Get the row count before removal

    $.post(
      "/agenda/removeEstudio",
      { estudio: { descripcion: estudioDescripcion } },
      function (response) {
        if (response === "OK") {
          row.remove();
          $.get("/agenda/addTotal", function (response) {
            totalTiempo.text(
              formatString.convertMinutesToHours(response.totalDuracion)
            );
            totalPrecio.text(
              formatString.formatCurrency(parseFloat(response.totalPrecio))
            );

            const rowCountAfterRemoval = $("#tblEstudios tr").length;
            // Check if all rows have been removed
            if (rowCountBeforeRemoval === 1 && rowCountAfterRemoval === 0) {
              clearSessionAndResetModalidad();
            }
          });
        } else {
          console.log("Error removing estudio");
        }
      }
    );
  });

  $("#btnCancelarEstudio").on("click", function () {
    // Clear the session data on the server-side
    $.get("/agenda/clearSession", function (response) {
      if (response === "OK") {
        localStorage.removeItem("currModalidad");
        window.location.href = "/dashboard/agendar"; 
      } else {
        console.log("Error clearing sessions");
      }
    });
  });

  $()

  function clearSessionAndResetModalidad() {
    $.get("/agenda/clearSession", function (response) {
      if (response === "OK") {
        ddlModalidades.show();
        $("#lockedModalidad").hide();
        ddlModalidades.prop("disabled", false);
        ddlModalidades.val("SELECCIONAR MODALIDAD");
        //location.reload();
        initEstudios();
      } else {
        console.log("Error clearing sessions");
      }

      // Remove currModalidad from local storage
      removeCurrModalidadFromLocalStorage();
    });
  }

  function addDefaultOption(text) {
    const defOption = $("<option>")
      .val("")
      .text(`  ${text}  `)
      .prop("disabled", true)
      .prop("selected", true);

    return defOption;
  }

  initEstudios();
});

$(document).ready(function () {
  const imageSlider = $(".image-slider");
  const confirmButton = $("#btnModalConfirmar");
  const acceptButton = $("#btnCitaTest");
  const checkboxIndicaciones = $("#checkboxIndicaciones");
  const modalImage = $("#mdlImage"); 

  const imageModal = $("#imageModal"); 
  const imageContainer = $("#imageContainer"); 

  imageModal.modal({
    backdrop: "static",
    keyboard: false,
  });

  $("#btnModalCancel").on("click", function () {
    $("#imageModal").modal("hide");
  });

  function openImageModal() {
    $("#imageModal").modal("show");
  }

  function updateConfirmButtonState() {
    if (checkboxIndicaciones.prop("checked")) {
      confirmButton.prop("disabled", false); 
      confirmButton.removeClass("btn-secondary").addClass("btn-success");
    } else {
      confirmButton.prop("disabled", true); 
      confirmButton.removeClass("btn-success").addClass("btn-secondary"); 
    }
  }

  checkboxIndicaciones.on("change", function () {
    updateConfirmButtonState();
  });

  confirmButton.on("click", function (e) {
    if (confirmButton.prop("disabled")) {
      e.preventDefault(); 
    }
  });

  $("#btnPasoAgendar").on("click", function () {
    openImageModal();
    $.get(`/agenda/getIndicaciones`, function (imageUrls) {
      displayImages(imageUrls);
    });
    updateConfirmButtonState();
  });

  function displayImages(imageUrlsArray) {
    imageSlider.empty();
    imageContainer.empty(); 

    imageUrlsArray.forEach((imageUrls) => {
      imageUrls.forEach((imageUrl) => {
        const img = $("<img>")
          .attr("src", imageUrl.ind_url)
          .addClass("img-fluid");
        imageContainer.append(img); 
      });
    });
  }
});


