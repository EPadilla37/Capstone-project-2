$(document).ready(function () {
  /*Contacto Form*/
  $("#btnSendWA").click(function () {
    var message = $("#contactWAMessage").val();
    var whatsappURL =
      "https://wa.me/5216641283164/?text=ClubImaxess :: " +
      encodeURIComponent(message);
    if (message) window.open(whatsappURL, "_blank");
  });

  $("#btnSendMessage").on("click", function (event) {
    if ($("#formContact")[0].checkValidity()) {
      var formData = $("#formContact").serialize();
      $.ajax({
        type: "POST",
        url: "/dashboard/sendMessage",
        data: formData,
        success: function (response) {
          $("#msgNotifyHome").html(response.msg).fadeIn().delay(3000).fadeOut();
          if (response.status == 200) {
            $("#formContact")[0].reset();
          }
        },
        error: function (error) {
          console.error(error);
        },
      });
    } else {
      $("#formContact")[0].reportValidity();
    }
  });
});
