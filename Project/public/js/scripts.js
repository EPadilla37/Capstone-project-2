$(document).ready(function () {
  const sidebarToggle = $("#sidebarToggle");
  sidebarToggle.on("click", function (event) {
    event.preventDefault();
    $("body").toggleClass("sb-sidenav-toggled");
    localStorage.setItem(
      "sb|sidebar-toggle",
      $("body").hasClass("sb-sidenav-toggled")
    );
  });

  const elementosSidebar = $(".list-group-item");
  elementosSidebar.click(function (event) {
    elementosSidebar.removeClass("active");
    $(this).addClass("active");
  });

  $(".media-bg").animate(
    {
      top: 0,
      opacity: 1,
    },
    2500
  );

  // Oculta el botón al principio
  $("#scroll-to-top").hide();

  // Muestra u oculta el botón cuando se desplaza
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $("#scroll-to-top").fadeIn();
    } else {
      $("#scroll-to-top").fadeOut();
    }
  });

  // Desplaza la página hacia arriba cuando se hace clic en el botón
  $("#scroll-to-top").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });
});
