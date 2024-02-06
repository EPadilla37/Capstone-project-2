$(document).ready(function () {
  const $searchBox = $("#searchBox");
  const $tblSearchPacientes = $("#tblSearchPacientes");
  const $modalLoader = $("#modal-loader");

  let searchTerm = "";

  if ($searchBox.length && $modalLoader.length) {
    // When the modal is shown, immediately perform the search
    $("#modalSearch").on("show.bs.modal", async function () {
      try {
        $modalLoader.css("display", "block");

        const response = await fetch("/agenda/search?criteria=nombre");
        if (response.ok) {
          const results = await response.json();
          renderResults(results, $tblSearchPacientes);
        } else {
          console.error("Response not OK");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        $modalLoader.css("display", "none");
      }
    });

    // Click event handler for selecting a patient
    $tblSearchPacientes.on("click", ".modal-agenda-row", async function () {
      const result = $(this).data("result");

      try {
        const detailedResponse = await fetch(`/agenda/getPatientById?patientId=${result.id}`);
        if (detailedResponse.ok) {
          const detailedPatientInfo = await detailedResponse.json();

          // Populate input fields
          $("#txtIDPacienteSearch").val(result.id);
          $("#txtIDPaciente").val(result.id);
          $("#wz_new_nombre").val(detailedPatientInfo.nombre);
          $("#wz_new_apaterno").val(detailedPatientInfo.apellido_paterno);
          $("#wz_new_amaterno").val(detailedPatientInfo.apellido_materno);
          $("#wz_new_sexo").val(detailedPatientInfo.sexo);
          $("#wz_new_fecnac").val(detailedPatientInfo.fecha_nacimiento);
          $("#wz_new_primeravez").val("NO");

          // Automatically select the correct value for 'sexo' select element
          const $sexoSelect = $("#wz_new_sexo");
          $sexoSelect.val(detailedPatientInfo.sexo);

          // Close the modal
          $("#modalSearch").modal("hide");
        } else {
          console.error("Response not OK");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }

  function renderResults(results, resultsTbody) {
    resultsTbody.html(""); // Clear previous results
    $.each(results, function (index, result) {
      const row = $("<tr></tr>").addClass("modal-agenda-row").data("result", result);

      const idCell = $("<td></td>");
      const nombreCell = $("<td></td>");
      const fechaNacimientoCell = $("<td></td>");

      idCell.text(result.id);
      nombreCell.text(result.nombre);
      fechaNacimientoCell.text(result.fecha_nacimiento);

      row.append(idCell, nombreCell, fechaNacimientoCell);
      resultsTbody.append(row);
    });
  }
});

/* ----------------------------------------------------------------  "Boton para Paso 2: Estudios"   ----------------------------------------------------------------------------------*/

$(document).ready(function () {
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
});
