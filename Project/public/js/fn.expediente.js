/* Funciones utilizadas en modulo de EXPEDIENTE */

$(document).ready(function () {
  /* Esta función maneja la búsqueda y filtrado de elementos en una tabla. */
  $("#btnSearch").click(function () {
    //console.log($("#inputSearch").val());
    var inputTexto = $("#inputSearch").val().toLowerCase();
    $("tbody tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(inputTexto) > -1);
    });
  });

  $(document).on("click", ".getLinkReporte", function (e) {
    try {
      const solicitud = $(this).data("idsolicitud");
      const estudio = $(this).data("idestudio");

      if (solicitud && estudio) {
        generarInforme(solicitud, estudio);
      } else {
        console.error("Solicitud or Estudio is undefined.");
      }
    } catch (error) {
      console.error("Error in click event handler:", error);
    }
  });

  const searchInput = $("#inputSearch");
  const tblEstudios = $("#tbEstudios");
  const noResultsMessage = $("#noResultsMessage");

  searchInput.on("input", async function () {
    const searchTerm = searchInput.val().trim();
    tblEstudios.empty();
    noResultsMessage.hide();

    if (searchTerm.length >= 2 || searchTerm.length === 0) {
      try {
        const results = await fetchSearchResults(searchTerm);
        if (results.length > 0) {
          renderResults(results, tblEstudios);
        } else {
          noResultsMessage.show();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  });

  async function fetchSearchResults(searchTerm) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          `/dashboard/getFilteredPatientData?searchTerm=${searchTerm}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          resolve(data);
        } else {
          reject(new Error("Response not OK"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  function renderResults(results, table) {
    for (const row of results) {
      const newRow = $("<tr>")
        .append($("<td>").addClass("text-center").text(row.id_cita))
        .append($("<td>").text(row.fullName))
        .append($("<td>").text(row.estudio))
        .append($("<td>").text(row.fecha))
        .append(
          $("<td>")
            .addClass("td-actions text-right")
            .attr("data-events", "operateEvents")
            .attr("data-formatter", "operateFormatter")
            .append(
              $("<a>")
                .attr("rel", "tooltip")
                .attr("title", "Ver Online")
                .addClass("btn btn-link btn-info link_white table-action link")
                .attr("href", row.viewer_url)
                .attr("id", `link${row.id_paciente}`)
                .attr("name", `link${row.id_paciente}`)
                .attr("target", "_blank")
                .attr("data-original-title", "Ver")
                .append($("<i>").addClass("fa fa-eye"))
            )
            .append(
              $("<a>")
                .attr("rel", "tooltip")
                .attr("title", "Copiar Link")
                .addClass(
                  "btn btn-link btn-warning link_white table-action copy"
                )
                .attr("id", "copyButton")
                .attr("href", "#")
                .attr("data-original-title", "Copiar")
                .append($("<i>").addClass("fa fa-copy"))
            )
            .append(
              $("<a>")
                .attr("rel", "tooltip")
                .attr("title", "Ver Reporte")
                .addClass(
                  "btn btn-link btn-primary link_white table-action open getLinkReporte"
                )
                .attr("id", `reporte${row.id_paciente}`)
                .attr("name", `reporte${row.id_paciente}`)
                .attr("data-idSolicitud", row.id_cita)
                .attr("data-idEstudio", row.id_estudio)
                .append($("<i>").addClass("fa fa-file-text"))
            )
        );

      table.append(newRow);
    }
  }

  $("#shareWA").on("click", function (e) {
    console.log("inside");
  });

  function generarInforme(idSolicitud, idEstudio) {
    // Crear un formulario temporal
    const $form = $("<form>")
      .attr("method", "post")
      .attr("action", "/dashboard/generar-reporte")
      .attr("target", "_blank");

    // Agregar los campos ocultos al formulario
    $("<input>")
      .attr("type", "hidden")
      .attr("name", "idSolicitud")
      .val(idSolicitud)
      .appendTo($form);
    $("<input>")
      .attr("type", "hidden")
      .attr("name", "idEstudio")
      .val(idEstudio)
      .appendTo($form);

    $form.appendTo("body").submit();
  }

  function copyToClipboard(idInput) {
    var url = $("#link" + idInput).attr("href");
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(url).select();
    document.execCommand("copy");
    $temp.remove();
  }
});
